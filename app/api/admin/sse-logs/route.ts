import { NextResponse } from 'next/server';

// Mock data for now - in production this would come from actual SSE logging
const mockConnectionLogs = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 5000).toISOString(),
    environment: 'Development',
    event: 'connect',
    message: 'Client connected successfully',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 10000).toISOString(),
    environment: 'Development',
    event: 'reconnect',
    message: 'Client reconnected after 30s timeout',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 15000).toISOString(),
    environment: 'Production',
    event: 'error',
    message: 'Connection failed: Vercel function timeout',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 20000).toISOString(),
    environment: 'Production',
    event: 'disconnect',
    message: 'Client disconnected due to network error',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 25000).toISOString(),
    environment: 'Development',
    event: 'connect',
    message: 'New client connected from localhost:3000',
  },
];

export async function GET() {
  try {
    // In production, this would fetch real SSE logs from your logging system
    // For now, return mock data
    return NextResponse.json({
      success: true,
      data: mockConnectionLogs,
    });
  } catch (error) {
    console.error('Error fetching SSE logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SSE logs' },
      { status: 500 },
    );
  }
}
