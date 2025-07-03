import { db } from '@/lib/db';
import { and, eq } from 'drizzle-orm';
import { team_r1, team_r2, team_r3, team_r4, startup_r1, startup_r2, startup_r3, startup_r4, round_state } from '@/lib/db/schema';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper to get the appropriate team table
export function getTeamTable(round: Round) {
  switch (round) {
    case 'r1': return team_r1;
    case 'r2': return team_r2;
    case 'r3': return team_r3;
    case 'r4': return team_r4;
    default: throw new Error(`Invalid round: ${round}`);
  }
}

// Helper to get the appropriate startup table
export function getStartupTable(round: Round) {
  switch (round) {
    case 'r1': return startup_r1;
    case 'r2': return startup_r2;
    case 'r3': return startup_r3;
    case 'r4': return startup_r4;
    default: throw new Error(`Invalid round: ${round}`);
  }
}

// Get round status
export async function getRoundStatus() {
  return await db.select().from(round_state);
}

// Get all teams for a round
export async function getTeamsForRound(round: Round) {
  const table = getTeamTable(round);
  return await db.select().from(table);
}

// Get a single team's data
export async function getTeamData(round: Round, team: string) {
  const table = getTeamTable(round);
  const result = await db
    .select()
    .from(table)
    .where(eq(table.team, team));
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
    pre_fund?: number;
    post_fund?: number | null;
    submitted?: boolean;
  }
) {
  const table = getTeamTable(round);
  return await db
    .update(table)
    .set(data)
    .where(eq(table.team, team));
}

// Toggle team submission status
export async function toggleTeamSubmission(round: Round, team: string, currentStatus: boolean) {
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
    yield?: number | null;
    post_cap?: number | null;
  }
) {
  const table = getStartupTable(round);
  return await db
    .update(table)
    .set(data)
    .where(eq(table.startup, startup as any));
}
