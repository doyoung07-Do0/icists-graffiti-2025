import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper to validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Test endpoint is working' });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { round: string } }
) {
  try {
    console.log('=== TEST ENDPOINT HIT ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
    // Properly await params before destructuring
    const { round } = await Promise.resolve(params);
    console.log('Round from params:', round);
    
    if (!isValidRound(round)) {
      console.error('Invalid round parameter:', round);
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid round parameter. Must be one of: ${['r1', 'r2', 'r3', 'r4'].join(', ')}` 
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Just return the received data for testing
    return NextResponse.json({ 
      success: true, 
      message: 'Request received',
      data: {
        round,
        ...body
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process request' 
      },
      { status: 500 }
    );
  }
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
