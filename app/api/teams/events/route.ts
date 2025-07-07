import { NextResponse } from 'next/server';

// Store connected clients
const clients = new Set<{
  id: string;
  controller: ReadableStreamDefaultController;
  team: string;
  round: string;
  ip: string | null;
  userAgent: string | null;
  connectedAt: Date;
}>();

// Send message to all connected clients for a specific team and round
export function sendTeamUpdate(team: string, round: string, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const clientsToRemove: string[] = [];
  let sentCount = 0;
  const now = new Date().toISOString();
  
  console.log(`[${now}] Broadcasting update to team ${team}, round ${round}`, data);

  clients.forEach((client) => {
    try {
      // Send to both the specific team and admin clients
      if ((client.team === team || client.team === 'admin') && client.round === round) {
        console.log(`[${now}] Sending to client ${client.id} (${client.ip}) [team: ${client.team}]`);
        client.controller.enqueue(new TextEncoder().encode(message));
        sentCount++;
      }
    } catch (error) {
      console.error(`[${now}] Error sending to client ${client.id}:`, error);
      clientsToRemove.push(client.id);
    }
  });

  // Clean up any broken connections
  clientsToRemove.forEach(id => {
    const client = Array.from(clients).find(c => c.id === id);
    if (client) {
      client.controller.close();
      clients.delete(client);
    }
  });

  console.log(`Sent update to ${sentCount} clients for team ${team}, round ${round}`);
  return sentCount;
}

// Keep track of active connections
let connectionCount = 0;

// Clean up dead connections periodically
setInterval(() => {
  const now = new Date();
  const deadConnections = Array.from(clients).filter(client => {
    // Consider a connection dead if it's older than 2 hours
    return (now.getTime() - client.connectedAt.getTime()) > 2 * 60 * 60 * 1000;
  });

  deadConnections.forEach(client => {
    console.log(`Cleaning up dead connection: ${client.id}`);
    try {
      client.controller.close();
    } catch (error) {
      console.error('Error closing dead connection:', error);
    }
    clients.delete(client);
  });
}, 5 * 60 * 1000); // Check every 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  const round = searchParams.get('round');
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  console.log(`New SSE connection: team=${team}, round=${round}, ip=${clientIp}, user-agent=${userAgent}`);

  if (!team || !round) {
    console.error('Missing team or round parameter');
    return new NextResponse('Missing team or round parameter', { status: 400 });
  }

  // Set headers for SSE
  const headers = new Headers();
  headers.set('Content-Type', 'text/event-stream');
  headers.set('Cache-Control', 'no-cache, no-transform');
  headers.set('Connection', 'keep-alive');
  headers.set('Content-Encoding', 'none');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('X-Accel-Buffering', 'no'); // Disable buffering in Nginx

  try {
    const stream = new ReadableStream({
      start(controller) {
        const clientId = `${Date.now()}-${++connectionCount}`;
        const client = {
          id: clientId,
          controller,
          team,
          round,
          ip: clientIp,
          userAgent,
          connectedAt: new Date()
        };

        console.log(`Client connected: ${clientId} (${client.ip})`);
        clients.add(client);

        // Send initial connection message
        const sendConnected = () => {
          try {
            controller.enqueue(
              new TextEncoder().encode(
                `event: connected\ndata: ${JSON.stringify({ 
                  type: 'connected',
                  clientId,
                  timestamp: new Date().toISOString()
                })}\n\n`
              )
            );
            console.log(`Sent connected event to client ${clientId}`);
          } catch (error) {
            console.error('Error sending connected event:', error);
          }
        };

        // Send initial ping to keep connection alive
        const pingInterval = setInterval(() => {
          try {
            // Send both a comment and a proper SSE message
            const now = new Date().toISOString();
            const pingMessage = `event: ping\ndata: ${JSON.stringify({ type: 'ping', timestamp: now })}\n\n`;
            controller.enqueue(new TextEncoder().encode(pingMessage));
            console.log(`[${now}] Sent ping to client ${clientId}`);
          } catch (error) {
            console.error('Error sending ping:', error);
            clearInterval(pingInterval);
          }
        }, 5000); // Send ping every 5 seconds for better reliability during development

        // Clean up on client disconnect
        const cleanup = () => {
          console.log(`Client disconnected: ${clientId}`);
          clearInterval(pingInterval);
          clients.delete(client);
          try {
            controller.close();
          } catch (error) {
            console.error('Error during cleanup:', error);
          }
        };

        // Handle client disconnect
        request.signal.addEventListener('abort', cleanup);

        // Send initial connected message
        sendConnected();
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Error setting up SSE stream:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Helper function to get connection stats
export function getConnectionStats() {
  return {
    totalConnections: clients.size,
    connectionsByTeam: Array.from(clients).reduce((acc, client) => {
      acc[client.team] = (acc[client.team] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    connectionsByRound: Array.from(clients).reduce((acc, client) => {
      acc[client.round] = (acc[client.round] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
