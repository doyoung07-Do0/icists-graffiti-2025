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

// Send message to all connected clients for a specific team and round
export function sendTeamUpdate(team: string, round: string, data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  const clientsToRemove: string[] = [];
  let sentCount = 0;
  const now = new Date().toISOString();
  
  console.log(`[${now}] Broadcasting update to team ${team}, round ${round}`, data);

  sseClients.forEach((client) => {
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
    const client = Array.from(sseClients).find(c => c.id === id);
    if (client) {
      client.controller.close();
      sseClients.delete(client);
    }
  });

  console.log(`Sent update to ${sentCount} clients for team ${team}, round ${round}`);
  return sentCount;
}

// Send round status updates to all connected clients
export function broadcastRoundStatusUpdate(round: string, status: 'locked' | 'open' | 'closed'): number {
  const now = new Date().toISOString();
  console.log(`[${now}] Broadcasting round status update for round ${round}:`, status);
  
  const message = `data: ${JSON.stringify({
    type: 'roundStatus',
    round,
    status,
    timestamp: now
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
  
  // Send to all clients subscribed to this round
  sseClients.forEach(client => {
    try {
      if (client.round === round) {
        client.controller.enqueue(new TextEncoder().encode(message));
        totalSent++;
      }
    } catch (error) {
      console.error('Error sending round status update:', error);
      clientsToRemove.push(client);
    }
  });
  
  // Clean up any broken connections
  clientsToRemove.forEach(client => {
    try {
      client.controller.close();
    } catch (e) {
      console.error('Error closing client connection:', e);
    }
    sseClients.delete(client);
  });
  
  console.log(`[${new Date().toISOString()}] Sent round status update to ${totalSent} clients for round ${round}`);
  return totalSent;
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
    connectionsByRound: clients.reduce((acc: Record<string, number>, client) => {
      acc[client.round] = (acc[client.round] || 0) + 1;
      return acc;
    }, {}),
    activeSince: clients.map(client => ({
      id: client.id,
      team: client.team,
      round: client.round,
      connectedAt: client.connectedAt.toISOString(),
      ip: client.ip,
      userAgent: client.userAgent
    }))
  };
}
