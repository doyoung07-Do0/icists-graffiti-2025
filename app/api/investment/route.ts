import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { teamCapital, teamPortfolio, investmentRound, TeamCapital, TeamPortfolio } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Fetch team capital and portfolio data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roundName = searchParams.get('round') || 'Pre-seed';
    const teamName = searchParams.get('team');

    // Get current round
    const round = await db
      .select()
      .from(investmentRound)
      .where(eq(investmentRound.name, roundName))
      .limit(1);

    if (round.length === 0) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const roundId = round[0].id;

    if (teamName) {
      // Get specific team's data
      const [capital, portfolio] = await Promise.all([
        db
          .select()
          .from(teamCapital)
          .where(
            and(
              eq(teamCapital.roundId, roundId),
              eq(teamCapital.teamName, teamName)
            )
          ),
        db
          .select()
          .from(teamPortfolio)
          .where(
            and(
              eq(teamPortfolio.roundId, roundId),
              eq(teamPortfolio.teamName, teamName)
            )
          ),
      ]);

      return NextResponse.json({
        capitals: { [teamName]: capital[0]?.totalCapital || 0 },
        portfolios: portfolio.reduce((acc: Record<string, Record<string, number>>, item: TeamPortfolio) => {
          if (!acc[item.startup]) acc[item.startup] = {};
          acc[item.startup][teamName] = parseFloat(item.investmentAmount) || 0;
          return acc;
        }, {} as Record<string, Record<string, number>>),
      });
    } else {
      // Get all teams' data for admin dashboard
      const [capitals, portfolios] = await Promise.all([
        db
          .select()
          .from(teamCapital)
          .where(eq(teamCapital.roundId, roundId)),
        db
          .select()
          .from(teamPortfolio)
          .where(eq(teamPortfolio.roundId, roundId)),
      ]);

      // Format data for admin dashboard
      const formattedCapitals = capitals.reduce((acc: Record<string, string>, item: TeamCapital) => {
        acc[item.teamName] = item.totalCapital;
        return acc;
      }, {} as Record<string, string>);

      const formattedPortfolios = portfolios.reduce((acc: Record<string, Record<string, string>>, item: TeamPortfolio) => {
        if (!acc[item.startup]) acc[item.startup] = {};
        acc[item.startup][item.teamName] = item.investmentAmount;
        return acc;
      }, {} as Record<string, Record<string, string>>);

      return NextResponse.json({
        capitals: formattedCapitals,
        portfolios: formattedPortfolios,
      });
    }
  } catch (error) {
    console.error('Error fetching investment data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update team capital or portfolio data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roundName, teamName, type, data } = body;

    // Get current round
    const round = await db
      .select()
      .from(investmentRound)
      .where(eq(investmentRound.name, roundName))
      .limit(1);

    if (round.length === 0) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const roundId = round[0].id;

    if (type === 'capital') {
      // Update team capital
      const { capital } = data;
      
      // Check if record exists
      const existing = await db
        .select()
        .from(teamCapital)
        .where(
          and(
            eq(teamCapital.roundId, roundId),
            eq(teamCapital.teamName, teamName)
          )
        );

      if (existing.length === 0) {
        // Create new record
        await db.insert(teamCapital).values({
          roundId,
          teamName,
          totalCapital: capital.toString(),
        });
      } else {
        // Update existing record
        await db
          .update(teamCapital)
          .set({
            totalCapital: capital.toString(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(teamCapital.roundId, roundId),
              eq(teamCapital.teamName, teamName)
            )
          );
      }
    } else if (type === 'portfolio') {
      // Update team portfolio
      const { startup, amount } = data;
      
      // Check if record exists
      const existing = await db
        .select()
        .from(teamPortfolio)
        .where(
          and(
            eq(teamPortfolio.roundId, roundId),
            eq(teamPortfolio.teamName, teamName),
            eq(teamPortfolio.startup, startup)
          )
        );

      if (existing.length === 0) {
        // Create new record
        await db.insert(teamPortfolio).values({
          roundId,
          teamName,
          startup,
          investmentAmount: amount.toString(),
        });
      } else {
        // Update existing record
        await db
          .update(teamPortfolio)
          .set({
            investmentAmount: amount.toString(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(teamPortfolio.roundId, roundId),
              eq(teamPortfolio.teamName, teamName),
              eq(teamPortfolio.startup, startup)
            )
          );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating investment data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
