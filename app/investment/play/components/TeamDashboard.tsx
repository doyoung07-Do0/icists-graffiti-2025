'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Round } from './admin/types';
// DISABLE SSE FOR DEBUGGING INFINITE REQUEST BUG
// import { useRoundStatusUpdates } from '@/hooks/useRoundStatusUpdates';
import ClosedRound from './ClosedRound';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface TeamResult {
  team: string;
  post_fund: number | null;
  rank: number;
}

const RoundTabs = ({
  activeRound,
  onRoundChange,
  roundStatus,
}: {
  activeRound: Round;
  onRoundChange: (round: Round) => void;
  roundStatus: Record<Round, { status: 'locked' | 'open' | 'closed' }>;
}) => {
  const rounds: Round[] = ['r1', 'r2', 'r3', 'r4'];

  const statusColors = {
    locked: 'bg-gray-100 text-gray-700',
    open: 'bg-blue-100 text-blue-700',
    closed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex border-b border-gray-700 mb-6">
      {rounds.map((round) => (
        <button
          key={round}
          onClick={() => onRoundChange(round)}
          className={`px-6 py-2 font-medium flex items-center space-x-2 ${
            activeRound === round
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>{round.toUpperCase()}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              statusColors[roundStatus[round].status]
            }`}
          >
            {roundStatus[round].status.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
};

const LockedRound = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="text-2xl font-bold text-gray-300">
        This round is currently locked!
      </h2>
      <p className="text-gray-400 mt-2">
        Please wait for the administrator to open this round.
      </p>
    </div>
  </div>
);

interface OpenRoundProps {
  round: Round;
  isRoundClosed?: boolean;
  teamName: string;
}

interface TeamData {
  team: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  pre_fund: number | null;
  post_fund: number | null;
  submitted: boolean;
}

interface StartupData {
  startup: string;
  pre_cap: number | null;
  yield: string | null;
  post_cap: number | null;
}

const OpenRound: React.FC<OpenRoundProps> = ({
  round,
  isRoundClosed = false,
  teamName,
}) => {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [startupData, setStartupData] = useState<StartupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calculate remaining funds and round return
  const remain =
    teamData && teamData.pre_fund !== null
      ? teamData.pre_fund -
        (teamData.s1 + teamData.s2 + teamData.s3 + teamData.s4)
      : 0;

  const roundReturn =
    teamData && teamData.pre_fund && teamData.post_fund
      ? ((teamData.post_fund - teamData.pre_fund) / teamData.pre_fund) * 100
      : 0;

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use the teamName from props to fetch the correct team's data
        const teamResponse = await fetch(`/api/teams/${round}/${teamName}`);
        const teamResult = await teamResponse.json();

        if (teamResult.success) {
          setTeamData(teamResult.data);

          // If round is closed, fetch startup data
          if (isRoundClosed) {
            const startupResponse = await fetch(`/api/startup/${round}`);
            const startupResult = await startupResponse.json();

            if (startupResult.success) {
              // Sort startup data by startup name (s1, s2, s3, s4)
              const sortedData = startupResult.data.sort(
                (a: StartupData, b: StartupData) =>
                  a.startup.localeCompare(b.startup),
              );
              setStartupData(sortedData);
            } else {
              throw new Error(
                startupResult.error || 'Failed to fetch startup data',
              );
            }
          }
        } else {
          throw new Error(teamResult.error || 'Failed to load team data');
        }
      } catch (err) {
        setError('Failed to load team data');
        console.error('Error fetching team data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [round]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    startup: 's1' | 's2' | 's3' | 's4',
  ) => {
    if (!teamData) return;

    // Convert input to number and ensure it's not negative
    const value = Math.max(0, Number(e.target.value) || 0);

    setTeamData({
      ...teamData,
      [startup]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamData || teamData.pre_fund === null) return;

    // If already submitted, don't proceed
    if (teamData.submitted) {
      setError('Portfolio has already been submitted');
      return;
    }

    // Validate that total doesn't exceed pre_fund
    const total = teamData.s1 + teamData.s2 + teamData.s3 + teamData.s4;
    if (total > teamData.pre_fund) {
      setError(
        `Total investment (${total.toLocaleString()}) exceeds available funds (${teamData.pre_fund.toLocaleString()})`,
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/teams/${round}/${teamData.team}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s1: teamData.s1,
          s2: teamData.s2,
          s3: teamData.s3,
          s4: teamData.s4,
          submitted: true, // Explicitly set submitted to true
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state to reflect the submission
        setTeamData((prev) => (prev ? { ...prev, submitted: true } : null));
        setSuccess('Portfolio submitted successfully!');
      } else {
        throw new Error(result.error || 'Failed to submit portfolio');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit portfolio',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-400">
        Failed to load team data
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
      {/* Left Panel - Hint or Closed Round Info */}
      {isRoundClosed ? (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-blue-400 mb-4">
            Round Performance
          </h2>

          {/* Fund Summary */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Initial Fund:</span>
              <span className="font-medium">
                ${teamData.pre_fund?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Final Value:</span>
              <span className="font-medium">
                ${teamData.post_fund?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Return:</span>
              <span
                className={`font-bold ${roundReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {roundReturn.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Startup Performance Grid */}
          <div className="grid grid-cols-2 gap-4">
            {startupData.map((startup, index) => {
              const isPositive =
                startup.yield && parseFloat(startup.yield) >= 0;
              return (
                <div
                  key={startup.startup}
                  className="bg-gray-800 p-3 rounded-lg"
                >
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-2">
                      {/* Pre-cap Circle */}
                      <div
                        className="absolute inset-0 border-2 border-blue-500 rounded-full flex items-center justify-center text-xs text-gray-400"
                        style={{
                          width: '100%',
                          height: '100%',
                          opacity: 0.7,
                        }}
                      >
                        Pre
                      </div>

                      {/* Post-cap Circle */}
                      {startup.post_cap && startup.pre_cap && (
                        <div
                          className={`absolute rounded-full flex items-center justify-center text-xs transition-all duration-500 ${
                            isPositive
                              ? 'bg-green-900/30 border-2 border-green-500'
                              : 'bg-red-900/30 border-2 border-red-500'
                          }`}
                          style={{
                            width: `${Math.max(40, Math.min(100, (startup.post_cap / (startup.pre_cap || 1)) * 100))}%`,
                            height: `${Math.max(40, Math.min(100, (startup.post_cap / (startup.pre_cap || 1)) * 100))}%`,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          Post
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="font-medium">
                        {startup.startup.toUpperCase()}
                      </div>
                      <div
                        className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {(parseFloat(startup.yield || '0') * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-blue-400 mb-4">Hint</h2>
          <div className="prose prose-invert">
            <p>
              Allocate your investment across the four startups (S1, S2, S3, S4)
              based on your analysis of their potential.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Each startup has different risk and return profiles</li>
              <li>Diversify your portfolio to manage risk</li>
              <li>Consider the current market conditions</li>
              <li>You cannot invest more than your available funds</li>
            </ul>
            <p className="mt-4 font-medium">
              Available Funds: $
              {teamData.pre_fund !== null
                ? teamData.pre_fund.toLocaleString()
                : 'Loading...'}
            </p>
          </div>
        </div>
      )}

      {/* Right Panel - Portfolio Submission */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 mb-6">
          Portfolio Allocation
        </h2>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {(['s1', 's2', 's3', 's4'] as const).map((startup) => (
              <div key={startup} className="flex items-center">
                <label className="w-16 font-medium">
                  {startup.toUpperCase()}
                </label>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2">$</span>
                  <input
                    type="number"
                    min="0"
                    max={teamData.pre_fund || undefined}
                    value={teamData[startup]}
                    onChange={(e) => handleInputChange(e, startup)}
                    disabled={teamData.submitted}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md pl-8 pr-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-gray-700 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Remaining:</span>
                <span
                  className={`text-lg font-bold ${remain < 0 ? 'text-red-400' : 'text-green-400'}`}
                >
                  ${remain.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={isRoundClosed || teamData.submitted || isSubmitting}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${
                  isRoundClosed || teamData.submitted
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRoundClosed
                  ? 'Round Closed'
                  : teamData.submitted
                    ? 'Submitted'
                    : 'Submit Portfolio'}
              </button>

              {/* Debug info - can be removed in production */}
              <div className="mt-2 text-xs text-gray-500">
                Debug: Submitted={teamData.submitted ? 'true' : 'false'},
                isRoundClosed={isRoundClosed ? 'true' : 'false'}, remain=
                {remain}
              </div>

              {teamData.submitted && (
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Your portfolio has been submitted. You cannot make further
                  changes.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface TeamDashboardProps {
  teamName: string;
}

export default function TeamDashboard({ teamName }: TeamDashboardProps) {
  const [activeRound, setActiveRound] = useState<Round>('r1');
  const [isLoading, setIsLoading] = useState(true);
  const [roundStatus, setRoundStatus] = useState<
    Record<Round, { status: 'locked' | 'open' | 'closed' }>
  >({
    r1: { status: 'locked' },
    r2: { status: 'locked' },
    r3: { status: 'locked' },
    r4: { status: 'locked' },
  });
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [results, setResults] = useState<TeamResult[]>([]);

  const fetchFinalResults = useCallback(async () => {
    try {
      setIsLoadingResults(true);
      const response = await fetch('/api/final-results');
      const result = await response.json();

      if (result.success) {
        setResults(result.data);
      } else {
        console.error('Failed to fetch final results:', result.error);
      }
    } catch (error) {
      console.error('Error fetching final results:', error);
    } finally {
      setIsLoadingResults(false);
    }
  }, []);

  const openResultsModal = useCallback(() => {
    setIsResultsOpen(true);
    fetchFinalResults();
  }, [fetchFinalResults]);

  // Type for the round status response item
  type RoundStatusItem = {
    round: Round;
    status: 'locked' | 'open' | 'closed';
  };

  // Fetch round status from the server
  const fetchRoundStatus = useCallback(async () => {
    console.log('Fetching round status from server...');
    try {
      const response = await fetch('/api/admin/round-status');
      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        console.log('Received round status:', result.data);

        // Create a new status map with proper typing
        const statusMap: Record<
          Round,
          { status: 'locked' | 'open' | 'closed' }
        > = {
          r1: { status: 'locked' },
          r2: { status: 'locked' },
          r3: { status: 'locked' },
          r4: { status: 'locked' },
        };

        // Update the status map with the received data
        result.data.forEach((item: RoundStatusItem) => {
          if (isRound(item.round)) {
            statusMap[item.round] = { status: item.status };
          }
        });

        // Only update if the status has actually changed
        setRoundStatus((prev) => {
          const hasChanged = (Object.keys(statusMap) as Round[]).some(
            (round) =>
              !prev[round] || prev[round].status !== statusMap[round].status,
          );

          if (hasChanged) {
            console.log('Round status changed, updating UI...');
            return { ...prev, ...statusMap };
          }

          return prev; // No change needed
        });
      }

      return result.success;
    } catch (error) {
      console.error('Failed to fetch round status:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a ref to store the current round status
  const roundStatusRef = useRef(roundStatus);

  // Update the ref whenever roundStatus changes
  useEffect(() => {
    roundStatusRef.current = roundStatus;
  }, [roundStatus]);

  // Function to force a rerender of the component
  const [, forceRerender] = useState({});
  const triggerRerender = useCallback(() => {
    console.log('Triggering rerender of TeamDashboard');
    forceRerender({});
  }, []);

  // Type guard to check if a string is a valid Round
  const isRound = (round: string): round is Round => {
    return ['r1', 'r2', 'r3', 'r4'].includes(round);
  };

  // Type for the SSE message for round status updates
  type RoundStatusUpdateMessage = {
    type: 'round_status_updated';
    round: Round;
    status: 'locked' | 'open' | 'closed';
    timestamp: string;
  };

  // Function to handle round status updates from SSE
  const handleRoundStatusUpdate = useCallback(
    (message: unknown) => {
      console.log('Received round status update:', message);

      // Type guard to check if the message is a valid round status update
      const isRoundStatusUpdate = (
        msg: any,
      ): msg is RoundStatusUpdateMessage => {
        return (
          msg &&
          typeof msg === 'object' &&
          'type' in msg &&
          msg.type === 'round_status_updated' &&
          'round' in msg &&
          isRound(msg.round) &&
          'status' in msg &&
          ['locked', 'open', 'closed'].includes(msg.status) &&
          'timestamp' in msg &&
          typeof msg.timestamp === 'string'
        );
      };

      // Check if this is a valid round status update message
      if (isRoundStatusUpdate(message)) {
        const { round, status } = message;

        console.log(
          `Round status updated for ${round} to ${status}, refreshing data...`,
        );

        // Update the local state with the new status
        setRoundStatus((prev) => ({
          ...prev,
          [round]: { status },
        }));

        // Force a rerender to ensure UI updates
        triggerRerender();

        // Also fetch the latest round status from the server
        fetchRoundStatus();
      } else {
        console.warn('Received invalid round status update:', message);
      }
    },
    [fetchRoundStatus, triggerRerender],
  );

  // DISABLE SSE FOR DEBUGGING INFINITE REQUEST BUG
  // Set up SSE connection for round status updates
  // Listen to all rounds by using 'all' as the round parameter
  // const { isConnected, error: sseError } = useRoundStatusUpdates(
  //   teamName,
  //   'all', // Listen to all rounds
  //   handleRoundStatusUpdate
  // );

  // Log SSE connection status - DISABLED FOR DEBUGGING
  // useEffect(() => {
  //   console.log(
  //     `SSE connection status: ${isConnected ? 'connected' : 'disconnected'}`,
  //   );
  //   if (sseError) {
  //     console.error('SSE error:', sseError);
  //   }
  // }, [isConnected, sseError]);

  useEffect(() => {
    fetchRoundStatus();
  }, [fetchRoundStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
            Team Dashboard
          </h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentRoundStatus = roundStatus[activeRound].status;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
          Team Dashboard
        </h1>

        <RoundTabs
          activeRound={activeRound}
          onRoundChange={setActiveRound}
          roundStatus={roundStatus}
        />

        <div className="space-y-6">
          {roundStatus.r4.status === 'closed' && (
            <div className="flex justify-center">
              <button
                onClick={openResultsModal}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                최종 결과 보기
              </button>
            </div>
          )}

          {currentRoundStatus === 'locked' ? (
            <LockedRound />
          ) : (
            <OpenRound
              round={activeRound}
              isRoundClosed={currentRoundStatus === 'closed'}
              teamName={teamName}
            />
          )}
        </div>

        <Transition appear show={isResultsOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => setIsResultsOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold leading-6 text-white mb-6 text-center"
                    >
                      최종 결과
                    </Dialog.Title>

                    {isLoadingResults ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.map((team) => (
                          <div
                            key={team.team}
                            className={`flex items-center justify-between p-4 rounded-lg ${
                              team.team === teamName
                                ? 'bg-purple-900/50 border border-purple-500'
                                : 'bg-gray-700/50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                  team.rank === 1
                                    ? 'bg-yellow-400 text-yellow-900'
                                    : team.rank === 2
                                      ? 'bg-gray-300 text-gray-800'
                                      : team.rank === 3
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-gray-600 text-white'
                                } font-bold`}
                              >
                                {team.rank}
                              </div>
                              <span
                                className={`font-medium ${
                                  team.team === teamName
                                    ? 'text-purple-300'
                                    : 'text-white'
                                }`}
                              >
                                {team.team}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-white">
                                {team.post_fund
                                  ? team.post_fund.toLocaleString()
                                  : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {team.post_fund ? 'KRW' : 'No data'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 rounded-md"
                        onClick={() => setIsResultsOpen(false)}
                      >
                        닫기
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}
