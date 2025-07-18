import { NextResponse } from 'next/server';
import { getConnectionStats } from '@/lib/sse';

export async function GET() {
  try {
    const stats = getConnectionStats();
    const now = new Date().toISOString();

    // Calculate metrics from real connection data
    const totalConnections = stats.totalConnections;
    const connectionsByTeam = stats.connectionsByTeam;
    const connectionsByRound = stats.connectionsByRound;

    // Create environment-specific metrics
    const metrics = [
      {
        environment: 'Development',
        status: totalConnections > 0 ? 'connected' : 'disconnected',
        activeConnections: totalConnections,
        totalEventsSent: 0, // This would need to be tracked separately
        lastHeartbeat: totalConnections > 0 ? now : null,
        errorCount: 0, // This would need to be tracked separately
        averageResponseTime: 45, // Mock value for now
      },
      {
        environment: 'Production',
        status: 'disconnected', // Always disconnected for now since we're in development
        activeConnections: 0,
        totalEventsSent: 0,
        lastHeartbeat: null,
        errorCount: 0,
        averageResponseTime: 0,
      },
    ];

    return NextResponse.json({
      success: true,
      data: metrics,
      debug: {
        totalConnections,
        connectionsByTeam,
        connectionsByRound,
        activeClients: stats.activeSince,
      },
    });
  } catch (error) {
    console.error('Error fetching SSE metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SSE metrics' },
      { status: 500 },
    );
  }
}
