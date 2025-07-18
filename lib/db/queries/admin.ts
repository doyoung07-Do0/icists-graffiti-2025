import { db } from '@/lib/db';
import { and, eq, sum, isNotNull } from 'drizzle-orm';
import {
  team_r1,
  team_r2,
  team_r3,
  team_r4,
  startup_r1,
  startup_r2,
  startup_r3,
  startup_r4,
  round_state,
} from '@/lib/db/schema';
import { randomNormal } from '@/lib/utils/random';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper to get the appropriate team table
export function getTeamTable(round: Round) {
  switch (round) {
    case 'r1':
      return team_r1;
    case 'r2':
      return team_r2;
    case 'r3':
      return team_r3;
    case 'r4':
      return team_r4;
    default:
      throw new Error(`Invalid round: ${round}`);
  }
}

// Helper to get the appropriate startup table
export function getStartupTable(round: Round) {
  switch (round) {
    case 'r1':
      return startup_r1;
    case 'r2':
      return startup_r2;
    case 'r3':
      return startup_r3;
    case 'r4':
      return startup_r4;
    default:
      throw new Error(`Invalid round: ${round}`);
  }
}

// Get round status
export async function getRoundStatus() {
  return await db.select().from(round_state);
}

// Update round status
export async function updateRoundStatus(
  round: Round,
  status: 'locked' | 'open' | 'closed',
) {
  return await db
    .update(round_state)
    .set({ status })
    .where(eq(round_state.round, round));
}

// Get all teams for a round
export async function getTeamsForRound(round: Round) {
  const table = getTeamTable(round);
  return await db.select().from(table);
}

// Check if all teams have submitted for a round
export async function haveAllTeamsSubmitted(round: Round): Promise<boolean> {
  const teams = await getTeamsForRound(round);
  return teams.length > 0 && teams.every((team) => team.submitted === true);
}

// Get a single team's data
export async function getTeamData(round: Round, team: string) {
  const table = getTeamTable(round);
  const result = await db.select().from(table).where(eq(table.team, team));
  return result[0];
}

// Update team data
export async function updateTeamData(
  round: Round,
  team: string,
  data: {
    s1?: number;
    s2?: number;
    s3?: number;
    s4?: number;
    s5?: number;
    pre_fund?: number;
    post_fund?: number | null;
    submitted?: boolean;
  },
) {
  const table = getTeamTable(round);
  return await db.update(table).set(data).where(eq(table.team, team));
}

// Toggle team submission status
export async function toggleTeamSubmission(
  round: Round,
  team: string,
  currentStatus: boolean,
) {
  const table = getTeamTable(round);
  return await db
    .update(table)
    .set({ submitted: !currentStatus })
    .where(eq(table.team, team));
}

// Get startup data for a round
export async function getStartupData(round: Round) {
  const table = getStartupTable(round);
  return await db.select().from(table);
}

// Update startup data
export async function updateStartupData(
  round: Round,
  startup: string,
  data: {
    pre_cap?: number | null;
    yield?: string | null;
    post_cap?: number | null;
  },
) {
  const table = getStartupTable(round);
  return await db
    .update(table)
    .set(data)
    .where(eq(table.startup, startup as any));
}

// Calculate and update startup data when closing a round
// Open a new round and update team funds from the previous round
export async function openNewRound(round: 'r2' | 'r3' | 'r4') {
  // Get the previous round
  const prevRound = {
    r2: 'r1',
    r3: 'r2',
    r4: 'r3',
  }[round] as Round;

  const teamTable = getTeamTable(round);
  const prevTeamTable = getTeamTable(prevRound);

  // Get all teams from the previous round that have a post_fund value
  const teams = await db
    .select({
      team: prevTeamTable.team,
      post_fund: prevTeamTable.post_fund,
    })
    .from(prevTeamTable)
    .where(isNotNull(prevTeamTable.post_fund));

  if (teams.length === 0) {
    throw new Error(`No teams found in ${prevRound} with post_fund values`);
  }

  // Update each team's pre_fund in the new round
  for (const team of teams) {
    await db
      .insert(teamTable)
      .values({
        team: team.team,
        pre_fund: team.post_fund,
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        submitted: false,
        post_fund: null,
      })
      .onConflictDoUpdate({
        target: [teamTable.team],
        set: {
          pre_fund: team.post_fund,
          submitted: false,
          post_fund: null,
        },
      });
  }

  // Update the round status to 'open'
  await updateRoundStatus(round, 'open');

  return true;
}

export async function calculateAndUpdateStartupData(round: Round) {
  const teamTable = getTeamTable(round);
  const startupTable = getStartupTable(round);

  // Get all submitted teams
  const submittedTeams = await db
    .select()
    .from(teamTable)
    .where(eq(teamTable.submitted, true));

  if (submittedTeams.length === 0) {
    throw new Error('No teams have submitted their portfolios');
  }

  // For each startup (s1, s2, s3, s4, s5), calculate the total investment and generate yields
  const startups = ['s1', 's2', 's3', 's4', 's5'] as const;
  const startupYields: Record<string, number> = {};

  // First, calculate yields for each startup
  for (const startup of startups) {
    // Calculate total investment in this startup across all teams
    const startupColumn = startup;
    const result = await db
      .select({ total: sum(teamTable[startupColumn]) })
      .from(teamTable)
      .where(eq(teamTable.submitted, true));

    const preCap = Number(result[0]?.total) || 0;

    // Generate a random yield from a normal distribution
    const mean = 0.05; // 5% average return
    const stdDev = 0.1; // 10% standard deviation
    const minYield = -0.3; // -30% minimum return
    const maxYield = 0.5; // +50% maximum return

    const yieldValue = randomNormal(mean, stdDev);
    const boundedYield = Math.max(minYield, Math.min(maxYield, yieldValue));

    // Store the yield for this startup to use in team calculations
    startupYields[startup] = boundedYield;

    // Calculate post-cap value and round to nearest integer
    const postCap = Math.round(preCap * (1 + boundedYield));

    // Convert yield to string with fixed decimal places for database storage
    const yieldStr = boundedYield.toFixed(4);

    // Update the startup data with integers for pre_cap and post_cap
    await updateStartupData(round, startup, {
      pre_cap: Math.round(preCap),
      yield: yieldStr,
      post_cap: postCap,
    });
  }

  // Now calculate and update post_fund for each team
  for (const team of submittedTeams) {
    let postFund = 0;
    let totalInvested = 0;

    // Calculate returns for each startup investment
    for (const startup of startups) {
      const investment = team[startup] || 0;
      totalInvested += investment;
      const yieldValue = startupYields[startup];
      postFund += Math.round(investment * (1 + yieldValue));
    }

    // Add remaining funds (pre_fund - total_invested)
    const remainingFunds = (team.pre_fund || 0) - totalInvested;
    postFund += remainingFunds;

    // Update the team's post_fund
    await updateTeamData(round, team.team, {
      post_fund: postFund,
    });
  }

  // Update the round status to 'closed'
  await updateRoundStatus(round, 'closed');

  return true;
}
