'use client';

import { useState, useEffect } from 'react';
import RoundTabs from './admin/RoundTabs';
import TeamTable from './admin/TeamTable';
import { TeamData } from './admin/types';

export default function AdminDashboard() {
  const [activeRound, setActiveRound] = useState<'r1' | 'r2' | 'r3' | 'r4'>('r1');
  const [teamData, setTeamData] = useState<TeamData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  // Mock round status - replace with actual data from your database
  const [roundStatus, setRoundStatus] = useState({
    r1: { status: 'locked' as const },
    r2: { status: 'locked' as const },
    r3: { status: 'locked' as const },
    r4: { status: 'locked' as const },
  });

  // Fetch team data when active round changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        const mockData = Array.from({ length: 16 }, (_, i) => ({
          team: `team${i + 1}`,
          s1: 0,
          s2: 0,
          s3: 0,
          s4: 0,
          pre_fund: 1000,
          post_fund: null,
          submitted: false,
        }));
        setTeamData(mockData);
      } catch (error) {
        console.error('Failed to fetch team data:', error);
        setResetStatus('Failed to load team data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeRound]);

  const handleInputChange = (team: string, field: keyof TeamData, value: any) => {
    setTeamData(prev => 
      prev.map(t => 
        t.team === team ? { ...t, [field]: value } : t
      )
    );
  };

  const toggleSubmitted = async (team: string, currentStatus: boolean) => {
    // TODO: Implement API call to update submission status
    handleInputChange(team, 'submitted', !currentStatus);
  };

  const handleSubmit = async (team: string) => {
    try {
      // TODO: Implement API call to save changes
      // await updateTeamData(activeRound, teamData.find(t => t.team === team));
      setEditingTeam(null);
      setResetStatus(`Successfully updated ${team} data`);
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
        
        // Refresh the data
        setTeamData(prev => [...prev]);
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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Round Tabs */}
      <RoundTabs 
        activeRound={activeRound} 
        onRoundChange={setActiveRound}
        roundStatus={roundStatus}
      />

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

      {/* Reset Button */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Reset All Rounds</h2>
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
            <p className={`ml-4 ${resetStatus.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
              {resetStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
