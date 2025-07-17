// DISABLED FOR DEBUGGING INFINITE REQUEST BUG
import type { SSEMessage } from '@/types/sse';

type RoundStatusUpdateCallback = (message: SSEMessage) => void;

export function useRoundStatusUpdates(
  team: string,
  round: string,
  onUpdate: RoundStatusUpdateCallback,
) {
  // DISABLE SSE HOOK FOR DEBUGGING INFINITE CONNECTION BUG
  console.log('SSE disabled for debugging - useRoundStatusUpdates');

  return {
    isConnected: false,
    error: 'SSE disabled for debugging',
    connectionStatus: 'disconnected',
    reconnect: () => console.log('SSE disabled for debugging'),
  };
}
