export type Round = 'r1' | 'r2' | 'r3' | 'r4';

export interface TeamData {
  team: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  pre_fund: number;
  post_fund: number | null;
  submitted: boolean;
}

export interface RoundTabProps {
  round: Round;
  isActive: boolean;
  onClick: (round: Round) => void;
}

export interface TeamRowProps {
  team: TeamData;
  isEditing: boolean;
  onToggleSubmitted: (team: string, currentStatus: boolean) => void;
  onInputChange: (team: string, field: keyof TeamData, value: any) => void;
  onEdit: () => void;
  onSave: () => void;
}

export interface TeamTableProps {
  data: TeamData[];
  isLoading: boolean;
  editingTeam: string | null;
  onToggleSubmitted: (team: string, currentStatus: boolean) => void;
  onInputChange: (team: string, field: keyof TeamData, value: any) => void;
  setEditingTeam: (team: string | null) => void;
  onSubmit: (team: string) => void;
}
