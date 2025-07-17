// DISABLED FOR DEBUGGING INFINITE REQUEST BUG
// import { useEffect, useCallback, useState, useRef } from 'react';
import type { SSEMessage, TeamUpdateEvent } from '@/types/sse';

type TeamUpdateCallback = (message: TeamUpdateEvent) => void;

export function useTeamUpdates(
  team: string,
  round: string,
  onUpdate: TeamUpdateCallback,
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const isDisconnectingRef = useRef(false);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const INITIAL_RECONNECT_DELAY = 1000; // 1 second
  const MAX_RECONNECT_DELAY = 30000; // 30 seconds

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log(`[${new Date().toISOString()}] Closing SSE connection`);

      // Remove event listeners to prevent memory leaks
      eventSourceRef.current.onopen = null;
      eventSourceRef.current.onmessage = null;
      eventSourceRef.current.onerror = null;

      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!team || !round) return;

    // Don't connect if component is unmounted or we're in the process of disconnecting
    if (!isMountedRef.current || isDisconnectingRef.current) {
      return;
    }

    cleanup(); // Clean up any existing connection

    const url = new URL(`/api/teams/events`, window.location.origin);
    url.searchParams.append('team', team);
    url.searchParams.append('round', round);

    console.log(
      `[${new Date().toISOString()}] Connecting to SSE:`,
      url.toString(),
    );

    try {
      eventSourceRef.current = new EventSource(url.toString());
      const eventSource = eventSourceRef.current;

      eventSource.onopen = () => {
        if (!isMountedRef.current || isDisconnectingRef.current) {
          cleanup();
          return;
        }

        console.log(`[${new Date().toISOString()}] SSE connection opened`);
        console.log('SSE readyState:', eventSource.readyState);
        console.log('SSE url:', eventSource.url);
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      };

      eventSource.onmessage = (event: MessageEvent) => {
        if (!isMountedRef.current) return;

        try {
          // Handle ping messages
          if (
            event.data.trim() === ': ping' ||
            event.data.trim().startsWith(':')
          ) {
            console.log(`[${new Date().toISOString()}] Received ping`);
            return;
          }

          const data = JSON.parse(event.data) as SSEMessage;
          console.log(`[${new Date().toISOString()}] Received message:`, data);

          // Handle different message types
          if ('type' in data) {
            switch (data.type) {
              case 'connected':
                console.log(
                  `[${new Date().toISOString()}] Connected to SSE server`,
                );
                break;
              case 'team_updated':
                console.log(
                  `[${new Date().toISOString()}] Processing team update:`,
                  data,
                );
                // Pass the entire message to the callback
                onUpdate(data);
                break;
              default:
                console.log(
                  `[${new Date().toISOString()}] Received unhandled message type: ${(data as { type: string }).type}`,
                );
            }
          } else {
            console.error(
              `[${new Date().toISOString()}] Received malformed message:`,
              data,
            );
          }
        } catch (err) {
          console.error(
            `[${new Date().toISOString()}] Error processing message:`,
            err,
            'Raw data:',
            event.data,
          );
        }
      };

      eventSource.onerror = (event: Event) => {
        if (!isMountedRef.current || isDisconnectingRef.current) {
          cleanup();
          return;
        }

        const errorEvent = event as Event & {
          target?: { readyState?: number; url?: string };
        };
        const readyState = errorEvent.target?.readyState ?? -1;
        const url = errorEvent.target?.url ?? 'unknown';

        console.error(`[${new Date().toISOString()}] SSE error:`, event);
        console.error('SSE readyState on error:', readyState);
        console.error('SSE url on error:', url);

        setIsConnected(false);
        setConnectionStatus('error');

        // Clean up the current connection
        cleanup();

        // Only try to reconnect if we haven't exceeded max attempts and component is still mounted
        if (
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
          isMountedRef.current &&
          !isDisconnectingRef.current
        ) {
          const delay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
            MAX_RECONNECT_DELAY,
          );

          reconnectAttemptsRef.current++;
          console.log(
            `[${new Date().toISOString()}] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && !isDisconnectingRef.current) {
              setConnectionStatus('reconnecting');
              connect();
            }
          }, delay);

          setError(
            new Error(
              `Connection lost. Reconnecting... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
            ),
          );
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          setError(
            new Error(
              'Failed to connect to update server. Please refresh the page.',
            ),
          );
        }
      };
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error setting up SSE:`,
        error,
      );
      setIsConnected(false);
      setConnectionStatus('error');
      setError(
        error instanceof Error
          ? error
          : new Error('Failed to set up SSE connection'),
      );
    }
  }, [team, round, onUpdate, cleanup]);

  // Disconnect function
  const disconnect = useCallback(() => {
    isDisconnectingRef.current = true;
    cleanup();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setError(null);
    reconnectAttemptsRef.current = 0;
    isDisconnectingRef.current = false;
  }, [cleanup]);

  useEffect(() => {
    isMountedRef.current = true;
    setConnectionStatus('connecting');
    connect();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

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
        if (isMountedRef.current && !isConnected) {
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
  }, [disconnect, connect, isConnected]);

  // Debug: Log connection status changes
  useEffect(() => {
    console.log(
      `[${new Date().toISOString()}] Connection status:`,
      connectionStatus,
    );
  }, [connectionStatus]);

  return {
    isConnected,
    error,
    connectionStatus, // 'connecting' | 'connected' | 'reconnecting' | 'error' | 'disconnected'
    reconnect: () => {
      reconnectAttemptsRef.current = 0;
      disconnect();
      setTimeout(() => {
        if (isMountedRef.current) {
          connect();
        }
      }, 100);
    },
  };
}
