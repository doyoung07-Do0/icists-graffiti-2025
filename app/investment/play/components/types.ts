// Shared types for investment play components

export interface PortfolioData {
  [startup: string]: {
    [team: string]: number;
  };
}

export interface TeamTotalData {
  [team: string]: number;
}

export interface RoundData {
  [round: string]: {
    portfolios: PortfolioData;
    capitals: TeamTotalData;
  };
}

export type UserRole = 'admin' | 'team' | 'unauthorized';

export const ROUNDS = ['Pre-seed', 'Seed', 'Series A', 'Series B'] as const;
export const STARTUPS = ['startup1', 'startup2', 'startup3', 'startup4'] as const;
export const TEAMS = Array.from({ length: 16 }, (_, i) => `team${i + 1}`);
