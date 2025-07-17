'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import RoundTabs from './admin/RoundTabs';
import TeamTable from './admin/TeamTable';
import type { TeamData, Round } from './admin/types';
// DISABLE SSE FOR DEBUGGING INFINITE REQUEST BUG
// import { useSSE } from '@/hooks/useSSE';

export default function AdminDashboard() {
  const [activeRound, setActiveRound] = useState<'r1' | 'r2' | 'r3' | 'r4'>(
    'r1',
  );
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

  const [roundStatus, setRoundStatus] = useState<
    Record<Round, { status: 'locked' | 'open' | 'closed' }>
  >({
    r1: { status: 'locked' },
    r2: { status: 'locked' },
    r3: { status: 'locked' },
    r4: { status: 'locked' },
  });

  // Create a ref to store the current refresh function
  const refreshRef = useRef<() => Promise<void>>();

  // SSE connection for real-time updates
  // Use 'all' as round to listen to all rounds and avoid reconnections when activeRound changes
  // DISABLE SSE FOR DEBUGGING INFINITE REQUEST BUG
  // const { isConnected, error: sseError } = useSSE({
  //   team: 'admin',
  //   round: 'all', // Listen to all rounds to avoid reconnections
  //   onMessage: (data) => {
  //     console.log('SSE message received:', data);

  //     // Handle different message types
  //     if (data.type === 'team_updated') {
  //       // Refresh team data when a team updates their portfolio
  //       refreshRef.current?.();
  //     } else if (data.type === 'round_status_updated') {
  //       // Update round status when it changes
  //       setRoundStatus((prev) => ({
  //         ...prev,
  //         [data.round]: { status: data.status },
  //       }));
  //     } else if (data.type === 'ping') {
  //       // Handle ping messages (keep connection alive)
  //       console.log('Received ping from server');
  //     }
  //   },
  //   onError: (error) => {
  //     console.error('SSE connection error:', error);
  //   },
  //   onOpen: () => {
  //     console.log('SSE connection established for admin dashboard');
  //   },
  // });

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
        setRoundStatus((prev) => ({ ...prev, ...statusMap }));
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
      .filter((team) => team?.team) // Filter out any undefined or invalid team data
      .sort((a, b) => {
        try {
          // Safely extract team numbers (e.g., 'team1' -> 1, 'team2' -> 2, etc.)
          const numA = Number.parseInt(a.team.replace('team', ''), 10) || 0;
          const numB = Number.parseInt(b.team.replace('team', ''), 10) || 0;
          return numA - numB;
        } catch (error) {
          console.error('Error sorting teams:', error);
          return 0;
        }
      });
  };

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/teams/${activeRound}`);
      const result = await response.json();

      if (result.success) {
        setTeamData(sortTeamData(result.data));
        // Check if all teams have submitted
        const allSubmitted = result.data.every(
          (team: TeamData) => team.submitted,
        );
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

  // Store the refresh function in the ref
  useEffect(() => {
    refreshRef.current = fetchTeamData;
  }, [fetchTeamData]);

  const handleCloseRound = async () => {
    if (
      !window.confirm(
        `Are you sure you want to close ${activeRound.toUpperCase()}? This will calculate final valuations and cannot be undone.`,
      )
    ) {
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
          round: activeRound,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the round status and team data
        await fetchRoundStatus();
        await fetchTeamData();
        setResetStatus(
          `Successfully closed ${activeRound.toUpperCase()}. Startup valuations have been calculated.`,
        );
      } else {
        throw new Error(result.error || 'Failed to close the round');
      }
    } catch (error) {
      console.error('Failed to close the round:', error);
      setResetStatus(
        `Error: ${error instanceof Error ? error.message : 'Failed to close the round'}`,
      );
    } finally {
      setIsClosingRound(false);
    }
  };

  const handleStartGame = async () => {
    if (
      window.confirm(
        'Are you sure you want to start the game? This will open Round 1 for all teams.',
      )
    ) {
      setIsStartingGame(true);
      try {
        const response = await fetch('/api/admin/round-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            round: 'r1',
            status: 'open',
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Update the local state with the new status
          const statusMap = result.data.reduce((acc: any, item: any) => {
            acc[item.round] = { status: item.status };
            return acc;
          }, {});
          setRoundStatus((prev) => ({ ...prev, ...statusMap }));
          setResetStatus('Game started successfully! Round 1 is now open.');
        } else {
          throw new Error(result.error || 'Failed to start the game');
        }
      } catch (error) {
        console.error('Failed to start the game:', error);
        setResetStatus(
          `Error: ${error instanceof Error ? error.message : 'Failed to start the game'}`,
        );
      } finally {
        setIsStartingGame(false);
      }
    }
  };

  const handleOpenRound = async (round: 'r2' | 'r3' | 'r4') => {
    if (
      window.confirm(
        `Are you sure you want to open ${round.toUpperCase()}? This will copy post_fund values from ${String.fromCharCode(round.charCodeAt(1) - 1)} to pre_fund for all teams.`,
      )
    ) {
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
          setResetStatus(
            `Successfully opened ${round.toUpperCase()}. Pre-fund values have been updated.`,
          );
        } else {
          throw new Error(result.error || 'Failed to open the round');
        }
      } catch (error) {
        console.error('Failed to open the round:', error);
        setResetStatus(
          `Error: ${error instanceof Error ? error.message : 'Failed to open the round'}`,
        );
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
      const response = await fetch(
        `/api/admin/have-all-teams-submitted?round=${activeRound}`,
      );
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

  const handleInputChange = (
    team: string,
    field: keyof TeamData,
    value: any,
  ) => {
    setTeamData((prev) =>
      prev.map((t) => (t.team === team ? { ...t, [field]: value } : t)),
    );
  };

  const toggleSubmitted = async (team: string, currentStatus: boolean) => {
    try {
      const requestBody = {
        team,
        action: 'toggle-submission',
        data: { currentStatus },
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
        // Update local state
        setTeamData((prev) =>
          prev.map((t) =>
            t.team === team ? { ...t, submitted: !currentStatus } : t,
          ),
        );

        // Check if all teams have submitted
        const updatedData = teamData.map((t) =>
          t.team === team ? { ...t, submitted: !currentStatus } : t,
        );
        const allSubmitted = updatedData.every((team) => team.submitted);
        setAllTeamsSubmitted(allSubmitted);

        setResetStatus(
          `Successfully ${!currentStatus ? 'marked' : 'unmarked'} ${team} as submitted.`,
        );
      } else {
        throw new Error(result.error || 'Failed to toggle submission status');
      }
    } catch (error) {
      console.error('Failed to toggle submission status:', error);
      setResetStatus(
        `Error: ${error instanceof Error ? error.message : 'Failed to toggle submission status'}`,
      );
    }
  };

  const markAllAsSubmitted = async () => {
    if (
      !window.confirm('Are you sure you want to mark all teams as submitted?')
    ) {
      return;
    }

    setIsMarkingAllSubmitted(true);
    try {
      const response = await fetch(`/api/admin/teams/${activeRound}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark-all-submitted',
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setTeamData((prev) =>
          prev.map((team) => ({ ...team, submitted: true })),
        );
        setAllTeamsSubmitted(true);
        setResetStatus('Successfully marked all teams as submitted.');
      } else {
        throw new Error(
          result.error || 'Failed to mark all teams as submitted',
        );
      }
    } catch (error) {
      console.error('Failed to mark all teams as submitted:', error);
      setResetStatus(
        `Error: ${error instanceof Error ? error.message : 'Failed to mark all teams as submitted'}`,
      );
    } finally {
      setIsMarkingAllSubmitted(false);
    }
  };

  const handleSubmit = async (team: string) => {
    try {
      const teamToUpdate = teamData.find((t) => t.team === team);
      if (!teamToUpdate) {
        throw new Error('Team not found');
      }

      const requestBody = {
        team,
        action: 'update',
        data: {
          s1: teamToUpdate.s1,
          s2: teamToUpdate.s2,
          s3: teamToUpdate.s3,
          s4: teamToUpdate.s4,
          pre_fund: teamToUpdate.pre_fund,
          post_fund: teamToUpdate.post_fund,
          submitted: teamToUpdate.submitted,
        },
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
        setEditingTeam(null);
        setResetStatus(`Successfully updated ${team}.`);
      } else {
        throw new Error(result.error || 'Failed to update team data');
      }
    } catch (error) {
      console.error('Failed to update team data:', error);
      setResetStatus(
        `Error: ${error instanceof Error ? error.message : 'Failed to update team data'}`,
      );
    }
  };

  const handleResetRounds = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset all rounds? This will reset all team data and round statuses.',
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      // Reset rounds status
      const roundsResponse = await fetch('/api/admin/reset-rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const roundsResult = await roundsResponse.json();

      if (!roundsResult.success) {
        throw new Error(roundsResult.error || 'Failed to reset rounds');
      }

      // Reset team data
      const teamsResponse = await fetch('/api/admin/reset-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const teamsResult = await teamsResponse.json();

      if (!teamsResult.success) {
        throw new Error(teamsResult.error || 'Failed to reset team data');
      }

      // Refresh all data
      await fetchRoundStatus();
      await fetchTeamData();
      setResetStatus('Successfully reset all rounds and team data.');
    } catch (error) {
      console.error('Failed to reset:', error);
      setResetStatus(
        `Error: ${error instanceof Error ? error.message : 'Failed to reset'}`,
      );
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex items-center space-x-4">
          {/* SSE Connection Status - DISABLED FOR DEBUGGING */}
          {/* <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div> */}

          {/* Game Controls */}
          <button
            onClick={handleStartGame}
            disabled={isStartingGame || roundStatus.r1.status !== 'locked'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStartingGame ? 'Starting...' : 'Start Game'}
          </button>

          <button
            onClick={handleResetRounds}
            disabled={isResetting}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? 'Resetting...' : 'Reset All'}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {resetStatus && (
        <div className="p-4 bg-blue-900/50 border border-blue-500 rounded-lg">
          <p className="text-blue-300">{resetStatus}</p>
        </div>
      )}

      {/* SSE Error Display - DISABLED FOR DEBUGGING */}
      {/* {sseError && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-300">SSE Connection Error: {sseError}</p>
        </div>
      )} */}

      {/* Round Tabs */}
      <RoundTabs
        activeRound={activeRound}
        onRoundChange={setActiveRound}
        roundStatus={roundStatus}
      />

      {/* Round Controls */}
      <div className="flex space-x-4">
        {activeRound === 'r1' && roundStatus.r1.status === 'open' && (
          <button
            onClick={handleCloseRound}
            disabled={isClosingRound}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClosingRound ? 'Closing...' : 'Close Round 1'}
          </button>
        )}

        {activeRound === 'r2' &&
          roundStatus.r1.status === 'closed' &&
          roundStatus.r2.status === 'locked' && (
            <button
              onClick={() => handleOpenRound('r2')}
              disabled={isOpeningRound}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOpeningRound ? 'Opening...' : 'Open Round 2'}
            </button>
          )}

        {activeRound === 'r2' && roundStatus.r2.status === 'open' && (
          <button
            onClick={handleCloseRound}
            disabled={isClosingRound}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClosingRound ? 'Closing...' : 'Close Round 2'}
          </button>
        )}

        {activeRound === 'r3' &&
          roundStatus.r2.status === 'closed' &&
          roundStatus.r3.status === 'locked' && (
            <button
              onClick={() => handleOpenRound('r3')}
              disabled={isOpeningRound}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOpeningRound ? 'Opening...' : 'Open Round 3'}
            </button>
          )}

        {activeRound === 'r3' && roundStatus.r3.status === 'open' && (
          <button
            onClick={handleCloseRound}
            disabled={isClosingRound}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClosingRound ? 'Closing...' : 'Close Round 3'}
          </button>
        )}

        {activeRound === 'r4' &&
          roundStatus.r3.status === 'closed' &&
          roundStatus.r4.status === 'locked' && (
            <button
              onClick={() => handleOpenRound('r4')}
              disabled={isOpeningRound}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOpeningRound ? 'Opening...' : 'Open Round 4'}
            </button>
          )}

        {activeRound === 'r4' && roundStatus.r4.status === 'open' && (
          <button
            onClick={handleCloseRound}
            disabled={isClosingRound}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClosingRound ? 'Closing...' : 'Close Round 4'}
          </button>
        )}

        {/* Mark All as Submitted */}
        {roundStatus[activeRound].status === 'open' && !allTeamsSubmitted && (
          <button
            onClick={markAllAsSubmitted}
            disabled={isMarkingAllSubmitted}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMarkingAllSubmitted ? 'Marking...' : 'Mark All Submitted'}
          </button>
        )}
      </div>

      {/* Team Table */}
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
  );
}
