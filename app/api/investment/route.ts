import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { teamCapital, teamPortfolio, teamMarketCap, investmentRound, TeamCapital, TeamPortfolio, TeamMarketCap } from '@/lib/db/schema';
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
      const [capital, portfolio, marketCap] = await Promise.all([
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
        db
          .select()
          .from(teamMarketCap)
          .where(
            and(
              eq(teamMarketCap.roundId, roundId),
              eq(teamMarketCap.teamName, teamName)
            )
          ),
      ]);

      return NextResponse.json({
        capitals: { [teamName]: capital[0]?.totalCapital || '0' },
        portfolios: portfolio.reduce((acc: Record<string, Record<string, string>>, item: TeamPortfolio) => {
          if (!acc[item.startup]) acc[item.startup] = {};
          acc[item.startup][teamName] = item.investmentAmount || '0';
          return acc;
        }, {} as Record<string, Record<string, string>>),
        marketCaps: { [teamName]: marketCap[0]?.marketCap || '0' },
      });
    } else {
      // Get all teams' data for admin dashboard
      const [capitals, portfolios, marketCaps] = await Promise.all([
        db
          .select()
          .from(teamCapital)
          .where(eq(teamCapital.roundId, roundId)),
        db
          .select()
          .from(teamPortfolio)
          .where(eq(teamPortfolio.roundId, roundId)),
        db
          .select()
          .from(teamMarketCap)
          .where(eq(teamMarketCap.roundId, roundId)),
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

      const formattedMarketCaps = marketCaps.reduce((acc: Record<string, string>, item: TeamMarketCap) => {
        acc[item.teamName] = item.marketCap;
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json({
        capitals: formattedCapitals,
        portfolios: formattedPortfolios,
        marketCaps: formattedMarketCaps,
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

    if (!roundName || !teamName || !type || !data) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const round = await db
      .select()
      .from(investmentRound)
      .where(eq(investmentRound.name, roundName))
      .limit(1);

    if (round.length === 0) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const roundId = round[0].id;

    switch (type) {
      case 'portfolio': {
        const { startup, amount } = data;
        if (!startup || typeof amount !== 'number') {
          return NextResponse.json({ error: 'Invalid portfolio data' }, { status: 400 });
        }

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

        if (existing.length > 0) {
          await db
            .update(teamPortfolio)
            .set({ investmentAmount: amount.toString(), updatedAt: new Date() })
            .where(eq(teamPortfolio.id, existing[0].id));
        } else {
          await db.insert(teamPortfolio).values({
            roundId,
            teamName,
            startup,
            investmentAmount: amount.toString(),
          });
        }
        break;
      }

      case 'capital': {
        const { total } = data;
        if (typeof total !== 'number') {
          return NextResponse.json({ error: 'Invalid capital data' }, { status: 400 });
        }

        const existing = await db
          .select()
          .from(teamCapital)
          .where(
            and(
              eq(teamCapital.roundId, roundId),
              eq(teamCapital.teamName, teamName)
            )
          );

        if (existing.length > 0) {
          await db
            .update(teamCapital)
            .set({ totalCapital: total.toString(), updatedAt: new Date() })
            .where(eq(teamCapital.id, existing[0].id));
        } else {
          await db.insert(teamCapital).values({
            roundId,
            teamName,
            totalCapital: total.toString(),
          });
        }
        break;
      }

      case 'marketCap': {
        const { marketCap } = data;
        if (typeof marketCap !== 'number') {
          return NextResponse.json({ error: 'Invalid marketCap data' }, { status: 400 });
        }

        const existing = await db
          .select()
          .from(teamMarketCap)
          .where(
            and(
              eq(teamMarketCap.roundId, roundId),
              eq(teamMarketCap.teamName, teamName)
            )
          );

        if (existing.length > 0) {
          await db
            .update(teamMarketCap)
            .set({ marketCap: marketCap.toString(), updatedAt: new Date() })
            .where(eq(teamMarketCap.id, existing[0].id));
        } else {
          await db.insert(teamMarketCap).values({
            roundId,
            teamName,
            marketCap: marketCap.toString(),
          });
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid investment type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `${type} updated successfully` });
  } catch (error) {
    console.error(`Error updating investment data:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update team portfolio data (for team dashboard)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { roundName, teamName, startup, type, data } = body;

    console.log(`[API] PUT request - Round: ${roundName}, Team: ${teamName}, Startup: ${startup}, Type: ${type}, Data:`, data);

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

    if (type === 'portfolio') {
      // Update team portfolio
      const { investment } = data;
      
      console.log(`[API] Updating portfolio - Startup: ${startup}, Investment: ${investment}`);
      
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
          investmentAmount: investment.toString(),
        });
        console.log(`[API] Created new portfolio record for ${teamName}-${startup}: ${investment}`);
      } else {
        // Update existing record
        await db
          .update(teamPortfolio)
          .set({
            investmentAmount: investment.toString(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(teamPortfolio.roundId, roundId),
              eq(teamPortfolio.teamName, teamName),
              eq(teamPortfolio.startup, startup)
            )
          );
        console.log(`[API] Updated existing portfolio record for ${teamName}-${startup}: ${investment}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating portfolio data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
