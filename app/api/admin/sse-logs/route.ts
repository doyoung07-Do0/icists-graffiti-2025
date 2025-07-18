import { NextResponse } from 'next/server';
import { getConnectionStats } from '@/lib/sse';

interface ConnectionLog {
  id: string;
  timestamp: string;
  environment: string;
  event: 'connect' | 'disconnect' | 'error' | 'reconnect';
  message: string;
  details?: any;
}

export async function GET() {
  try {
    const stats = getConnectionStats();
    const now = new Date().toISOString();

    // Convert active clients to connection logs
    const connectionLogs: ConnectionLog[] = stats.activeSince.map(
      (client, index) => ({
        id: `log-${index + 1}`,
        timestamp: client.connectedAt,
        environment: 'Development',
        event: 'connect' as const,
        message: `Client ${client.id} (${client.team}/${client.round}) connected from ${client.ip}`,
        details: {
          clientId: client.id,
          team: client.team,
          round: client.round,
          ip: client.ip,
          userAgent: client.userAgent,
          connectedAt: client.connectedAt,
        },
      }),
    );

    // If no active connections, return a "no connections" log
    if (connectionLogs.length === 0) {
      connectionLogs.push({
        id: 'no-connections',
        timestamp: now,
        environment: 'Development',
        event: 'disconnect',
        message: 'No active SSE connections',
        details: {},
      });
    }

    return NextResponse.json({
      success: true,
      data: connectionLogs,
      debug: {
        totalConnections: stats.totalConnections,
        connectionsByTeam: stats.connectionsByTeam,
        connectionsByRound: stats.connectionsByRound,
      },
    });
  } catch (error) {
    console.error('Error fetching SSE logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SSE logs' },
      { status: 500 },
    );
  }
}
