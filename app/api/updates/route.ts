import { NextResponse } from 'next/server';

type Client = {
  id: string;
  controller: ReadableStreamDefaultController;
  cleanup: () => void;
};

// This is a simple in-memory store for connected clients
const clients = new Set<Client>();

// Keep track of the last update timestamp
let lastUpdate = Date.now();

// Function to send updates to all connected clients
function sendUpdateToAll() {
  const message = `data: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
  
  // Send the update to all connected clients
  for (const client of clients) {
    try {
      client.controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error('Error sending update to client:', error);
      // Clean up the client if there's an error
      client.cleanup();
      clients.delete(client);
    }
  }
}

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Math.random().toString(36).substring(2);
      
      // Define cleanup function
      const cleanup = () => {
        clients.delete(client);
        try {
          controller.close();
        } catch (e) {
          console.error('Error closing controller:', e);
        }
      };
      
      const client: Client = {
        id: clientId,
        controller,
        cleanup
      };
      
      // Add client to the set
      clients.add(client);
      
      // Send the initial timestamp
      const initialMessage = `data: ${JSON.stringify({ timestamp: lastUpdate })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initialMessage));
      
      // Return cleanup function that will be called when the stream is closed
      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

// Function to notify all clients of an update
export function notifyUpdate() {
  lastUpdate = Date.now();
  sendUpdateToAll();
}
