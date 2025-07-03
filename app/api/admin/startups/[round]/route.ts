import { NextResponse } from 'next/server';
import { getStartupData, updateStartupData } from '@/lib/db/queries/admin';
import { NextRequest } from 'next/server';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

export async function GET(
  request: NextRequest,
  { params }: { params: { round: string } }
) {
  try {
    // Ensure params is properly awaited and validate the round
    const { round } = await Promise.resolve(params);
    
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

export async function POST(
  request: NextRequest,
  { params }: { params: { round: string } }
) {
  try {
    // Ensure params is properly awaited and validate the round
    const { round } = await Promise.resolve(params);
    
    // Validate round parameter
    if (!['r1', 'r2', 'r3', 'r4'].includes(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }

    const { startup, data } = await request.json();
    
    // Validate startup parameter
    if (!['s1', 's2', 's3', 's4'].includes(startup)) {
      return NextResponse.json(
        { success: false, error: 'Invalid startup parameter' },
        { status: 400 }
      );
    }
    
    const result = await updateStartupData(round as Round, startup, data);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating startup data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update startup data' },
      { status: 500 }
    );
  }
}

// Ensure the route is statically generated at build time
// but can still be revalidated on-demand
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Generate static params at build time
export function generateStaticParams() {
  return [
    { round: 'r1' },
    { round: 'r2' },
    { round: 'r3' },
    { round: 'r4' },
  ];
}
