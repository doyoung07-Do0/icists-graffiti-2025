export interface ConnectedEvent {
  type: 'connected';
  message: string;
  timestamp: string;
}

export interface TeamUpdateEvent {
  type: 'team_updated';
  team: string;
  round: string;
  data: {
    team: string;
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    pre_fund: number | null;
    post_fund: number | null;
    submitted: boolean;
  };
}

export type SSEMessage = ConnectedEvent | TeamUpdateEvent;
