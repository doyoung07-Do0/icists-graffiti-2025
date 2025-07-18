import { NextResponse } from 'next/server';

// Mock data for now - in production this would come from actual SSE tracking
const mockSSEMetrics = [
  {
    environment: 'Development',
    status: 'connected',
    activeConnections: 3,
    totalEventsSent: 1247,
    lastHeartbeat: new Date().toISOString(),
    errorCount: 0,
    averageResponseTime: 45,
  },
  {
    environment: 'Production',
    status: 'disconnected',
    activeConnections: 0,
    totalEventsSent: 0,
    lastHeartbeat: null,
    errorCount: 12,
    averageResponseTime: 0,
  },
];

export async function GET() {
  try {
    // In production, this would fetch real SSE metrics from your tracking system
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: mockSSEMetrics,
    });
  } catch (error) {
    console.error('Error fetching SSE metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SSE metrics' },
      { status: 500 },
    );
  }
}
