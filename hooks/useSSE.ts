// DISABLED FOR DEBUGGING INFINITE REQUEST BUG
import { useState, useCallback } from 'react';

interface SSEOptions {
  team?: string;
  round?: string;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface SSEState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export function useSSE(options: SSEOptions = {}) {
  // DISABLE SSE HOOK FOR DEBUGGING INFINITE CONNECTION BUG
  // Return a mock state that indicates SSE is disabled
  const [state, setState] = useState<SSEState>({
    isConnected: false,
    isConnecting: false,
    error: 'SSE disabled for debugging',
    reconnectAttempts: 0,
  });

  // Mock functions that do nothing
  const connect = useCallback(() => {
    console.log('SSE disabled for debugging');
  }, []);

  const disconnect = useCallback(() => {
    console.log('SSE disabled for debugging');
  }, []);

  const reconnect = useCallback(() => {
    console.log('SSE disabled for debugging');
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
  };
}
