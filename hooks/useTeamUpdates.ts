// DISABLED FOR DEBUGGING INFINITE REQUEST BUG
import type { SSEMessage } from '@/types/sse';

type TeamUpdateCallback = (message: SSEMessage) => void;

export function useTeamUpdates(
  team: string,
  round: string,
  onUpdate: TeamUpdateCallback,
) {
  // DISABLE SSE HOOK FOR DEBUGGING INFINITE CONNECTION BUG
  console.log('SSE disabled for debugging - useTeamUpdates');

  return {
    isConnected: false,
    error: 'SSE disabled for debugging',
    connectionStatus: 'disconnected',
    reconnect: () => console.log('SSE disabled for debugging'),
  };
}
