'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import RoundTabs from './admin/RoundTabs';
import TeamTable from './admin/TeamTable';
import { TeamData, Round } from './admin/types';
import { useTeamUpdates } from '@/hooks/useTeamUpdates';
import { TeamUpdateEvent } from '@/types/sse';

export default function AdminDashboard() {
  const [activeRound, setActiveRound] = useState<'r1' | 'r2' | 'r3' | 'r4'>('r1');
  const [teamData, setTeamData] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isClosingRound, setIsClosingRound] = useState(false);
  const [isOpeningRound, setIsOpeningRound] = useState(false);
  const [isMarkingAllSubmitted, setIsMarkingAllSubmitted] = useState(false);
  const [allTeamsSubmitted, setAllTeamsSubmitted] = useState(false);

  const [roundStatus, setRoundStatus] = useState<Record<Round, { status: 'locked' | 'open' | 'closed' }>>({
    r1: { status: 'locked' },
    r2: { status: 'locked' },
    r3: { status: 'locked' },
    r4: { status: 'locked' },
  });

  // Fetch round status
  const fetchRoundStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/round-status');
      const result = await response.json();
      if (result.success) {
        const statusMap = result.data.reduce((acc: any, item: any) => {
          acc[item.round] = { status: item.status };
          return acc;
        }, {});
        setRoundStatus(prev => ({ ...prev, ...statusMap }));
      }
      return result.success;
    } catch (error) {
      console.error('Failed to fetch round status:', error);
      setResetStatus('Failed to load round status');
      return false;
    }
  }, []);

  // Sort teams from team1 to team16
  const sortTeamData = (teams: TeamData[]): TeamData[] => {
    return [...teams]
      .filter(team => team && team.team) // Filter out any undefined or invalid team data
      .sort((a, b) => {
        try {
          // Safely extract team numbers (e.g., 'team1' -> 1, 'team2' -> 2, etc.)
          const numA = parseInt(a.team.replace('team', ''), 10) || 0;
          const numB = parseInt(b.team.replace('team', ''), 10) || 0;
          return numA - numB;
        } catch (error) {
          console.error('Error sorting teams:', error);
          return 0;
        }
      });
  };

  // Create a ref to store the current refresh function
  const refreshRef = useRef<() => Promise<void>>();

  // Define handleTeamUpdate using the ref
  const handleTeamUpdate = useCallback((message: any) => {
    console.log('SSE message received, refreshing data...', message);
    if (refreshRef.current) {
      refreshRef.current();
    } else {
      console.log('Refresh function not ready yet, will refresh on next update');
    }
  }, []);

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/teams/${activeRound}`);
      const result = await response.json();
      
      if (result.success) {
        setTeamData(sortTeamData(result.data));
        // Check if all teams have submitted
        const allSubmitted = result.data.every((team: TeamData) => team.submitted);
        setAllTeamsSubmitted(allSubmitted);
      } else {
        throw new Error(result.error || 'Failed to fetch team data');
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setResetStatus('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, [activeRound]);

  const handleCloseRound = async () => {
    if (!window.confirm(`Are you sure you want to close ${activeRound.toUpperCase()}? This will calculate final valuations and cannot be undone.`)) {
      return;
    }

    setIsClosingRound(true);
    try {
      const response = await fetch('/api/admin/close-round', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round: activeRound
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh the round status and team data
        await fetchRoundStatus();
        await fetchTeamData();
        setResetStatus(`Successfully closed ${activeRound.toUpperCase()}. Startup valuations have been calculated.`);
      } else {
        throw new Error(result.error || 'Failed to close the round');
      }
    } catch (error) {
      console.error('Failed to close the round:', error);
      setResetStatus(`Error: ${error instanceof Error ? error.message : 'Failed to close the round'}`);
    } finally {
      setIsClosingRound(false);
    }
  };

  const handleStartGame = async () => {
    if (window.confirm('Are you sure you want to start the game? This will open Round 1 for all teams.')) {
      setIsStartingGame(true);
      try {
        const response = await fetch('/api/admin/round-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            round: 'r1',
            status: 'open'
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Update the local state with the new status
          const statusMap = result.data.reduce((acc: any, item: any) => {
            acc[item.round] = { status: item.status };
            return acc;
          }, {});
          setRoundStatus(prev => ({ ...prev, ...statusMap }));
          setResetStatus('Game started successfully! Round 1 is now open.');
        } else {
          throw new Error(result.error || 'Failed to start the game');
        }
      } catch (error) {
        console.error('Failed to start the game:', error);
        setResetStatus(`Error: ${error instanceof Error ? error.message : 'Failed to start the game'}`);
      } finally {
        setIsStartingGame(false);
      }
    }
  };

  const handleOpenRound = async (round: 'r2' | 'r3' | 'r4') => {
    if (window.confirm(`Are you sure you want to open ${round.toUpperCase()}? This will copy post_fund values from ${String.fromCharCode(round.charCodeAt(1) - 1)} to pre_fund for all teams.`)) {
      setIsOpeningRound(true);
      try {
        const response = await fetch('/api/admin/open-round', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ round }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Refresh the round status and team data
          await fetchRoundStatus();
          await fetchTeamData();
          setResetStatus(`Successfully opened ${round.toUpperCase()}. Pre-fund values have been updated.`);
        } else {
          throw new Error(result.error || 'Failed to open the round');
        }
      } catch (error) {
        console.error('Failed to open the round:', error);
        setResetStatus(`Error: ${error instanceof Error ? error.message : 'Failed to open the round'}`);
      } finally {
        setIsOpeningRound(false);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRoundStatus();
  }, [fetchRoundStatus]);

  // Check if all teams have submitted for the current round
  const checkAllTeamsSubmitted = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/have-all-teams-submitted?round=${activeRound}`);
      const result = await response.json();
      if (result.success) {
        setAllTeamsSubmitted(result.allSubmitted);
      }
    } catch (error) {
      console.error('Failed to check team submission status:', error);
      setResetStatus('Failed to check team submission status');
    }
  }, [activeRound]);

  // Fetch team data when active round changes
  useEffect(() => {
    fetchTeamData();
    checkAllTeamsSubmitted();
  }, [fetchTeamData, checkAllTeamsSubmitted]);

  const handleInputChange = (team: string, field: keyof TeamData, value: any) => {
    setTeamData(prev => 
      prev.map(t => 
        t.team === team ? { ...t, [field]: value } : t
      )
    );
  };

  const toggleSubmitted = async (team: string, currentStatus: boolean) => {
    try {
      const requestBody = {
        team,
        action: 'toggle-submission',
        data: { currentStatus }
      };
      
      const response = await fetch(`/api/admin/teams/${activeRound}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      
      if (result.success) {
        handleInputChange(team, 'submitted', !currentStatus);
      } else {
        throw new Error(result.error || 'Failed to toggle submission status');
      }
    } catch (error) {
      console.error('Failed to toggle submission status:', error);
      setResetStatus('Failed to update submission status');
    }
  };

  const markAllAsSubmitted = async () => {
    if (!window.confirm('Are you sure you want to mark all teams as submitted?')) {
      return;
    }

    setIsMarkingAllSubmitted(true);
    setResetStatus('Marking all teams as submitted...');

    try {
      // Get teams that are not yet submitted
      const teamsToUpdate = teamData.filter(team => !team.submitted);
      
      // Process each team one by one
      for (const team of teamsToUpdate) {
        try {
          const response = await fetch(`/api/admin/teams/${activeRound}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              team: team.team,
              action: 'toggle-submission',
              data: { currentStatus: false } // Toggle from false to true
            }),
          });

          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.error || `Failed to update team ${team.team}`);
          }
          
          // Update local state for this team
          handleInputChange(team.team, 'submitted', true);
          
        } catch (error) {
          console.error(`Failed to update team ${team.team}:`, error);
          // Continue with other teams even if one fails
        }
      }
      
      setResetStatus('All teams have been marked as submitted.');
    } catch (error) {
      console.error('Failed to mark all teams as submitted:', error);
      setResetStatus(`Error: ${error instanceof Error ? error.message : 'Failed to update all teams'}`);
    } finally {
      setIsMarkingAllSubmitted(false);
    }
  };

  const handleSubmit = async (team: string) => {
    try {
      const teamToUpdate = teamData.find(t => t.team === team);
      if (!teamToUpdate) return;

      const { team: teamName, ...updateData } = teamToUpdate;
      
      const response = await fetch(`/api/admin/teams/${activeRound}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team: teamName,
          action: 'update',
          data: updateData
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setEditingTeam(null);
        setResetStatus(`Successfully updated ${team} data`);
        // Refresh data to ensure consistency
        fetchTeamData();
      } else {
        throw new Error(result.error || 'Failed to update team data');
      }
    } catch (error) {
      console.error('Failed to update team data:', error);
      setResetStatus(`Failed to update ${team} data`);
    }
  };

  const handleResetRounds = async () => {
    if (window.confirm('Are you sure you want to reset all rounds? This will reset all data.')) {
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
        
        if (!teamsResponse.ok) {
          const errorData = await teamsResponse.json();
          throw new Error(errorData.error || 'Failed to reset team data');
        }
        
        // Reset startup data
        const startupsResponse = await fetch('/api/admin/reset-startups', {
          method: 'POST',
        });
        
        if (!startupsResponse.ok) {
          const errorData = await startupsResponse.json();
          throw new Error(errorData.error || 'Failed to reset startup data');
        }
        
        // Refresh all data
        await Promise.all([
          fetchRoundStatus(),
          fetchTeamData(),
        ]);
        
        setResetStatus('Successfully reset all rounds, team data, and startup data!');
      } catch (error) {
        console.error('Reset failed:', error);
        setResetStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Define refreshData after all its dependencies are defined
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchRoundStatus(),
        fetchTeamData(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setResetStatus('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchRoundStatus, fetchTeamData]);

  // Update the refresh ref whenever refreshData changes
  useEffect(() => {
    refreshRef.current = refreshData;
  }, [refreshData]);

  // Set up SSE connection for real-time updates
  const { isConnected, error: connectionError } = useTeamUpdates('admin', activeRound, handleTeamUpdate);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live updates connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      {connectionError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          {connectionError.message}
        </div>
      )}
      <div className="mb-6">
        <p className="text-gray-600">Manage teams and monitor submissions for Round {activeRound}</p>
      </div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleResetRounds();
          }}
          disabled={isResetting}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md shadow-sm hover:shadow-lg hover:bg-gradient-to-r hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isResetting ? 'Resetting...' : 'Reset All Data'}
        </button>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        {/* Round Tabs */}
        <div className="flex-1">
          <RoundTabs 
            activeRound={activeRound} 
            onRoundChange={setActiveRound}
            roundStatus={roundStatus}
          />
        </div>
        
        <div className="flex space-x-2">
          {activeRound === 'r1' && roundStatus.r1.status === 'locked' && (
            <button
              onClick={handleStartGame}
              disabled={isStartingGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
            >
              {isStartingGame ? 'Starting...' : 'Game Start'}
            </button>
          )}
          
          {['r2', 'r3', 'r4'].includes(activeRound) && roundStatus[activeRound].status === 'locked' && (
            <button
              onClick={() => handleOpenRound(activeRound as 'r2' | 'r3' | 'r4')}
              disabled={isOpeningRound}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-green-300"
            >
              {isOpeningRound ? 'Opening...' : `Open ${activeRound.toUpperCase()}`}
            </button>
          )}
          
          {roundStatus[activeRound]?.status === 'open' && (
            <button
              onClick={handleCloseRound}
              disabled={!allTeamsSubmitted || isClosingRound}
              className={`px-4 py-2 text-white rounded ${
                !allTeamsSubmitted || isClosingRound
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
              title={!allTeamsSubmitted ? 'Not all teams have submitted their portfolio' : 'Close the current round'}
            >
              {isClosingRound ? 'Closing...' : 'Close the round'}
            </button>
          )}
        </div>
      </div>

      {/* Team Table */}
      <div className="mb-8">
        <TeamTable
          data={teamData}
          isLoading={isLoading}
          editingTeam={editingTeam}
          onToggleSubmitted={toggleSubmitted}
          onInputChange={handleInputChange}
          setEditingTeam={setEditingTeam}
          onSubmit={handleSubmit}
          onMarkAllSubmitted={markAllAsSubmitted}
          isMarkingAllSubmitted={isMarkingAllSubmitted}
          roundStatus={roundStatus[activeRound]?.status}
        />
      </div>

      {/* Status Message */}
      {resetStatus && (
        <div className="mb-6">
          <p className={`${resetStatus.startsWith('Failed') ? 'text-red-400' : 'text-green-400'}`}>
            {resetStatus}
          </p>
        </div>
      )}
    </div>
  );
}
