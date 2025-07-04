'use client';

import { useState, useEffect } from 'react';
import { Round } from './admin/types';

interface ClosedRoundProps {
  round: Round;
}

interface TeamData {
  team: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  post_fund: number | null;
}

interface StartupData {
  startup: string;
  pre_cap: number | null;
  yield: string | null;
  post_cap: number | null;
}

const ClosedRound: React.FC<ClosedRoundProps> = ({ round }) => {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [startupData, setStartupData] = useState<StartupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate circle size based on market cap
  const calculateCircleSize = (value: number | null, maxCap: number) => {
    if (!value || value <= 0) return 'w-16 h-16';
    const size = Math.max(64, Math.min(200, (value / maxCap) * 200));
    return `w-[${size}px] h-[${size}px]`;
  };

  // Fetch team and startup data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // In production, get the current team's ID from the session or context
        const teamId = 'team1'; // TODO: Replace with actual team ID from auth context
        
        // Fetch team data
        const teamResponse = await fetch(`/api/teams/${round}/${teamId}`);
        const teamResult = await teamResponse.json();
        
        if (!teamResult.success) {
          throw new Error(teamResult.error || 'Failed to fetch team data');
        }
        
        setTeamData(teamResult.data);
        
        // Fetch startup data for the round
        const startupResponse = await fetch(`/api/startup/${round}`);
        const startupResult = await startupResponse.json();
        
        if (!startupResult.success) {
          throw new Error(startupResult.error || 'Failed to fetch startup data');
        }
        
        // Sort startup data by startup name (s1, s2, s3, s4)
        const sortedData = startupResult.data.sort((a: StartupData, b: StartupData) => 
          a.startup.localeCompare(b.startup)
        );
        
        setStartupData(sortedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load round data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [round]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-400">
        {error}
      </div>
    );
  }

  if (!teamData || startupData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        No data available for this round.
      </div>
    );
  }

  // Find the maximum market cap for scaling circle sizes
  const maxCap = Math.max(
    ...startupData.map(s => Math.max(s.pre_cap || 0, s.post_cap || 0))
  );

  return (
    <div className="space-y-8">
      {/* Portfolio Summary */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Post-Fund Value</p>
            <p className="text-2xl font-bold">
              ${teamData.post_fund?.toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Startup Performance Grid */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 mb-6">Startup Performance</h2>
        <div className="grid grid-cols-2 gap-8">
          {startupData.map((startup, index) => {
            const investment = teamData[`s${index + 1}` as keyof TeamData] as number || 0;
            const returnAmount = startup.post_cap && startup.pre_cap 
              ? (investment * (startup.post_cap / startup.pre_cap)) - investment
              : 0;
            const isPositiveReturn = returnAmount >= 0;
            
            return (
              <div key={startup.startup} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-bold mb-4">{startup.startup.toUpperCase()}</h3>
                  
                  {/* Pre-cap/Post-cap Visualization */}
                  <div className="relative flex items-center justify-center mb-4">
                    {/* Pre-cap Circle */}
                    <div 
                      className={`absolute border-2 border-blue-500 rounded-full flex items-center justify-center transition-all duration-500`}
                      style={{
                        width: '120px',
                        height: '120px',
                      }}
                    >
                      <span className="text-xs text-gray-400">Pre: ${startup.pre_cap?.toLocaleString() || 'N/A'}</span>
                    </div>
                    
                    {/* Post-cap Circle */}
                    <div 
                      className={`absolute rounded-full flex items-center justify-center transition-all duration-500 ${
                        isPositiveReturn ? 'bg-green-900/50 border-2 border-green-500' : 'bg-red-900/50 border-2 border-red-500'
                      }`}
                      style={{
                        width: startup.post_cap && startup.pre_cap 
                          ? `${Math.max(80, Math.min(200, (startup.post_cap / startup.pre_cap) * 200))}px`
                          : '120px',
                        height: startup.post_cap && startup.pre_cap 
                          ? `${Math.max(80, Math.min(200, (startup.post_cap / startup.pre_cap) * 200))}px`
                          : '120px',
                        transition: 'all 0.5s ease-in-out',
                      }}
                    >
                      <span className="text-xs">
                        {startup.post_cap ? `$${startup.post_cap.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="w-full mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Investment:</span>
                      <span>${investment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Yield:</span>
                      <span className={isPositiveReturn ? 'text-green-400' : 'text-red-400'}>
                        {startup.yield || '0.00%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Return:</span>
                      <span className={isPositiveReturn ? 'text-green-400' : 'text-red-400'}>
                        {isPositiveReturn ? '+' : ''}{returnAmount.toLocaleString(undefined, {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-blue-400 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Total Investment</p>
            <p className="text-2xl font-bold">
              ${(teamData.s1 + teamData.s2 + teamData.s3 + teamData.s4).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-400">Final Portfolio Value</p>
            <p className="text-2xl font-bold">
              ${teamData.post_fund?.toLocaleString() || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosedRound;
