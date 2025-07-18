import { useState, useEffect, useRef, useCallback } from 'react';

interface SSEOptions {
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useSSE(url: string, options: SSEOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const {
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectInterval = 5000, // 5 seconds
    maxReconnectAttempts = 10,
  } = options;

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle timeout messages from server
          if (data.type === 'timeout') {
            console.log('Server timeout detected, reconnecting...');
            eventSource.close();
            return;
          }

          onMessage?.(event);
        } catch (err) {
          console.error('Error parsing SSE message:', err);
        }
      };

      eventSource.onerror = (event) => {
        console.error('SSE connection error:', event);
        setIsConnected(false);
        setError('Connection error');
        onError?.(event);

        // Implement reconnection logic
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setReconnectAttempts(reconnectAttemptsRef.current);

          console.log(
            `Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setError(
            `Failed to reconnect after ${maxReconnectAttempts} attempts`,
          );
        }
      };

      // Set up automatic reconnection every 4 minutes to prevent timeouts
      const timeoutReconnect = setInterval(
        () => {
          console.log('Proactive reconnection to prevent timeout...');
          eventSource.close();
        },
        4 * 60 * 1000,
      ); // 4 minutes

      // Cleanup timeout reconnect on close
      const handleClose = () => {
        clearInterval(timeoutReconnect);
        setIsConnected(false);
        onClose?.();
      };

      // Listen for connection close
      eventSource.addEventListener('error', handleClose);
    } catch (err) {
      console.error('Error creating EventSource:', err);
      setError('Failed to create connection');
    }
  }, [
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectInterval,
    maxReconnectAttempts,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setError(null);
    reconnectAttemptsRef.current = 0;
    setReconnectAttempts(0);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    reconnectAttempts,
    disconnect,
    connect,
  };
}
