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

// Send round status updates to all connected clients
export function broadcastRoundStatusUpdate(round: string, status: 'locked' | 'open' | 'closed') {
  const now = new Date().toISOString();
  const message = {
    type: 'round_status_updated',
    round,
    status,
    timestamp: now
  };

  console.log(`[${now}] Broadcasting round status update:`, message);
  
  // Send to admin clients (they listen to specific rounds)
  const adminSent = sendTeamUpdate('admin', round, message);
  
  // Get all unique team names (excluding admin)
  const allTeams = new Set(
    Array.from(clients)
      .filter(c => c.team && c.team !== 'admin')
      .map(c => c.team as string)
  );
  
  let totalSent = adminSent;
  
  // Send to all team clients
  allTeams.forEach(team => {
    // Send to clients listening to this specific round
    totalSent += sendTeamUpdate(team, round, message);
    
    // Also send to clients listening to 'all' rounds
    totalSent += sendTeamUpdate(team, 'all', message);
  });

  console.log(`[${now}] Sent round status update to ${totalSent} clients for round ${round}`);
  return totalSent;
}

// Keep track of active connections
let connectionCount = 0;

// Clean up dead connections periodically
setInterval(() => {
  const now = new Date();
  const deadClients = Array.from(clients).filter(client => {
    // Consider a client dead if we haven't heard from them in 2 minutes
    const isDead = now.getTime() - client.connectedAt.getTime() > 2 * 60 * 1000;
    if (isDead) {
      console.log(`Client ${client.id} (${client.ip}) [team: ${client.team}, round: ${client.round}] marked as dead - last seen at ${client.connectedAt.toISOString()}`);
    }
    return isDead;
  });

  deadClients.forEach(client => {
    console.log(`Cleaning up dead client ${client.id} (last seen at ${client.connectedAt.toISOString()})`);
    try {
      client.controller.close();
    } catch (error) {
      console.error('Error closing dead client connection:', error);
    }
    clients.delete(client);
  });
  
  // Log current connection stats periodically
  console.log(`Active connections: ${clients.size}`);
  const stats = getConnectionStats();
  console.log('Connection stats by team:', stats.connectionsByTeam);
  console.log('Connection stats by round:', stats.connectionsByRound);
}, 30000); // Check every 30 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  const round = searchParams.get('round');
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  console.log(`New SSE connection: team=${team}, round=${round}, ip=${clientIp}, user-agent=${userAgent}`);

  if (!team) {
    console.error('Missing team parameter');
    return new NextResponse('Missing team parameter', { status: 400 });
  }
  
  // If round is not provided, treat it as 'all'
  const roundToUse = round || 'all';

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
          round: roundToUse,
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
