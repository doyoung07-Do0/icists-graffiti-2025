import { NextResponse } from 'next/server';
import { sseClients, broadcastRoundStatusUpdate, getConnectionStats } from '@/lib/sse';

type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
  team: string;
  round: string;
  ip: string | null;
  userAgent: string | null;
  connectedAt: Date;
};

// Keep track of active connections
let connectionCount = 0;

// Clean up dead connections periodically
setInterval(() => {
  const now = new Date();
  const deadClients: Client[] = [];
  
  // Find all dead clients
  sseClients.forEach(client => {
    // Consider a client dead if we haven't heard from them in 2 minutes
    const isDead = now.getTime() - client.connectedAt.getTime() > 2 * 60 * 1000;
    if (isDead) {
      console.log(`Marking client ${client.id} as dead (last seen: ${client.connectedAt.toISOString()})`);
      deadClients.push(client);
    }
  });

  // Clean up dead clients
  deadClients.forEach(client => {
    try {
      client.controller.close();
    } catch (error) {
      console.error('Error closing dead client connection:', error);
    }
    sseClients.delete(client);
  });
  
  // Log current connection stats periodically
  console.log(`Active connections: ${sseClients.size}`);
  
  if (sseClients.size > 0) {
    // Calculate connection stats
    const stats = {
      connectionsByTeam: Array.from(sseClients).reduce((acc: Record<string, number>, client) => {
        acc[client.team] = (acc[client.team] || 0) + 1;
        return acc;
      }, {}),
      connectionsByRound: Array.from(sseClients).reduce((acc: Record<string, number>, client) => {
        acc[client.round] = (acc[client.round] || 0) + 1;
        return acc;
      }, {})
    };
    
    console.log('Connection stats by team:', stats.connectionsByTeam);
    console.log('Connection stats by round:', stats.connectionsByRound);
  }
}, 30000); // Check every 30 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team') || 'unknown';
  const round = searchParams.get('round') || 'all';
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
  const userAgent = request.headers.get('user-agent') || null;

  // Ensure required parameters are present
  if (!team) {
    return new NextResponse('Missing team parameter', { status: 400 });
  }

  console.log(`New SSE connection: team=${team}, round=${round}, ip=${clientIp}, user-agent=${userAgent}`);

  // Create a new SSE connection
  const stream = new ReadableStream({
    start(controller) {
      const clientId = `${Date.now()}-${++connectionCount}`;
      
      // Add the client to our clients set
      const client: Client = {
        id: clientId,
        controller,
        team,
        round,
        ip: clientIp,
        userAgent,
        connectedAt: new Date()
      };
      sseClients.add(client);

      console.log(`Client connected: ${clientId} (${clientIp})`);

      // Send initial connection message
      const sendConnected = () => {
        try {
          const now = new Date().toISOString();
          const connectedMessage = `event: connected\ndata: ${JSON.stringify({ 
            type: 'connected',
            clientId,
            timestamp: now
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(connectedMessage));
          console.log(`Sent connected event to client ${clientId}`);
        } catch (error) {
          console.error('Error sending connected event:', error);
        }
      };

      // Send initial ping to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          const now = new Date().toISOString();
          const pingMessage = `event: ping\ndata: ${JSON.stringify({ type: 'ping', timestamp: now })}\n\n`;
          controller.enqueue(new TextEncoder().encode(pingMessage));
        } catch (error) {
          console.error('Error sending ping:', error);
          clearInterval(pingInterval);
        }
      }, 30000); // Send ping every 30 seconds

      // Clean up on connection close
      const cleanup = () => {
        console.log(`Client disconnected: ${clientId}`);
        clearInterval(pingInterval);
        
        // Find and remove the client
        for (const client of sseClients) {
          if (client.id === clientId) {
            sseClients.delete(client);
            break;
          }
        }
        
        try {
          controller.close();
        } catch (error) {
          console.error('Error closing controller:', error);
        }
      };

      // Set up cleanup on connection close
      request.signal.addEventListener('abort', cleanup);

      // Send initial connected message
      sendConnected();
    }
  });

  // Return the SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}



// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
