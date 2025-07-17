// DISABLED FOR DEBUGGING INFINITE REQUEST BUG
// import { useEffect, useRef, useCallback, useState } from 'react';

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
  const isMountedRef = useRef(true);
  const isDisconnectingRef = useRef(false);

  const [state, setState] = useState<SSEState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  });

  // Clean up function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      // Remove event listeners to prevent memory leaks
      eventSourceRef.current.onopen = null;
      eventSourceRef.current.onmessage = null;
      eventSourceRef.current.onerror = null;

      // Close the connection
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Connect function
  const connect = useCallback(() => {
    // Don't connect if component is unmounted or we're in the process of disconnecting
    if (!isMountedRef.current || isDisconnectingRef.current) {
      return;
    }

    // Don't connect if already connected or connecting
    if (eventSourceRef.current) {
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Create EventSource with query parameters
      const url = `/api/teams/events?team=${encodeURIComponent(team)}&round=${encodeURIComponent(round)}`;
      const eventSource = new EventSource(url);

      eventSourceRef.current = eventSource;

      // Connection opened
      eventSource.onopen = () => {
        if (!isMountedRef.current || isDisconnectingRef.current) {
          cleanup();
          return;
        }

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
        if (!isMountedRef.current) return;

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
        if (!isMountedRef.current || isDisconnectingRef.current) {
          cleanup();
          return;
        }

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

        // Only attempt to reconnect if autoReconnect is enabled and we haven't exceeded max attempts
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts &&
          isMountedRef.current &&
          !isDisconnectingRef.current
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
            if (isMountedRef.current && !isDisconnectingRef.current) {
              connect();
            }
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
    isDisconnectingRef.current = true;
    cleanup();
    setState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempts: 0,
    });
    reconnectAttemptsRef.current = 0;
    onClose?.();
    isDisconnectingRef.current = false;
  }, [cleanup, onClose]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    setTimeout(() => {
      if (isMountedRef.current) {
        connect();
      }
    }, 100); // Small delay to ensure cleanup is complete
  }, [disconnect, connect]);

  // Set up connection on mount
  useEffect(() => {
    isMountedRef.current = true;
    connect();

    // Clean up on unmount
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when team or round changes
  useEffect(() => {
    if (state.isConnected && isMountedRef.current) {
      reconnect();
    }
  }, [team, round, state.isConnected, reconnect]);

  // Clean up on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      disconnect();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, disconnect to save resources
        disconnect();
      } else {
        // Page is visible again, reconnect
        if (isMountedRef.current && !state.isConnected) {
          connect();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [disconnect, connect, state.isConnected]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
  };
}
