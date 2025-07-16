import { useEffect, useRef, useCallback, useState } from 'react';

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
  const {
    team = 'admin',
    round = 'r1',
    onMessage,
    onError,
    onOpen,
    onClose,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [state, setState] = useState<SSEState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  // Clean up function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Connect function
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return; // Already connected
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Create EventSource with query parameters
      const url = `/api/teams/events?team=${encodeURIComponent(team)}&round=${encodeURIComponent(round)}`;
      const eventSource = new EventSource(url);

      eventSourceRef.current = eventSource;

      // Connection opened
      eventSource.onopen = () => {
        console.log(`SSE connected for team: ${team}, round: ${round}`);
        setState((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          reconnectAttempts: 0,
        }));
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      // Message received
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE message received:', data);
          onMessage?.(data);
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      // Error occurred
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setState((prev) => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Connection error',
        }));

        onError?.(error);

        // Clean up current connection
        cleanup();

        // Attempt to reconnect if enabled
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          setState((prev) => ({
            ...prev,
            reconnectAttempts: reconnectAttemptsRef.current,
          }));

          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setState((prev) => ({
            ...prev,
            error: `Failed to reconnect after ${maxReconnectAttempts} attempts`,
          }));
        }
      };
    } catch (error) {
      console.error('Error creating EventSource:', error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to create connection',
      }));
    }
  }, [
    team,
    round,
    onMessage,
    onError,
    onOpen,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    cleanup,
  ]);

  // Disconnect function
  const disconnect = useCallback(() => {
    cleanup();
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    });
    reconnectAttemptsRef.current = 0;
    onClose?.();
  }, [cleanup, onClose]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Set up connection on mount
  useEffect(() => {
    connect();

    // Clean up on unmount
    return () => {
      cleanup();
    };
  }, [connect, cleanup]);

  // Reconnect when team or round changes
  useEffect(() => {
    if (state.isConnected) {
      reconnect();
    }
  }, [team, round]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
  };
}
