'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleResetRounds = async () => {
    if (window.confirm('Are you sure you want to reset all rounds? This will set all rounds to locked status and reset all team data.')) {
      try {
        setIsResetting(true);
        setResetStatus(null);
        
        // Reset rounds status first
        const roundsResponse = await fetch('/api/admin/reset-rounds', {
          method: 'POST',
        });
        
        if (!roundsResponse.ok) {
          const errorData = await roundsResponse.json();
          throw new Error(errorData.error || 'Failed to reset rounds status');
        }
        
        // Reset team data
        const teamsResponse = await fetch('/api/admin/reset-teams', {
          method: 'POST',
        });
        
        const teamsData = await teamsResponse.json();
        
        if (teamsResponse.ok) {
          console.log('Rounds and team data reset successfully');
          setResetStatus('Successfully reset all rounds and team data!');
        } else {
          throw new Error(teamsData.error || 'Failed to reset team data');
        }
      } catch (error) {
        console.error('Reset failed:', error);
        setResetStatus(error instanceof Error ? error.message : 'Failed to reset data');
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
            This will:
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Set all rounds to 'locked' status</li>
              <li>Reset all team data (s1-s4 to 0, pre_fund to 1000, post_fund to NULL, submitted to false)</li>
              <li>Initialize teams 1-16 in all round tables</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
}
