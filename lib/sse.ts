// Store connected clients
export const sseClients = new Set<{
  id: string;
  controller: ReadableStreamDefaultController;
  team: string;
  round: string;
  ip: string | null;
  userAgent: string | null;
  connectedAt: Date;
}>();

// Log connection statistics periodically
export function logConnectionStats() {
  const now = new Date().toISOString();
  const stats = getConnectionStats();

  console.log(`[${now}] 🔗 SSE Connection Stats:`);
  console.log(`  📊 Total Connections: ${stats.totalConnections}`);

  if (stats.totalConnections > 0) {
    console.log(`  👥 Connections by Team:`);
    Object.entries(stats.connectionsByTeam).forEach(([team, count]) => {
      console.log(`    - ${team}: ${count}`);
    });

    console.log(`  🎯 Connections by Round:`);
    Object.entries(stats.connectionsByRound).forEach(([round, count]) => {
      console.log(`    - ${round}: ${count}`);
    });

    console.log(`  📋 Active Clients:`);
    stats.activeSince.forEach((client) => {
      const age = Math.floor(
        (Date.now() - new Date(client.connectedAt).getTime()) / 1000,
      );
      console.log(
        `    - ${client.id} (${client.team}/${client.round}) - ${age}s ago`,
      );
    });
  } else {
    console.log(`  ❌ No active connections`);
  }
  console.log(''); // Empty line for readability
}

// Send message to all connected clients for a specific team and round
export function sendTeamUpdate(team: string, round: string, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const clientsToRemove: string[] = [];
  let sentCount = 0;
  const now = new Date().toISOString();

  console.log(
    `[${now}] Broadcasting update to team ${team}, round ${round}`,
    data,
  );

  sseClients.forEach((client) => {
    try {
      // Send to both the specific team and admin clients
      if (
        (client.team === team || client.team === 'admin') &&
        (client.round === round || client.round === 'all')
      ) {
        console.log(
          `[${now}] Sending to client ${client.id} (${client.ip}) [team: ${client.team}]`,
        );
        client.controller.enqueue(new TextEncoder().encode(message));
        sentCount++;
      }
    } catch (error) {
      console.error(`[${now}] Error sending to client ${client.id}:`, error);
      clientsToRemove.push(client.id);
    }
  });

  // Clean up any broken connections
  clientsToRemove.forEach((id) => {
    const client = Array.from(sseClients).find((c) => c.id === id);
    if (client) {
      try {
        client.controller.close();
      } catch (e) {
        console.error('Error closing client connection:', e);
      }
      sseClients.delete(client);
    }
  });

  console.log(
    `Sent update to ${sentCount} clients for team ${team}, round ${round}`,
  );
  return sentCount;
}

// Send message to admin clients only
export function sendAdminUpdate(team: string, round: string, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const clientsToRemove: string[] = [];
  let sentCount = 0;
  const now = new Date().toISOString();

  console.log(
    `[${now}] Broadcasting admin-only update for team ${team}, round ${round}`,
    data,
  );

  sseClients.forEach((client) => {
    try {
      // Send only to admin clients
      if (
        client.team === 'admin' &&
        (client.round === round || client.round === 'all')
      ) {
        console.log(
          `[${now}] Sending to admin client ${client.id} (${client.ip})`,
        );
        client.controller.enqueue(new TextEncoder().encode(message));
        sentCount++;
      }
    } catch (error) {
      console.error(
        `[${now}] Error sending to admin client ${client.id}:`,
        error,
      );
      clientsToRemove.push(client.id);
    }
  });

  // Clean up any broken connections
  clientsToRemove.forEach((id) => {
    const client = Array.from(sseClients).find((c) => c.id === id);
    if (client) {
      try {
        client.controller.close();
      } catch (e) {
        console.error('Error closing client connection:', e);
      }
      sseClients.delete(client);
    }
  });

  console.log(
    `Sent admin-only update to ${sentCount} admin clients for team ${team}, round ${round}`,
  );
  return sentCount;
}

