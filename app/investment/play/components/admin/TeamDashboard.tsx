'use client';

import { useState, useCallback } from 'react';
import { useTeamData, type TeamData, type TeamNumber } from '../hooks/useTeamData';

const TEAM_NUMBERS: TeamNumber[] = Array.from({ length: 16 }, (_, i) => i + 1) as TeamNumber[];
const STARTUP_KEYS = ['s1', 's2', 's3', 's4'] as const;

export function TeamDashboard() {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  
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
    resetAllTeams,
    getValue,
    reloadData,
    teamData,
    setTeamData,
    setChanges
  } = useTeamData({ initialRound: 'r1' });

  // Calculate remain based on total and sum of s1-s4
  const calculateRemain = useCallback((teamNumber: TeamNumber) => {
    const total = getValue(teamNumber, 'total');
    const sum = STARTUP_KEYS.reduce((sum, key) => sum + (getValue(teamNumber, key) || 0), 0);
    return Math.max(0, total - sum);
  }, [getValue]);

  // Handle save all button click
  const handleSaveAll = useCallback(async () => {
    setSaveStatus(null);
    
    try {
      // Calculate remain for all teams with changes
      const updatedChanges = { ...changes };
      Object.keys(changes).forEach(teamNum => {
        const teamNumber = parseInt(teamNum) as TeamNumber;
        const remain = calculateRemain(teamNumber);
        updatedChanges[teamNumber] = {
          ...changes[teamNumber],
          remain
        };
      });
      
      // Update local changes with calculated remains
      setChanges(updatedChanges);
      
      // Save all changes
      const result = await saveChanges();
      
      if (result.success) {
        setSaveStatus({ type: 'success', message: 'All changes saved successfully!' });
      } else {
        setSaveStatus({ 
          type: 'error', 
          message: result.error || 'Failed to save changes. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error saving all changes:', error);
      setSaveStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save changes. Please try again.'
      });
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setSaveStatus(null), 3000);
  }, [changes, saveChanges, setChanges, calculateRemain]);
  
  // Handle save single row
  const handleSaveRow = useCallback(async (teamNumber: TeamNumber) => {
    setSaveStatus(null);
    try {
      const teamChanges = { ...changes[teamNumber] };
      if (!teamChanges) return;
      
      // Calculate and update remain before saving
      const remain = calculateRemain(teamNumber);
      teamChanges.remain = remain;
      
      const response = await fetch('/api/teams/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{
          teamNumber,
          roundName: currentRound,
          ...teamChanges
        }])
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Check if this is a validation error
        if (response.status === 400 && responseData.message) {
          throw new Error(responseData.message);
        }
        throw new Error('Failed to save changes');
      }
      
      // Update local state with the saved changes including calculated remain
      setTeamData(prev => ({
        ...prev,
        [teamNumber]: {
          ...prev[teamNumber],
          ...teamChanges,
          remain // Ensure remain is included
        }
      }));
      
      // Clear changes for this team
      setChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[teamNumber];
        return newChanges;
      });
      
      setSaveStatus({ type: 'success', message: 'Changes saved successfully!' });
    } catch (error) {
      console.error('Error saving row:', error);
      setSaveStatus({ 
        type: 'error', 
        message: 'Failed to save changes. Please try again.' 
      });
    }
    
    // Clear status after 3 seconds
    setTimeout(() => setSaveStatus(null), 3000);
  }, [changes, currentRound, setTeamData, setChanges, calculateRemain]);

  // Handle reset button click
  const handleReset = useCallback(() => {
    resetAllChanges();
    setShowResetConfirm(false);
  }, [resetAllChanges]);
  
  // Handle reset all confirm
  const handleResetAllConfirm = useCallback(async () => {
    setShowResetConfirm(false);
    setSaveStatus(null);
    
    try {
      await resetAllChanges();
      setSaveStatus({ type: 'success', message: 'All changes have been reset.' });
    } catch (error) {
      console.error('Error resetting all changes:', error);
      setSaveStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to reset changes' 
      });
    }
  }, [resetAllChanges]);

  // Handle reset all teams to default values
  const handleResetAllTeams = useCallback(async () => {
    setShowResetAllConfirm(false);
    setSaveStatus(null);
    setIsResetting(true);
    
    try {
      const result = await resetAllTeams();
      if (result.success) {
        setSaveStatus({ type: 'success', message: 'All teams have been reset to default values.' });
      } else {
        throw new Error(result.error || 'Failed to reset teams');
      }
    } catch (error) {
      console.error('Error resetting all teams:', error);
      setSaveStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to reset teams' 
      });
    } finally {
      setIsResetting(false);
    }
  }, [resetAllTeams]);

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
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={getValue(teamNum, key) === 0 ? 0 : getValue(teamNum, key) || ''}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          handleCellChange(teamNum, key, value);
                        }}
                        onWheel={(e) => e.currentTarget.blur()} // Prevent scroll changes
                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                  ))}
                  
                  <td className="p-2 text-center">
                    <div className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1">
                      {formatNumber(getValue(teamNum, 'remain') !== undefined ? getValue(teamNum, 'remain') : 0)}
                    </div>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={getValue(teamNum, 'total') !== undefined ? getValue(teamNum, 'total') : ''}
                      onChange={(e) => {
                        // Only allow numbers
                        const value = e.target.value.replace(/\D/g, '');
                        const newTotal = parseInt(value) || 0;
                        handleCellChange(teamNum, 'total', newTotal.toString());
                      }}
                      onWheel={(e) => e.currentTarget.blur()} // Prevent scroll changes
                      className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => hasChanges 
                        ? handleSaveRow(teamNum)
                        : resetTeamChanges(teamNum)
                      }
                      className={`text-xs px-3 py-1 rounded ${
                        hasChanges 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      disabled={loading}
                    >
                      Save
                    </button>
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
          onClick={() => setShowResetAllConfirm(true)}
          disabled={isResetting}
          className={`px-4 py-2 rounded-md ${isResetting ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'}`}
        >
          {isResetting ? 'Resetting...' : 'Reset All Teams'}
        </button>
        <button
          onClick={handleSaveAll}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading || !hasChanges}
        >
          {loading ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {/* Reset All Changes Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Reset</h3>
            <p className="mb-6">Are you sure you want to reset all unsaved changes? This cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reset All Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset All Teams Confirmation Modal */}
      {showResetAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reset All Teams</h3>
            <p className="mb-6">
              This will reset all teams to their default values (Total=1000, s1-s4=0). 
              This action cannot be undone. Are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetAllConfirm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllTeams}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Reset All Teams'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
