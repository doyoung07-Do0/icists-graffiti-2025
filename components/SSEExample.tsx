'use client';

import { useState } from 'react';
import { useSSE } from '@/hooks/useSSE';

export default function SSEExample() {
  const [messages, setMessages] = useState<
    Array<{ id: number; text: string; timestamp: string }>
  >([]);
  const [messageCount, setMessageCount] = useState(0);

  // Connect to SSE endpoint
  const { isConnected, error, reconnect } = useSSE({
    team: 'example',
    round: 'r1',
    onMessage: (data) => {
      // Handle incoming messages
      setMessages((prev) => [
        ...prev,
        {
          id: messageCount + 1,
          text: JSON.stringify(data, null, 2),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setMessageCount((prev) => prev + 1);
    },
    onError: (error) => {
      console.error('SSE connection error:', error);
    },
    onOpen: () => {
      console.log('SSE connection established');
    },
  });

  const clearMessages = () => {
    setMessages([]);
    setMessageCount(0);
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">SSE Example</h2>

      {/* Connection Status */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className="text-gray-300">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={reconnect}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reconnect
        </button>

        <button
          onClick={clearMessages}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Messages
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded mb-4">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="bg-gray-800 rounded p-4 h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-2">
          Received Messages ({messageCount})
        </h3>

        {messages.length === 0 ? (
          <p className="text-gray-400">No messages received yet...</p>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="bg-gray-700 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-400">
                    Message #{message.id}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp}
                  </span>
                </div>
                <pre className="text-sm text-green-300 whitespace-pre-wrap">
                  {message.text}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500 rounded">
        <h4 className="text-blue-300 font-semibold mb-2">How to test:</h4>
        <ol className="text-sm text-gray-300 space-y-1">
          <li>1. Open the admin dashboard in another tab</li>
          <li>2. Start the game or change round status</li>
          <li>3. Watch for real-time updates here</li>
          <li>4. Try disconnecting and reconnecting</li>
        </ol>
      </div>
    </div>
  );
}
