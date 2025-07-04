'use client';

import { useState, useEffect, useCallback } from 'react';
import { Round } from './admin/types';
import ClosedRound from './ClosedRound';

const RoundTabs = ({ 
  activeRound, 
  onRoundChange,
  roundStatus
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
      <h2 className="text-2xl font-bold text-gray-300">This round is currently locked!</h2>
      <p className="text-gray-400 mt-2">Please wait for the administrator to open this round.</p>
    </div>
  </div>
);

interface OpenRoundProps {
  round: Round;
  isRoundClosed?: boolean;
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

const OpenRound: React.FC<OpenRoundProps> = ({ round, isRoundClosed = false }) => {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [startupData, setStartupData] = useState<StartupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calculate remaining funds and round return
  const remain = teamData && teamData.pre_fund !== null ? 
    teamData.pre_fund - (teamData.s1 + teamData.s2 + teamData.s3 + teamData.s4) : 0;
    
  const roundReturn = teamData && teamData.pre_fund && teamData.post_fund ?
    ((teamData.post_fund - teamData.pre_fund) / teamData.pre_fund) * 100 : 0;

  // Fetch team data
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In production, you would get the current team's ID from the session or context
        const teamId = 'team1'; // TODO: Replace with actual team ID from auth context
        
        // Fetch team data
        const teamResponse = await fetch(`/api/teams/${round}/${teamId}`);
        const teamResult = await teamResponse.json();
        
        if (teamResult.success) {
          setTeamData(teamResult.data);
          
          // If round is closed, fetch startup data
          if (isRoundClosed) {
            const startupResponse = await fetch(`/api/startup/${round}`);
            const startupResult = await startupResponse.json();
            
            if (startupResult.success) {
              // Sort startup data by startup name (s1, s2, s3, s4)
              const sortedData = startupResult.data.sort((a: StartupData, b: StartupData) => 
                a.startup.localeCompare(b.startup)
              );
              setStartupData(sortedData);
            } else {
              throw new Error(startupResult.error || 'Failed to fetch startup data');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, startup: 's1' | 's2' | 's3' | 's4') => {
    if (!teamData) return;
    
    // Convert input to number and ensure it's not negative
    const value = Math.max(0, Number(e.target.value) || 0);
    
    setTeamData({
      ...teamData,
      [startup]: value
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
      setError(`Total investment (${total.toLocaleString()}) exceeds available funds (${teamData.pre_fund.toLocaleString()})`);
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
          submitted: true // Explicitly set submitted to true
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state to reflect the submission
        setTeamData(prev => prev ? { ...prev, submitted: true } : null);
        setSuccess('Portfolio submitted successfully!');
      } else {
        throw new Error(result.error || 'Failed to submit portfolio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit portfolio');
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
          <h2 className="text-xl font-bold text-blue-400 mb-4">Round Performance</h2>
          
          {/* Fund Summary */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Initial Fund:</span>
              <span className="font-medium">${teamData.pre_fund?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Final Value:</span>
              <span className="font-medium">${teamData.post_fund?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Return:</span>
              <span className={`font-bold ${roundReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {roundReturn.toFixed(2)}%
              </span>
            </div>
          </div>
          
          {/* Startup Performance Grid */}
          <div className="grid grid-cols-2 gap-4">
            {startupData.map((startup, index) => {
              const isPositive = startup.yield && parseFloat(startup.yield) >= 0;
              return (
                <div key={startup.startup} className="bg-gray-800 p-3 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-2">
                      {/* Pre-cap Circle */}
                      <div 
                        className="absolute inset-0 border-2 border-blue-500 rounded-full flex items-center justify-center text-xs text-gray-400"
                        style={{
                          width: '100%',
                          height: '100%',
                          opacity: 0.7
                        }}
                      >
                        Pre
                      </div>
                      
                      {/* Post-cap Circle */}
                      {startup.post_cap && startup.pre_cap && (
                        <div 
                          className={`absolute rounded-full flex items-center justify-center text-xs transition-all duration-500 ${
                            isPositive ? 'bg-green-900/30 border-2 border-green-500' : 'bg-red-900/30 border-2 border-red-500'
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
                      <div className="font-medium">{startup.startup.toUpperCase()}</div>
                      <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
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
            <p>Allocate your investment across the four startups (S1, S2, S3, S4) based on your analysis of their potential.</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Each startup has different risk and return profiles</li>
              <li>Diversify your portfolio to manage risk</li>
              <li>Consider the current market conditions</li>
              <li>You cannot invest more than your available funds</li>
            </ul>
            <p className="mt-4 font-medium">Available Funds: ${teamData.pre_fund !== null ? teamData.pre_fund.toLocaleString() : 'Loading...'}</p>
          </div>
        </div>
      )}

      {/* Right Panel - Portfolio Submission */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 mb-6">Portfolio Allocation</h2>
        
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
                <label className="w-16 font-medium">{startup.toUpperCase()}</label>
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
                <span className={`text-lg font-bold ${remain < 0 ? 'text-red-400' : 'text-green-400'}`}>
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
                {isRoundClosed ? 'Round Closed' : teamData.submitted ? 'Submitted' : 'Submit Portfolio'}
              </button>
              
              {/* Debug info - can be removed in production */}
              <div className="mt-2 text-xs text-gray-500">
                Debug: Submitted={teamData.submitted ? 'true' : 'false'}, 
                isRoundClosed={isRoundClosed ? 'true' : 'false'}, 
                remain={remain}
              </div>
              
              {teamData.submitted && (
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Your portfolio has been submitted. You cannot make further changes.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function TeamDashboard() {
  const [activeRound, setActiveRound] = useState<Round>('r1');
  const [isLoading, setIsLoading] = useState(true);
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
    } finally {
      setIsLoading(false);
    }
  }, []);

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

        {currentRoundStatus === 'locked' ? (
          <LockedRound />
        ) : (
          <OpenRound 
            round={activeRound} 
            isRoundClosed={currentRoundStatus === 'closed'}
          />
        )}
      </div>
    </div>
  );
}
