'use client';

import { useState, useEffect, useCallback } from 'react';
import RoundTabs from './admin/RoundTabs';
import TeamTable from './admin/TeamTable';
import { TeamData, Round } from './admin/types';

export default function AdminDashboard() {
  const [activeRound, setActiveRound] = useState<'r1' | 'r2' | 'r3' | 'r4'>('r1');
  const [teamData, setTeamData] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

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
    } catch (error) {
      console.error('Failed to fetch round status:', error);
      setResetStatus('Failed to load round status');
    }
  }, []);

  // Sort teams from team1 to team16
  const sortTeamData = (teams: TeamData[]): TeamData[] => {
    return [...teams].sort((a, b) => {
      // Extract team numbers (e.g., 'team1' -> 1, 'team2' -> 2, etc.)
      const numA = parseInt(a.team.replace('team', ''), 10);
      const numB = parseInt(b.team.replace('team', ''), 10);
      return numA - numB;
    });
  };

  // Fetch team data when active round changes
  const fetchTeamData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/teams/${activeRound}`);
      const result = await response.json();
      if (result.success) {
        // Sort the team data before setting it
        const sortedData = sortTeamData(result.data);
        setTeamData(sortedData);
      } else {
        throw new Error(result.error || 'Failed to fetch team data');
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      setResetStatus('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, [activeRound]);

  // Initial data fetch
  useEffect(() => {
    fetchRoundStatus();
  }, [fetchRoundStatus]);

  // Fetch team data when round changes
  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleInputChange = (team: string, field: keyof TeamData, value: any) => {
    setTeamData(prev => 
      prev.map(t => 
        t.team === team ? { ...t, [field]: value } : t
      )
    );
  };

  const toggleSubmitted = async (team: string, currentStatus: boolean) => {
    try {
      console.log('Sending toggle request for team:', team, 'currentStatus:', currentStatus);
      const requestBody = {
        team,
        action: 'toggle-submission',
        data: { currentStatus }
      };
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`/api/admin/teams/${activeRound}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <button
          onClick={handleResetRounds}
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
        
        {/* Action Buttons */}
        <div className="flex space-x-2 ml-4">
          {activeRound === 'r1' && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => console.log('Game start clicked')}
            >
              Game Start
            </button>
          )}
          <button
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            onClick={() => console.log('Close round clicked for', activeRound)}
          >
            Close the round
          </button>
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
