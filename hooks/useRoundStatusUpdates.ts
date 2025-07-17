// DISABLED FOR DEBUGGING INFINITE REQUEST BUG
// import { useState, useEffect, useCallback, useRef } from 'react';
import type { SSEMessage } from '@/types/sse';

type RoundStatusUpdateCallback = (message: SSEMessage) => void;

export function useRoundStatusUpdates(
  team: string,
  round: string,
  onUpdate: RoundStatusUpdateCallback,
) {
  // const [isConnected, setIsConnected] = useState(false);
  // const [error, setError] = useState<Error | null>(null);
  // const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  // const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const reconnectAttemptsRef = useRef(0);
  // const isMountedRef = useRef(true);
  // const isDisconnectingRef = useRef(false);

  // const MAX_RECONNECT_ATTEMPTS = 5;
  // const INITIAL_RECONNECT_DELAY = 1000; // 1 second
  // const MAX_RECONNECT_DELAY = 30000; // 30 seconds

  // const cleanup = useCallback(() => {
  //   if (reconnectTimeoutRef.current) {
  //     clearTimeout(reconnectTimeoutRef.current);
  //     reconnectTimeoutRef.current = null;
  //   }

  //   if (eventSourceRef.current) {
  //     // Remove event listeners to prevent memory leaks
  //     eventSourceRef.current.onopen = null;
  //     eventSourceRef.current.onmessage = null;
  //     eventSourceRef.current.onerror = null;

  //     eventSourceRef.current.close();
  //     eventSourceRef.current = null;
  //   }
  // }, []);

  // const connect = useCallback(() => {
  //   // Don't connect if component is unmounted or we're in the process of disconnecting
  //   if (!isMountedRef.current || isDisconnectingRef.current) {
  //     return;
  //   }

  //   cleanup(); // Clean up any existing connection

  //   try {
  //     setConnectionStatus('connecting');

  //     // Build the URL with the round parameter only if it's not 'all'
  //     const url =
  //       round === 'all'
  //         ? `/api/teams/events?team=${encodeURIComponent(team)}`
  //         : `/api/teams/events?team=${encodeURIComponent(team)}&round=${encodeURIComponent(round)}`;

  //     console.log(`[${new Date().toISOString()}] Connecting to SSE: ${url}`);
  //     const eventSource = new EventSource(url);
  //     eventSourceRef.current = eventSource;

  //     eventSource.onopen = () => {
  //       if (!isMountedRef.current || isDisconnectingRef.current) {
  //         cleanup();
  //         return;
  //       }

  //       console.log(`[${new Date().toISOString()}] SSE connection opened`);
  //       reconnectAttemptsRef.current = 0;
  //       setIsConnected(true);
  //       setConnectionStatus('connected');
  //       setError(null);
  //     };

  //     eventSource.onmessage = (event: MessageEvent) => {
  //       if (!isMountedRef.current) return;

  //       try {
  //         // Handle ping messages
  //         if (
  //           event.data.trim() === ': ping' ||
  //           event.data.trim().startsWith(':')
  //         ) {
  //           console.log(`[${new Date().toISOString()}] Received ping`);
  //           return;
  //         }

  //         const data = JSON.parse(event.data) as SSEMessage;
  //         console.log(`[${new Date().toISOString()}] Received message:`, data);

  //         // Forward all messages to the callback
  //         onUpdate(data);
  //       } catch (err) {
  //         console.error(
  //           `[${new Date().toISOString()}] Error processing message:`,
  //           err,
  //           'Raw data:',
  //           event.data,
  //         );
  //       }
  //     };

  //     eventSource.onerror = (error) => {
  //       if (!isMountedRef.current || isDisconnectingRef.current) {
  //         cleanup();
  //         return;
  //       }

  //       console.error(`[${new Date().toISOString()}] SSE error:`, error);

  //       setIsConnected(false);
  //       setConnectionStatus('error');

  //       // Clean up the current connection
  //       cleanup();

  //       // Only try to reconnect if we haven't exceeded max attempts and component is still mounted
  //       if (
  //         reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
  //         isMountedRef.current &&
  //         !isDisconnectingRef.current
  //       ) {
  //         const reconnectDelay = Math.min(
  //           INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
  //           MAX_RECONNECT_DELAY,
  //         );
  //         reconnectAttemptsRef.current++;

  //         console.log(
  //           `[${new Date().toISOString()}] Attempting to reconnect in ${reconnectDelay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`,
  //         );

  //         reconnectTimeoutRef.current = setTimeout(() => {
  //           if (isMountedRef.current && !isDisconnectingRef.current) {
  //             setConnectionStatus('reconnecting');
  //             connect();
  //           }
  //         }, reconnectDelay);

  //         setError(
  //           new Error(
  //             `Connection lost. Reconnecting... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
  //           ),
  //         );
  //       } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
  //         setError(
  //           new Error(
  //             'Failed to connect to update server. Please refresh the page.',
  //           ),
  //         );
  //       }
  //     };
  //   } catch (err) {
  //     console.error(
  //       `[${new Date().toISOString()}] Failed to create SSE connection:`,
  //       err,
  //     );
  //     setError(
  //       err instanceof Error
  //         ? err
  //         : new Error('Failed to create SSE connection'),
  //     );
  //     setConnectionStatus('error');

  //     // Only try to reconnect if we haven't exceeded max attempts
  //     if (
  //       reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
  //       isMountedRef.current &&
  //       !isDisconnectingRef.current
  //     ) {
  //       const reconnectDelay = Math.min(
  //         INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
  //         MAX_RECONNECT_DELAY,
  //       );
  //       reconnectAttemptsRef.current++;

  //       reconnectTimeoutRef.current = setTimeout(() => {
  //         if (isMountedRef.current && !isDisconnectingRef.current) {
  //           connect();
  //         }
  //       }, reconnectDelay);
  //     }
  // }
  // , [team, round, onUpdate, cleanup]);

  // // Disconnect function
  // const disconnect = useCallback(() => {
  //   isDisconnectingRef.current = true;
  //   cleanup();
  //   setIsConnected(false);
  //   setConnectionStatus('disconnected');
  //   setError(null);
  //   reconnectAttemptsRef.current = 0;
  //   isDisconnectingRef.current = false;
  // }, [cleanup]);

  // // Initialize connection
  // useEffect(() => {
  //   isMountedRef.current = true;
  //   connect();

  //   return () => {
  //     isMountedRef.current = false;
  //     disconnect();
  //   };
  // }, [connect, disconnect]);

  // // Clean up on page unload
  // useEffect(() => {
  //   const handleBeforeUnload = () => {
  //     disconnect();
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       // Page is hidden, disconnect to save resources
  //       disconnect();
  //     } else {
  //       // Page is visible again, reconnect
  //       if (isMountedRef.current && !isConnected) {
  //         connect();
  //       }
  //     }
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, [disconnect, connect, isConnected]);

  // // Reconnect function
  // const reconnect = useCallback(() => {
  //   reconnectAttemptsRef.current = 0;
  //   disconnect();
  //   setTimeout(() => {
  //     if (isMountedRef.current) {
  //       connect();
  //     }
  //   }, 100);
  // }, [disconnect, connect]);

  return {
    // isConnected,
    // error,
    // connectionStatus,
    // reconnect,
  };
}
