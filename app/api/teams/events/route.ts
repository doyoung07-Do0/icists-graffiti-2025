import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sseClients } from '@/lib/sse';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team') || 'admin';
  const round = searchParams.get('round') || 'all';

  // Generate unique client ID
  const clientId = `${team}-${round}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Get client IP and user agent
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Set up SSE response
  const encoder = new TextEncoder();

  // Create cleanup function outside of ReadableStream
  let timeout: NodeJS.Timeout;
  let heartbeat: NodeJS.Timeout;

  const cleanup = () => {
    if (timeout) clearTimeout(timeout);
    if (heartbeat) clearInterval(heartbeat);
  };

  const stream = new ReadableStream({
    start(controller) {
      // Add client to tracking
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
        `[${new Date().toISOString()}] ✅ Client connected: ${clientId} (${team}/${round}) from ${ip}`,
      );

      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: {"type":"connected","message":"SSE connection established","clientId":"${clientId}","team":"${team}","round":"${round}"}\n\n`,
        ),
      );

      // Set up timeout to prevent Vercel function timeout (4.5 minutes to be safe)
      timeout = setTimeout(
        () => {
          controller.enqueue(
            encoder.encode(
              'data: {"type":"timeout","message":"Connection timeout - reconnecting..."}\n\n',
            ),
          );
          controller.close();
        },
        4.5 * 60 * 1000,
      ); // 4.5 minutes

      // Set up heartbeat every 30 seconds
      heartbeat = setInterval(() => {
        controller.enqueue(
          encoder.encode(
            `data: {"type":"ping","timestamp":"${new Date().toISOString()}"}\n\n`,
          ),
        );
      }, 30000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        cleanup();
        sseClients.delete(client);
        console.log(
          `[${new Date().toISOString()}] ❌ Client disconnected: ${clientId} (${team}/${round})`,
        );
        controller.close();
      });
    },
  });

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