// Send round status updates to all connected clients
export function broadcastRoundStatusUpdate(
  round: string,
  status: 'locked' | 'open' | 'closed',
): number {
  const now = new Date().toISOString();
  console.log(
    `[${now}] Broadcasting round status update for round ${round}:`,
    status,
  );

  // DEBUG: Log current clients
  console.log(`[${now}] DEBUG: Current sseClients size:`, sseClients.size);
  console.log(
    `[${now}] DEBUG: All connected clients:`,
    Array.from(sseClients).map((c) => ({
      id: c.id,
      team: c.team,
      round: c.round,
      connectedAt: c.connectedAt.toISOString(),
    })),
  );

  const message = `data: ${JSON.stringify({
    type: 'round_status_updated',
    round,
    status,
    timestamp: now,
  })}\n\n`;

  let totalSent = 0;
  const clientsToRemove: Array<{
    id: string;
    controller: ReadableStreamDefaultController;
    team: string;
    round: string;
    ip: string | null;
    userAgent: string | null;
    connectedAt: Date;
  }> = [];

  // Send to all clients subscribed to this round or 'all' rounds
  sseClients.forEach((client) => {
    try {
      console.log(
        `[${now}] DEBUG: Checking client ${client.id} (team: ${client.team}, round: ${client.round})`,
      );
      if (client.round === round || client.round === 'all') {
        console.log(`[${now}] DEBUG: Sending to client ${client.id}`);
        client.controller.enqueue(new TextEncoder().encode(message));
        totalSent++;
      } else {
        console.log(
          `[${now}] DEBUG: Skipping client ${client.id} (round mismatch: ${client.round} !== ${round})`,
        );
      }
    } catch (error) {
      console.error('Error sending round status update:', error);
      clientsToRemove.push(client);
    }
  });

  // Clean up any broken connections
  clientsToRemove.forEach((client) => {
    try {
      client.controller.close();
    } catch (e) {
      console.error('Error closing client connection:', e);
    }
    sseClients.delete(client);
  });

  console.log(
    `[${new Date().toISOString()}] Sent round status update to ${totalSent} clients for round ${round}`,
  );
  return totalSent;
}

// Send a ping message to keep connections alive
export function sendPingToAll(): number {
  const message = `data: ${JSON.stringify({
    type: 'ping',
    timestamp: new Date().toISOString(),
  })}\n\n`;

  let sentCount = 0;
  const clientsToRemove: string[] = [];

  sseClients.forEach((client) => {
    try {
      client.controller.enqueue(new TextEncoder().encode(message));
      sentCount++;
    } catch (error) {
      console.error('Error sending ping to client:', error);
      clientsToRemove.push(client.id);
    }
  });

  // Clean up broken connections
  clientsToRemove.forEach((id) => {
    const client = Array.from(sseClients).find((c) => c.id === id);
    if (client) {
      try {
        client.controller.close();
      } catch (e) {
        console.error('Error closing client connection:', e);
      }
      sseClients.delete(client);
    }
  });

  return sentCount;
}

// Helper function to get connection stats
export function getConnectionStats() {
  const clients = Array.from(sseClients);
  return {
    totalConnections: clients.length,
    connectionsByTeam: clients.reduce((acc: Record<string, number>, client) => {
      acc[client.team] = (acc[client.team] || 0) + 1;
      return acc;
    }, {}),
    connectionsByRound: clients.reduce(
      (acc: Record<string, number>, client) => {
        acc[client.round] = (acc[client.round] || 0) + 1;
        return acc;
      },
      {},
    ),
    activeSince: clients.map((client) => ({
      id: client.id,
      team: client.team,
      round: client.round,
      connectedAt: client.connectedAt.toISOString(),
      ip: client.ip,
      userAgent: client.userAgent,
    })),
  };
}

// Clean up dead connections (call this periodically)
export function cleanupDeadConnections(maxAgeMinutes = 5): number {
  const now = new Date();
  const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
  const clientsToRemove: string[] = [];

  sseClients.forEach((client) => {
    const age = now.getTime() - client.connectedAt.getTime();
    if (age > maxAge) {
      clientsToRemove.push(client.id);
    }
  });

  clientsToRemove.forEach((id) => {
    const client = Array.from(sseClients).find((c) => c.id === id);
    if (client) {
      try {
        client.controller.close();
      } catch (e) {
        console.error('Error closing dead client connection:', e);
      }
      sseClients.delete(client);
    }
  });

  return clientsToRemove.length;
}

// Set up periodic cleanup (every 2 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const removed = cleanupDeadConnections(5);
    if (removed > 0) {
      console.log(`Cleaned up ${removed} dead SSE connections`);
    }

    // Send ping to keep connections alive
    const pingCount = sendPingToAll();
    if (pingCount > 0) {
      console.log(`Sent ping to ${pingCount} SSE clients`);
    }

    // Log connection stats
    logConnectionStats();
  }, 120000); // Every 2 minutes
}

// Set up periodic connection logging (every 30 seconds)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    logConnectionStats();
  }, 30000); // Every 30 seconds
}
