import { NextResponse } from 'next/server';
import { getStartupData, updateStartupData } from '@/lib/db/queries/admin';

// Type for the round parameter
type Round = 'r1' | 'r2' | 'r3' | 'r4';

// GET handler
export async function GET(request: Request) {
  try {
    // Extract round from URL
    const url = new URL(request.url);
    const roundMatch = url.pathname.match(/\/api\/admin\/startups\/([^/]+)/);
    const round = roundMatch ? roundMatch[1] : '';
    
    // Validate round parameter
    if (!['r1', 'r2', 'r3', 'r4'].includes(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }

    const startups = await getStartupData(round as Round);
    return NextResponse.json({ success: true, data: startups });
  } catch (error) {
    console.error('Error fetching startup data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch startup data' },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: Request) {
  try {
    // Extract round from URL
    const url = new URL(request.url);
    const roundMatch = url.pathname.match(/\/api\/admin\/startups\/([^/]+)/);
    const round = roundMatch ? roundMatch[1] : '';
    
    // Validate round parameter
    if (!['r1', 'r2', 'r3', 'r4'].includes(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }

    const { startup, data } = await request.json();
    
    // Update startup data
    const result = await updateStartupData(round as Round, startup, data);
    
    return NextResponse.json({
      success: true,
      message: 'Startup data updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating startup data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update startup data' 
      },
      { status: 500 }
    );
  }
}

// Ensure the route is statically generated at build time
// but can still be revalidated on-demand
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export const revalidate = 0; // Disable caching for this route

// Generate static params at build time
export async function generateStaticParams() {
  return [
    { round: 'r1' },
    { round: 'r2' },
    { round: 'r3' },
    { round: 'r4' },
  ];
}
