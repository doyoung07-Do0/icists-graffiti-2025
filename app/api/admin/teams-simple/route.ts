import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: true, message: 'Simple GET endpoint works' });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE TEAMS POST REQUEST ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    
    const body = await request.json().catch(() => ({}));
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Simple POST endpoint works',
      data: body,
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in simple teams endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process request',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
