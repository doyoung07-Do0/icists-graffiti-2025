export type Round = 'r1' | 'r2' | 'r3' | 'r4';
export type RoundStatus = 'locked' | 'open' | 'closed';

export interface TeamData {
  team: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  pre_fund: number;
  post_fund: number | null;
  submitted: boolean;
  remain?: number; // Calculated field
}

export interface RoundStatusData {
  [key: string]: {
    status: RoundStatus;
  };
}

export interface RoundTabsProps {
  activeRound: Round;
  onRoundChange: (round: Round) => void;
  roundStatus: Record<Round, { status: RoundStatus }>;
}

export interface TeamRowProps {
  team: TeamData;
  isEditing: boolean;
  onToggleSubmitted: (team: string, currentStatus: boolean) => void;
  onInputChange: (
    team: string,
    field: keyof Omit<TeamData, 'team' | 'remain'>,
    value: any,
  ) => void;
  onEdit: () => void;
  onSave: () => void;
}

export interface TeamTableProps {
  data: TeamData[];
  isLoading: boolean;
  editingTeam: string | null;
  onToggleSubmitted: (team: string, currentStatus: boolean) => void;
  onInputChange: (
    team: string,
    field: keyof Omit<TeamData, 'team' | 'remain'>,
    value: any,
  ) => void;
  setEditingTeam: (team: string | null) => void;
  onSubmit: (team: string) => void;
}

export interface StartupData {
  startup: 's1' | 's2' | 's3' | 's4' | 's5';
  pre_cap: number | null;
  yield: number | null;
  post_cap: number | null;
}

export interface UpdateTeamData {
  s1?: number;
  s2?: number;
  s3?: number;
  s4?: number;
  s5?: number;
  pre_fund?: number;
  post_fund?: number | null;
  submitted?: boolean;
}

export interface UpdateStartupData {
  pre_cap?: number | null;
  yield?: number | null;
  post_cap?: number | null;
}
