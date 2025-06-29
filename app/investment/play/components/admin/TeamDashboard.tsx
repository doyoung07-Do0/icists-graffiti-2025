'use client';

import { useState, useCallback } from 'react';
import { useTeamData } from '../hooks/useTeamData';

type TeamNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

const TEAM_NUMBERS: TeamNumber[] = Array.from({ length: 16 }, (_, i) => i + 1) as TeamNumber[];
const STARTUP_KEYS = ['s1', 's2', 's3', 's4'] as const;

export function TeamDashboard() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const {
    currentRound,
    setCurrentRound,
    loading,
    changes,
    hasChanges,
    changedTeams,
    roundNames,
    handleCellChange,
    saveChanges,
    resetTeamChanges,
    resetAllChanges,
    getValue,
    reloadData
  } = useTeamData({ initialRound: 'r1' });

  // Handle save button click
  const handleSave = useCallback(async () => {
    setSaveStatus(null);
    const result = await saveChanges();
    
    if (result.success) {
      setSaveStatus({ type: 'success', message: 'Changes saved successfully!' });
    } else {
      setSaveStatus({ 
        type: 'error', 
        message: result.error || 'Failed to save changes. Please try again.' 
      });
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setSaveStatus(null), 3000);
  }, [saveChanges]);

  // Handle reset button click
  const handleReset = useCallback(() => {
    resetAllChanges();
    setShowResetConfirm(false);
  }, [resetAllChanges]);

  // Calculate column totals
  const calculateColumnTotal = useCallback((field: string) => {
    return TEAM_NUMBERS.reduce((sum, teamNum) => {
      return sum + (getValue(teamNum, field as keyof typeof getValue) || 0);
    }, 0);
  }, [getValue]);

  // Calculate row totals
  const calculateRowTotal = useCallback((teamNumber: TeamNumber) => {
    return STARTUP_KEYS.reduce((sum, key) => {
      return sum + (getValue(teamNumber, key) || 0);
    }, 0);
  }, [getValue]);

  // Calculate grand total
  const calculateGrandTotal = useCallback(() => {
    return TEAM_NUMBERS.reduce((sum, teamNum) => {
      return sum + calculateRowTotal(teamNum);
    }, 0);
  }, [calculateRowTotal]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="bg-black text-[#E5E7EB] min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <select
            value={currentRound}
            onChange={(e) => setCurrentRound(e.target.value as any)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700"
          >
            {Object.entries(roundNames).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          
          <button
            onClick={reloadData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {saveStatus && (
        <div className={`mb-4 p-3 rounded-md ${saveStatus.type === 'success' ? 'bg-green-900' : 'bg-red-900'}`}>
          {saveStatus.message}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto glass-card rounded-lg p-4 mb-6">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-3 font-medium">Team</th>
              {STARTUP_KEYS.map((key) => (
                <th key={key} className="p-3 font-medium text-center">
                  {key.toUpperCase()}
                </th>
              ))}
              <th className="p-3 font-medium text-center">Remain</th>
              <th className="p-3 font-medium text-center">Total</th>
              <th className="p-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {TEAM_NUMBERS.map((teamNum) => {
              const hasChanges = changedTeams.includes(teamNum);
              return (
                <tr key={`team-${teamNum}`} className="border-b border-gray-800 hover:bg-gray-900">
                  <td className="p-3 font-medium">
                    <div className="flex items-center">
                      <span>Team {teamNum}</span>
                      {hasChanges && (
                        <span className="ml-2 w-2 h-2 bg-yellow-500 rounded-full"></span>
                      )}
                    </div>
                  </td>
                  
                  {STARTUP_KEYS.map((key) => (
                    <td key={`${teamNum}-${key}`} className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={getValue(teamNum, key) || ''}
                        onChange={(e) => handleCellChange(teamNum, key, e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
                      />
                    </td>
                  ))}
                  
                  <td className="p-2 text-center">
                    <div className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1">
                      {formatNumber(getValue(teamNum, 'remain') || 0)}
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      value={getValue(teamNum, 'total') || ''}
                      onChange={(e) => {
                        const newTotal = parseInt(e.target.value) || 0;
                        handleCellChange(teamNum, 'total', newTotal.toString());
                        // The remain will be automatically updated by the effect in useTeamData
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center font-bold"
                    />
                  </td>
                  <td className="p-2 text-center">
                    {hasChanges && (
                      <button
                        onClick={() => resetTeamChanges(teamNum)}
                        className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 mr-1"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            
            {/* Footer with totals */}
            <tr className="bg-gray-900 font-bold">
              <td className="p-3">Total</td>
              {STARTUP_KEYS.map((key) => (
                <td key={`total-${key}`} className="p-2 text-center">
                  {formatNumber(calculateColumnTotal(key))}
                </td>
              ))}
              <td className="p-2 text-center">
                {formatNumber(calculateColumnTotal('remain'))}
              </td>
              <td className="p-2 text-center">
                {formatNumber(calculateGrandTotal())}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          disabled={loading}
        >
          Reset All
        </button>
        
        <button
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Reset</h3>
            <p className="mb-6">Are you sure you want to reset all changes? This cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
