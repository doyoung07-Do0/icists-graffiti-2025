import { useState, useEffect, useCallback, useRef } from 'react';
import { SSEMessage } from '@/types/sse';

type RoundStatusUpdateCallback = (message: SSEMessage) => void;

export function useRoundStatusUpdates(team: string, round: string, onUpdate: RoundStatusUpdateCallback) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      setConnectionStatus('connecting');
      
      // Build the URL with the round parameter only if it's not 'all'
      const url = round === 'all' 
        ? `/api/teams/events?team=${encodeURIComponent(team)}`
        : `/api/teams/events?team=${encodeURIComponent(team)}&round=${encodeURIComponent(round)}`;
      
      console.log(`[${new Date().toISOString()}] Connecting to SSE: ${url}`);
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (!isMountedRef.current) return;
        console.log(`[${new Date().toISOString()}] SSE connection opened`);
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
      };

      eventSource.onmessage = (event: MessageEvent) => {
        if (!isMountedRef.current) return;
        
        try {
          // Handle ping messages
          if (event.data.trim() === ': ping' || event.data.trim().startsWith(':')) {
            console.log(`[${new Date().toISOString()}] Received ping`);
            return;
          }
          
          const data = JSON.parse(event.data) as SSEMessage;
          console.log(`[${new Date().toISOString()}] Received message:`, data);
          
          // Forward all messages to the callback
          onUpdate(data);
          
        } catch (err) {
          console.error(`[${new Date().toISOString()}] Error processing message:`, err, 'Raw data:', event.data);
        }
      };

      eventSource.onerror = (error) => {
        if (!isMountedRef.current) return;
        console.error(`[${new Date().toISOString()}] SSE error:`, error);
        
        // Close the connection
        if (eventSource.readyState === EventSource.CLOSED) {
          setIsConnected(false);
          setConnectionStatus('disconnected');
          
          // Try to reconnect with exponential backoff
          const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          
          console.log(`[${new Date().toISOString()}] Attempting to reconnect in ${reconnectDelay}ms...`);
          
          setTimeout(() => {
            if (isMountedRef.current) {
              connect();
            }
          }, reconnectDelay);
        }
      };

    } catch (err) {
      console.error(`[${new Date().toISOString()}] Failed to create SSE connection:`, err);
      setError(err instanceof Error ? err : new Error('Failed to create SSE connection'));
      setConnectionStatus('error');
      
      // Try to reconnect after a delay
      const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      reconnectAttemptsRef.current++;
      
      setTimeout(() => {
        if (isMountedRef.current) {
          connect();
        }
      }, reconnectDelay);
    }
  }, [team, onUpdate]);

  // Initialize connection
  useEffect(() => {
    isMountedRef.current = true;
    connect();
    
    return () => {
      isMountedRef.current = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  // Reconnect function
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  return {
    isConnected,
    error,
    connectionStatus,
    reconnect,
  };
}
