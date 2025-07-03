'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleResetRounds = async () => {
    if (window.confirm('Are you sure you want to reset all rounds? This will set all rounds to locked status and clear all yields.')) {
      try {
        setIsResetting(true);
        setResetStatus(null);
        
        const response = await fetch('/api/admin/reset-rounds', {
          method: 'POST',
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('Rounds reset successfully:', data.data);
          setResetStatus(data.message);
        } else {
          throw new Error(data.error || 'Failed to reset rounds');
        }
      } catch (error) {
        console.error('Failed to reset rounds:', error);
        setResetStatus(error instanceof Error ? error.message : 'Failed to reset rounds');
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Round Management</h2>
          
          <button
            onClick={handleResetRounds}
            disabled={isResetting}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isResetting 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isResetting ? 'Resetting...' : 'Reset All Rounds'}
          </button>
          
          {resetStatus && (
            <p className={`mt-3 ${resetStatus.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
              {resetStatus}
            </p>
          )}
          
          <p className="mt-2 text-sm text-gray-400">
            This will reset all rounds to 'locked' status and clear all yields.
          </p>
        </div>
      </div>
    </div>
  );
}
