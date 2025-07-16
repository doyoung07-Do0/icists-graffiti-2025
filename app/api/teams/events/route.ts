import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sseClients } from '@/lib/sse';

export async function GET(request: NextRequest) {
  // Extract query parameters
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team') || 'admin';
  const round = searchParams.get('round') || 'r1';

  // Get client IP and user agent for logging
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Create unique client ID
  const clientId = `${team}-${round}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add client to the set of connected clients
      const client = {
        id: clientId,
        controller,
        team,
        round,
        ip,
        userAgent,
        connectedAt: new Date(),
      };

      sseClients.add(client);

      console.log(
        `[${new Date().toISOString()}] New SSE connection: ${clientId} (${team}, ${round}) from ${ip}`,
      );

      // Send initial connection message
      const initialMessage = {
        type: 'connected',
        clientId,
        team,
        round,
        timestamp: new Date().toISOString(),
      };

      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify(initialMessage)}\n\n`),
      );

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log(
          `[${new Date().toISOString()}] Client disconnected: ${clientId}`,
        );
        sseClients.delete(client);
        controller.close();
      });
    },
  });

  // Return SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
