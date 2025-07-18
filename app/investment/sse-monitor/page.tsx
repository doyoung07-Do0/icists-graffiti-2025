'use client';

import { useState, useEffect, useCallback } from 'react';

interface SSEMetrics {
  environment: string;
  status: 'connected' | 'disconnected' | 'intermittent';
  activeConnections: number;
  totalEventsSent: number;
  lastHeartbeat: string | null;
  errorCount: number;
  averageResponseTime: number;
}

interface ConnectionLog {
  id: string;
  timestamp: string;
  environment: string;
  event: 'connect' | 'disconnect' | 'error' | 'reconnect';
  message: string;
  details?: any;
}

export default function SSEMonitorPage() {
  const [metrics, setMetrics] = useState<SSEMetrics[]>([
    {
      environment: 'Development',
      status: 'connected',
      activeConnections: 0,
      totalEventsSent: 0,
      lastHeartbeat: null,
      errorCount: 0,
      averageResponseTime: 0,
    },
    {
      environment: 'Production',
      status: 'disconnected',
      activeConnections: 0,
      totalEventsSent: 0,
      lastHeartbeat: null,
      errorCount: 0,
      averageResponseTime: 0,
    },
  ]);

  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Fetch SSE metrics
  const fetchSSEMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sse-metrics');
      const result = await response.json();

      if (result.success) {
        setMetrics(result.data);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch SSE metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch connection logs
  const fetchConnectionLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/sse-logs');
      const result = await response.json();

      if (result.success) {
        setConnectionLogs(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch connection logs:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSSEMetrics();
    fetchConnectionLogs();
  }, [fetchSSEMetrics, fetchConnectionLogs]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSSEMetrics();
      fetchConnectionLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchSSEMetrics, fetchConnectionLogs]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-400';
      case 'disconnected':
        return 'text-red-400';
      case 'intermittent':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'disconnected':
        return '🔴';
      case 'intermittent':
        return '🟡';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">SSE Connection Monitor</h1>
          <p className="text-gray-400">
            Real-time monitoring of Server-Sent Events across environments
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Last updated: {lastUpdate || 'Never'}
          </div>
        </div>

        {/* Connection Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <div
              key={metric.environment}
              className="bg-gray-900 p-6 rounded-lg border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{metric.environment}</h3>
                <span className={`text-2xl ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`font-medium ${getStatusColor(metric.status)}`}
                  >
                    {metric.status.charAt(0).toUpperCase() +
                      metric.status.slice(1)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Active Connections:</span>
                  <span className="font-medium text-white">
                    {metric.activeConnections}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Total Events:</span>
                  <span className="font-medium text-white">
                    {metric.totalEventsSent.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Error Count:</span>
                  <span
                    className={`font-medium ${
                      metric.errorCount > 0 ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {metric.errorCount}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Response:</span>
                  <span className="font-medium text-white">
                    {metric.averageResponseTime}ms
                  </span>
                </div>

                {metric.lastHeartbeat && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Heartbeat:</span>
                    <span className="font-medium text-white text-sm">
                      {new Date(metric.lastHeartbeat).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Connection Logs */}
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Connection Logs</h2>

          {connectionLogs.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No connection logs available
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {connectionLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {log.environment}
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        log.event === 'connect'
                          ? 'bg-green-900/50 text-green-400'
                          : log.event === 'disconnect'
                            ? 'bg-red-900/50 text-red-400'
                            : log.event === 'error'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-yellow-900/50 text-yellow-400'
                      }`}
                    >
                      {log.event.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 max-w-md truncate">
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex space-x-4">
          <button
            type="button"
            onClick={() => {
              fetchSSEMetrics();
              fetchConnectionLogs();
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Refresh Data
          </button>
          <button
            type="button"
            onClick={() => {
              // Clear logs functionality
              setConnectionLogs([]);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Clear Logs
          </button>
        </div>
      </div>
    </div>
  );
}
