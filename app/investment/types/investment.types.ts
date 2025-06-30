// ===== CORE TYPES =====

export type RoundName = 'r1' | 'r2' | 'r3' | 'r4';
export type TeamNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type StartupKey = 's1' | 's2' | 's3' | 's4';

export const STARTUP_KEYS: StartupKey[] = ['s1', 's2', 's3', 's4'];

export const STARTUP_NAMES: Record<StartupKey, string> = {
  s1: 'Startup 1',
  s2: 'Startup 2',
  s3: 'Startup 3',
  s4: 'Startup 4'
};

export interface TeamData {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  remain: number;
  total: number;
  teamNumber: TeamNumber;
  roundName: string;
  updatedAt: string;
}

export interface PortfolioData {
  [startup: string]: {
    [team: string]: number;
  };
}

export interface TeamTotalData {
  [team: string]: number;
}

export interface MarketCapData {
  [round: string]: {
    [startup: string]: number;
  };
}

export interface ReturnsData {
  [round: string]: {
    [startup: string]: number; // multiplier (e.g., 1.5 for 50% return)
  };
}

// ===== COMPONENT PROPS =====

export interface InvestmentTableProps {
  currentRound: string;
  investments: Record<string, Record<StartupKey, number>>;
  teamTotals: Record<string, number>;
  marketCaps: Record<string, number>;
  loading?: boolean;
  onCellClick: (team: string, startup: string, value: number) => void;
  onSave: (team: string, startup: string, value: number) => Promise<void>;
  onCancel: () => void;
  editingCell: {
    team: string;
    startup: string;
    value: number;
  } | null;
}

export interface ReturnsSectionProps {
  currentRound: string;
  returns: ReturnsData;
  loading?: boolean;
  onGenerateReturns: (multiplier: number) => Promise<void>;
  onResetReturns: () => Promise<void>;
}

// ===== FORM TYPES =====

export interface InvestmentFormData {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  teamNumber: TeamNumber;
  roundName: string;
}

// ===== API TYPES =====

export interface InvestmentApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export interface BulkUpdatePayload {
  roundName: string;
  updates: Array<{
    teamNumber: TeamNumber;
    startup: StartupKey;
    amount: number;
  }>;
}

// ===== CONSTANTS =====

export const ROUND_NAMES: Record<RoundName, string> = {
  r1: 'Pre-seed',
  r2: 'Seed',
  r3: 'Series A',
  r4: 'Series B'
};

export const ROUND_VALUES: RoundName[] = ['r1', 'r2', 'r3', 'r4'];

export const TEAM_NUMBERS: TeamNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

// ===== UTILITY TYPES =====

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type Status = 'idle' | 'loading' | 'success' | 'error';

// ===== CONTEXT TYPES =====

export interface InvestmentContextType {
  currentRound: RoundName;
  setCurrentRound: (round: RoundName) => void;
  investments: Record<string, Record<StartupKey, number>>;
  teamTotals: Record<string, number>;
  marketCaps: Record<string, number>;
  returns: ReturnsData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateInvestment: (teamNumber: TeamNumber, startup: StartupKey, amount: number) => Promise<void>;
  updateTeamTotal: (teamNumber: TeamNumber, amount: number) => Promise<void>;
  updateMarketCap: (startup: StartupKey, value: number) => Promise<void>;
  generateReturns: (multiplier: number) => Promise<void>;
  resetReturns: () => Promise<void>;
}

// ===== TABLE TYPES =====

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  sortable?: boolean;
}

export interface SortConfig<T> {
  key: keyof T | string;
  direction: 'asc' | 'desc';
}
