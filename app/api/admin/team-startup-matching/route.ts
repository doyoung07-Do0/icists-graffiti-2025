import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { team_r4, final_matching } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Team-Startup Matching API called');
    const { round } = await request.json();
    console.log('📋 Request data:', { round });

    if (round !== 'r4') {
      console.log('❌ Invalid round requested:', round);
      return NextResponse.json(
        {
          success: false,
          error: 'Team-startup matching is only available for round 4',
        },
        { status: 400 },
      );
    }

    console.log('📊 Fetching teams from team_r4...');
    // Get all teams from team_r4, ordered by post_fund descending
    const teams = await db
      .select({
        team: team_r4.team,
        s1: team_r4.s1,
        s2: team_r4.s2,
        s3: team_r4.s3,
        s4: team_r4.s4,
        s5: team_r4.s5,
        post_fund: team_r4.post_fund,
      })
      .from(team_r4)
      .orderBy(desc(team_r4.post_fund));

    console.log('👥 Teams fetched:', teams.length);
    console.log(
      '📈 Teams ordered by post_fund:',
      teams.map((t) => ({ team: t.team, post_fund: t.post_fund })),
    );

    console.log('🗑️  Clearing existing matches...');
    // Clear existing matches for this round
    await db.delete(final_matching);

    // Initialize startup allocation tracking (max 3 teams per startup)
    const startupAllocation: Record<string, number> = {
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
    };
    console.log('📋 Initial startup allocation:', startupAllocation);

    const matches: Array<{
      team: string;
      startup: 's1' | 's2' | 's3' | 's4' | 's5';
    }> = [];

    console.log('🔄 Starting team matching process...');
    // Process each team in order (highest post_fund first)
    for (const team of teams) {
      console.log(
        `\n🎯 Processing team: ${team.team} (post_fund: ${team.post_fund})`,
      );
      if (!team.post_fund) {
        console.warn(`Team ${team.team} has no post_fund, skipping`);
        continue;
      }

      // Get team's investment amounts for each startup
      const investments = [
        { startup: 's1', amount: team.s1 },
        { startup: 's2', amount: team.s2 },
        { startup: 's3', amount: team.s3 },
        { startup: 's4', amount: team.s4 },
        { startup: 's5', amount: team.s5 },
      ];
      console.log(`💰 Team ${team.team} investments:`, investments);

      // Sort by investment amount (highest first), with random tie-breaking
      investments.sort((a, b) => {
        if (b.amount !== a.amount) {
          return b.amount - a.amount;
        }
        // If amounts are equal, randomize the order
        return Math.random() - 0.5;
      });
      console.log(`📊 Sorted investments for ${team.team}:`, investments);

      // Find the first available startup (team must be matched regardless of investment)
      let matchedStartup: string | null = null;

      // First try to match with startups where team invested > 0
      for (const investment of investments) {
        if (
          investment.amount > 0 &&
          startupAllocation[investment.startup] < 3
        ) {
          matchedStartup = investment.startup;
          break;
        }
      }

      // If no preferred startup is available, find any startup with space
      if (!matchedStartup) {
        for (const startup of ['s1', 's2', 's3', 's4', 's5'] as const) {
          if (startupAllocation[startup] < 3) {
            matchedStartup = startup;
            break;
          }
        }
      }

      if (matchedStartup) {
        // Record the match
        matches.push({
          team: team.team,
          startup: matchedStartup as 's1' | 's2' | 's3' | 's4' | 's5',
        });

        // Update allocation count
        startupAllocation[matchedStartup]++;
        console.log(`✅ ${team.team} matched to ${matchedStartup}`);
        console.log(`📊 Updated allocation:`, startupAllocation);
      } else {
        console.warn(`No available startup for team ${team.team}`);
      }
    }

    console.log('\n💾 Saving matches to database...');
    // Insert all matches into the database
    if (matches.length > 0) {
      await db.insert(final_matching).values(matches);
      console.log('✅ Matches saved to database');
    }

    console.log('\n📋 Final Results:');
    console.log('Total matches:', matches.length);
    console.log('Final allocation:', startupAllocation);
    console.log('All matches:', matches);

    return NextResponse.json({
      success: true,
      message: 'Team-startup matching completed successfully',
      data: {
        totalMatches: matches.length,
        matches: matches,
        startupAllocation: startupAllocation,
      },
    });
  } catch (error) {
    console.error('Error performing team-startup matching:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform team-startup matching' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
