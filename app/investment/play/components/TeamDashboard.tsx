'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Round } from './admin/types';
// DISABLE SSE FOR DEBUGGING INFINITE REQUEST BUG
// import { useRoundStatusUpdates } from '@/hooks/useRoundStatusUpdates';
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
    open: 'bg-green-100 text-green-700',
    closed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="flex border-b border-gray-700">
      {rounds.map((round) => (
        <button
          type="button"
          key={round}
          onClick={() => onRoundChange(round)}
          className={`px-6 py-2 font-medium flex items-center space-x-2 ${
            activeRound === round
              ? 'border-b-2 border-green-500 text-green-400'
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
  onPortfolioSubmitted?: () => void;
}

interface TeamData {
  team: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  pre_fund: number | null;
  post_fund: number | null;
  submitted: boolean;
}

interface CumulativeInvestmentData {
  team: string;
  currentRound: Round;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  total: number;
  preFund: number;
}

interface TeamRankingData {
  team: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  total: number;
  postFund: number;
  rank: number;
}

interface CumulativeRankingDisplayProps {
  currentRound: Round;
  teamName: string;
}

interface CumulativeInvestmentDisplayProps {
  teamName: string;
  currentRound: Round;
  refetchTrigger: number;
}

interface StartupData {
  startup: string;
  pre_cap: number | null;
  yield: string | null;
  post_cap: number | null;
}

const CumulativeRankingDisplay: React.FC<CumulativeRankingDisplayProps> = ({
  currentRound,
  teamName,
}) => {
  const [rankingData, setRankingData] = useState<TeamRankingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ranking data (no caching)
  const fetchRankingData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/teams/cumulative?currentRound=${currentRound}`,
      );
      const result = await response.json();
      if (result.success) {
        setRankingData(result.data.teams);
      } else {
        throw new Error(result.error || 'Failed to fetch ranking data');
      }
    } catch (err) {
      setError('Failed to load ranking data');
      console.error('Error fetching ranking data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentRound]);

  // Initial fetch
  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);

  // Remove cache clearing and manual clearCache function

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-lg border border-gray-700"
        style={{
          backgroundColor: '#0a0a0a',
        }}
      >
        <h2
          className="text-xl font-bold mb-6 text-center"
          style={{
            background:
              'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
          }}
        >
          누적 투자금 및 순위
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
        </div>
      </div>
    );
  }

  if (error || !rankingData.length) {
    return (
      <div
        className="p-6 rounded-lg border border-gray-700"
        style={{
          backgroundColor: '#0a0a0a',
        }}
      >
        <h2
          className="text-xl font-bold mb-6 text-center"
          style={{
            background:
              'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
          }}
        >
          누적 투자금 및 순위
        </h2>
        <div className="text-center text-red-400 py-4">
          {error || 'Failed to load ranking data'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-lg border border-gray-700"
      style={{
        backgroundColor: '#0a0a0a',
      }}
    >
      <h2
        className="text-xl font-bold mb-6 text-center"
        style={{
          background:
            'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block',
        }}
      >
        누적 투자금 및 순위
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-center py-3 px-2 font-medium text-white">
                Rank
              </th>
              <th className="text-left py-3 px-4 font-medium text-white">
                team
              </th>
              <th className="text-center py-3 px-2 font-bold text-white">
                배럴아이
              </th>
              <th className="text-center py-3 px-2 font-bold text-white">
                일리아스
              </th>
              <th className="text-center py-3 px-2 font-bold text-white">
                북엔드
              </th>
              <th className="text-center py-3 px-2 font-bold text-white">
                라스커
              </th>
              <th className="text-center py-3 px-2 font-bold text-white">
                뉴톤
              </th>
              <th
                className="text-center py-3 px-4 font-bold text-lg"
                style={{
                  background:
                    'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Total Fund
              </th>
            </tr>
          </thead>
          <tbody>
            {rankingData.map((team) => (
              <tr
                key={team.team}
                className={`border-b border-gray-800 hover:bg-gray-800/50 ${
                  team.team === teamName
                    ? 'bg-green-900/30 border-l-4 border-l-green-500'
                    : ''
                }`}
              >
                <td className="text-center py-3 px-2 font-bold">
                  <span
                    className={`${
                      team.rank <= 3
                        ? 'text-gray-300'
                        : team.rank <= 6
                          ? 'text-gray-400'
                          : team.rank <= 9
                            ? 'text-gray-500'
                            : team.rank <= 12
                              ? 'text-gray-600'
                              : 'text-gray-700'
                    }`}
                  >
                    {team.rank}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium">
                  <span
                    className={
                      team.team === teamName ? 'text-white' : 'text-gray-400'
                    }
                  >
                    {team.team}
                  </span>
                </td>
                <td className="text-center py-3 px-2 text-white">
                  {(() => {
                    const values = [
                      team.s1,
                      team.s2,
                      team.s3,
                      team.s4,
                      team.s5,
                    ];
                    const maxValue = Math.max(...values);
                    const minValue = Math.min(...values);
                    const intensity =
                      maxValue === minValue
                        ? 0
                        : (team.s1 - minValue) / (maxValue - minValue);
                    const bgOpacity = 0.05 + intensity * 0.7;
                    return (
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                        }}
                      >
                        {team.s1.toLocaleString()}
                      </span>
                    );
                  })()}
                </td>
                <td className="text-center py-3 px-2 text-white">
                  {(() => {
                    const values = [
                      team.s1,
                      team.s2,
                      team.s3,
                      team.s4,
                      team.s5,
                    ];
                    const maxValue = Math.max(...values);
                    const minValue = Math.min(...values);
                    const intensity =
                      maxValue === minValue
                        ? 0
                        : (team.s2 - minValue) / (maxValue - minValue);
                    const bgOpacity = 0.05 + intensity * 0.7;
                    return (
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                        }}
                      >
                        {team.s2.toLocaleString()}
                      </span>
                    );
                  })()}
                </td>
                <td className="text-center py-3 px-2 text-white">
                  {(() => {
                    const values = [
                      team.s1,
                      team.s2,
                      team.s3,
                      team.s4,
                      team.s5,
                    ];
                    const maxValue = Math.max(...values);
                    const minValue = Math.min(...values);
                    const intensity =
                      maxValue === minValue
                        ? 0
                        : (team.s3 - minValue) / (maxValue - minValue);
                    const bgOpacity = 0.05 + intensity * 0.7;
                    return (
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                        }}
                      >
                        {team.s3.toLocaleString()}
                      </span>
                    );
                  })()}
                </td>
                <td className="text-center py-3 px-2 text-white">
                  {(() => {
                    const values = [
                      team.s1,
                      team.s2,
                      team.s3,
                      team.s4,
                      team.s5,
                    ];
                    const maxValue = Math.max(...values);
                    const minValue = Math.min(...values);
                    const intensity =
                      maxValue === minValue
                        ? 0
                        : (team.s4 - minValue) / (maxValue - minValue);
                    const bgOpacity = 0.05 + intensity * 0.7;
                    return (
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                        }}
                      >
                        {team.s4.toLocaleString()}
                      </span>
                    );
                  })()}
                </td>
                <td className="text-center py-3 px-2 text-white">
                  {(() => {
                    const values = [
                      team.s1,
                      team.s2,
                      team.s3,
                      team.s4,
                      team.s5,
                    ];
                    const maxValue = Math.max(...values);
                    const minValue = Math.min(...values);
                    const intensity =
                      maxValue === minValue
                        ? 0
                        : (team.s5 - minValue) / (maxValue - minValue);
                    const bgOpacity = 0.05 + intensity * 0.7;
                    return (
                      <span
                        className="px-2 py-1 rounded"
                        style={{
                          backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                        }}
                      >
                        {team.s5.toLocaleString()}
                      </span>
                    );
                  })()}
                </td>
                <td
                  className={`text-center py-3 px-4 font-bold ${
                    team.team === teamName ? 'text-green-400' : 'text-gray-400'
                  }`}
                >
                  {team.postFund.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CumulativeInvestmentDisplay: React.FC<
  CumulativeInvestmentDisplayProps
> = ({ teamName, currentRound, refetchTrigger }) => {
  const [cumulativeData, setCumulativeData] =
    useState<CumulativeInvestmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cumulative investment data
  const fetchCumulativeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/teams/cumulative/${teamName}?currentRound=${currentRound}`,
      );
      const result = await response.json();

      if (result.success) {
        setCumulativeData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch cumulative data');
      }
    } catch (err) {
      setError('Failed to load cumulative investment data');
      console.error('Error fetching cumulative data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [teamName, currentRound]);

  // Initial fetch and refetch when refetchTrigger changes
  useEffect(() => {
    fetchCumulativeData();
  }, [fetchCumulativeData, refetchTrigger]);

  if (isLoading) {
    return (
      <div
        className="p-6 rounded-lg border border-gray-700"
        style={{
          backgroundColor: '#0a0a0a',
        }}
      >
        <h2
          className="text-xl font-bold mb-6 text-center"
          style={{
            background:
              'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
          }}
        >
          나의 누적 투자금
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500" />
        </div>
      </div>
    );
  }

  if (error || !cumulativeData) {
    return (
      <div
        className="p-6 rounded-lg border border-gray-700"
        style={{
          backgroundColor: '#0a0a0a',
        }}
      >
        <h2
          className="text-xl font-bold mb-6 text-center"
          style={{
            background:
              'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
          }}
        >
          나의 누적 투자금
        </h2>
        <div className="text-center text-red-400 py-4">
          {error || 'Failed to load cumulative investment data'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 rounded-lg border border-gray-700"
      style={{
        backgroundColor: '#0a0a0a',
      }}
    >
      <h2
        className="text-xl font-bold mb-6 text-center"
        style={{
          background:
            'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block',
        }}
      >
        나의 누적 투자금
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-300">
                team
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-300">
                베럴아이
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-300">
                일리아스
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-300">
                북엔드
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-300">
                라스커
              </th>
              <th className="text-center py-3 px-2 font-medium text-gray-300">
                뉴톤
              </th>
              <th className="text-center py-3 px-4 font-medium text-green-400">
                Total Fund
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800 bg-gray-800/30">
              <td className="py-3 px-4 font-medium text-white">
                {cumulativeData.team}
              </td>
              <td className="text-center py-3 px-2 text-white">
                {(() => {
                  const values = [
                    cumulativeData.s1,
                    cumulativeData.s2,
                    cumulativeData.s3,
                    cumulativeData.s4,
                    cumulativeData.s5,
                  ];
                  const maxValue = Math.max(...values);
                  const minValue = Math.min(...values);
                  const intensity =
                    maxValue === minValue
                      ? 0
                      : (cumulativeData.s1 - minValue) / (maxValue - minValue);
                  const bgOpacity = 0.05 + intensity * 0.7;
                  return (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                      }}
                    >
                      {cumulativeData.s1.toLocaleString()}
                    </span>
                  );
                })()}
              </td>
              <td className="text-center py-3 px-2 text-white">
                {(() => {
                  const values = [
                    cumulativeData.s1,
                    cumulativeData.s2,
                    cumulativeData.s3,
                    cumulativeData.s4,
                    cumulativeData.s5,
                  ];
                  const maxValue = Math.max(...values);
                  const minValue = Math.min(...values);
                  const intensity =
                    maxValue === minValue
                      ? 0
                      : (cumulativeData.s2 - minValue) / (maxValue - minValue);
                  const bgOpacity = 0.05 + intensity * 0.7;
                  return (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                      }}
                    >
                      {cumulativeData.s2.toLocaleString()}
                    </span>
                  );
                })()}
              </td>
              <td className="text-center py-3 px-2 text-white">
                {(() => {
                  const values = [
                    cumulativeData.s1,
                    cumulativeData.s2,
                    cumulativeData.s3,
                    cumulativeData.s4,
                    cumulativeData.s5,
                  ];
                  const maxValue = Math.max(...values);
                  const minValue = Math.min(...values);
                  const intensity =
                    maxValue === minValue
                      ? 0
                      : (cumulativeData.s3 - minValue) / (maxValue - minValue);
                  const bgOpacity = 0.05 + intensity * 0.7;
                  return (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                      }}
                    >
                      {cumulativeData.s3.toLocaleString()}
                    </span>
                  );
                })()}
              </td>
              <td className="text-center py-3 px-2 text-white">
                {(() => {
                  const values = [
                    cumulativeData.s1,
                    cumulativeData.s2,
                    cumulativeData.s3,
                    cumulativeData.s4,
                    cumulativeData.s5,
                  ];
                  const maxValue = Math.max(...values);
                  const minValue = Math.min(...values);
                  const intensity =
                    maxValue === minValue
                      ? 0
                      : (cumulativeData.s4 - minValue) / (maxValue - minValue);
                  const bgOpacity = 0.05 + intensity * 0.7;
                  return (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                      }}
                    >
                      {cumulativeData.s4.toLocaleString()}
                    </span>
                  );
                })()}
              </td>
              <td className="text-center py-3 px-2 text-white">
                {(() => {
                  const values = [
                    cumulativeData.s1,
                    cumulativeData.s2,
                    cumulativeData.s3,
                    cumulativeData.s4,
                    cumulativeData.s5,
                  ];
                  const maxValue = Math.max(...values);
                  const minValue = Math.min(...values);
                  const intensity =
                    maxValue === minValue
                      ? 0
                      : (cumulativeData.s5 - minValue) / (maxValue - minValue);
                  const bgOpacity = 0.05 + intensity * 0.7;
                  return (
                    <span
                      className="px-2 py-1 rounded"
                      style={{
                        backgroundColor: `rgba(75, 222, 128, ${bgOpacity})`,
                      }}
                    >
                      {cumulativeData.s5.toLocaleString()}
                    </span>
                  );
                })()}
              </td>
              <td className="text-center py-3 px-4 font-bold text-green-400">
                {cumulativeData.preFund.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface TeamInvestmentData {
  team: string;
  teamNumber: number;
  investment: number;
  proportion: number;
}

interface PieChartProps {
  startup: string;
  currentRound: Round;
  preCap: number | null;
}

const PieChart: React.FC<PieChartProps> = ({
  startup,
  currentRound,
  preCap,
}) => {
  const [teamData, setTeamData] = useState<TeamInvestmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredTeam, setHoveredTeam] = useState<TeamInvestmentData | null>(
    null,
  );

  // Fetch team investment data for this startup
  const fetchTeamInvestmentData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/teams/${currentRound}/investment-data?startup=${startup}`,
      );
      const result = await response.json();

      if (result.success) {
        // Calculate proportions based on si/pre_cap ratio
        const totalInvestment = result.data.reduce(
          (sum: number, team: any) => sum + team.investment,
          0,
        );
        const teamDataWithProportions = result.data.map((team: any) => ({
          team: team.team,
          teamNumber: team.teamNumber,
          investment: team.investment,
          proportion:
            totalInvestment > 0 ? team.investment / totalInvestment : 0,
        }));

        setTeamData(teamDataWithProportions);
      }
    } catch (error) {
      console.error('Error fetching team investment data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startup, currentRound]);

  useEffect(() => {
    fetchTeamInvestmentData();
  }, [fetchTeamInvestmentData]);

  if (isLoading) {
    return (
      <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center text-xs text-gray-400">
        Loading...
      </div>
    );
  }

  if (teamData.length === 0) {
    return (
      <div className="w-20 h-20 rounded-full border-2 border-gray-600 flex items-center justify-center text-xs text-gray-400">
        No Data
      </div>
    );
  }

  // Generate pie chart SVG
  const radius = 36; // 72px diameter / 2
  const centerX = 40;
  const centerY = 40;
  let currentAngle = -Math.PI / 2; // Start from top

  const colors = [
    '#10B981',
    '#059669',
    '#047857',
    '#065F46',
    '#064E3B', // Green shades
    '#3B82F6',
    '#2563EB',
    '#1D4ED8',
    '#1E40AF',
    '#1E3A8A', // Blue shades
    '#8B5CF6',
    '#7C3AED',
    '#6D28D9',
    '#5B21B6',
    '#4C1D95', // Purple shades
  ];

  const pieSlices = teamData.map((team, index) => {
    const angle = team.proportion * 2 * Math.PI;
    const endAngle = currentAngle + angle;

    const x1 = centerX + radius * Math.cos(currentAngle);
    const y1 = centerY + radius * Math.sin(currentAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const slice = {
      pathData,
      color: colors[index % colors.length],
      team,
      angle: currentAngle,
      endAngle,
    };

    currentAngle = endAngle;
    return slice;
  });

  return (
    <div className="relative">
      <svg width="80" height="80" className="mx-auto">
        {pieSlices.map((slice, index) => (
          <g key={`${slice.team.team}-${index}`}>
            <path
              d={slice.pathData}
              fill={slice.color}
              stroke="#1F2937"
              strokeWidth="1"
              onMouseEnter={() => setHoveredTeam(slice.team)}
              onMouseLeave={() => setHoveredTeam(null)}
              className="cursor-pointer transition-opacity hover:opacity-80"
            />
          </g>
        ))}
      </svg>

      {/* Hover tooltip */}
      {hoveredTeam && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-800 text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
          Team {hoveredTeam.teamNumber}: $
          {hoveredTeam.investment.toLocaleString()}
        </div>
      )}
    </div>
  );
};

const OpenRound: React.FC<OpenRoundProps> = ({
  round,
  isRoundClosed = false,
  teamName,
  onPortfolioSubmitted,
}) => {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [startupData, setStartupData] = useState<StartupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate remaining funds and round return
  const remain =
    teamData && teamData.pre_fund !== null
      ? teamData.pre_fund -
        (teamData.s1 + teamData.s2 + teamData.s3 + teamData.s4 + teamData.s5)
      : 0;
  const roundReturn =
    teamData?.pre_fund && teamData?.post_fund
      ? ((teamData.post_fund - teamData.pre_fund) / teamData.pre_fund) * 100
      : 0;

  // Fetch team and startup data (no caching)
  const fetchTeamAndStartupData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TEAM DATA
      const teamResponse = await fetch(`/api/teams/${round}/${teamName}`);
      const apiResult: { success: boolean; data?: TeamData; error?: string } =
        await teamResponse.json();
      setTeamData(apiResult.data ?? null);

      // STARTUP DATA (only for closed rounds)
      if (isRoundClosed) {
        const startupResponse = await fetch(`/api/startup/${round}`);
        const startupResult: {
          success: boolean;
          data?: StartupData[];
          error?: string;
        } = await startupResponse.json();
        if (startupResult.success && startupResult.data) {
          // Sort startup data by startup name (s1, s2, s3, s4, s5)
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
      } else {
        setStartupData([]); // clear if not closed
      }
    } catch (err) {
      setError('Failed to load team data');
      console.error('Error fetching team/startup data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [round, teamName, isRoundClosed]);

  // Initial fetch
  useEffect(() => {
    fetchTeamAndStartupData();
  }, [fetchTeamAndStartupData]);

  // Remove cache invalidation and storage event logic

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    startup: 's1' | 's2' | 's3' | 's4' | 's5',
  ) => {
    if (!teamData) return;

    // Only allow integers
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = Math.max(0, Number(value) || 0);

    setTeamData({
      ...teamData,
      [startup]: numValue,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
    }
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
    const total =
      teamData.s1 + teamData.s2 + teamData.s3 + teamData.s4 + teamData.s5;
    if (total > teamData.pre_fund) {
      setError(
        `Total investment (${total.toLocaleString()}) exceeds available funds (${teamData.pre_fund.toLocaleString()})`,
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/teams/${round}/${teamData.team}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s1: teamData.s1,
          s2: teamData.s2,
          s3: teamData.s3,
          s4: teamData.s4,
          s5: teamData.s5,
          submitted: true, // Explicitly set submitted to true
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state to reflect the submission
        setTeamData((prev) => (prev ? { ...prev, submitted: true } : null));

        // Trigger refetch of cumulative investment data
        onPortfolioSubmitted?.();
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
      // <div className="flex items-center justify-center min-h-[60vh]">
      //   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      // </div>
      <div />
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
        <div
          className="p-6 rounded-lg border border-gray-700"
          style={{ backgroundColor: '#0a0a0a' }}
        >
          <h2
            className="text-xl font-bold mb-4 text-center"
            style={{
              background:
                'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
            }}
          >
            Round Performance
          </h2>

          {/* 3x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Box 1 - 베럴아이 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-2">
                  베럴아이
                </div>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <PieChart
                    startup="s1"
                    currentRound={round}
                    preCap={
                      startupData.find((s) => s.startup === 's1')?.pre_cap ||
                      null
                    }
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="text-sm text-gray-400">
                    $
                    {startupData
                      .find((s) => s.startup === 's1')
                      ?.pre_cap?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">→</div>
                  <div
                    className={`text-sm font-medium ${
                      startupData.find((s) => s.startup === 's1')?.yield &&
                      Number.parseFloat(
                        startupData.find((s) => s.startup === 's1')?.yield ||
                          '0',
                      ) >= 0
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {startupData.find((s) => s.startup === 's1')?.yield
                      ? `${Number.parseFloat(startupData.find((s) => s.startup === 's1')?.yield || '0') >= 0 ? '+' : ''}${(Number.parseFloat(startupData.find((s) => s.startup === 's1')?.yield || '0') * 100).toFixed(2)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2 - Fund Summary */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-2">
                  Total fund
                </div>
                <div className="text-lg font-medium text-gray-400 mb-1">
                  ${teamData.pre_fund?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-gray-400 mb-1">↓</div>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  ${teamData.post_fund?.toLocaleString() || 'N/A'}
                </div>
                <div
                  className={`text-sm font-medium ${roundReturn >= 0 ? 'text-red-400' : 'text-blue-400'}`}
                >
                  ({roundReturn >= 0 ? '+' : ''}
                  {roundReturn.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Box 3 - 일리아스 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-2">
                  일리아스
                </div>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <PieChart
                    startup="s2"
                    currentRound={round}
                    preCap={
                      startupData.find((s) => s.startup === 's2')?.pre_cap ||
                      null
                    }
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="text-sm text-gray-400">
                    $
                    {startupData
                      .find((s) => s.startup === 's2')
                      ?.pre_cap?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">→</div>
                  <div
                    className={`text-sm font-medium ${
                      startupData.find((s) => s.startup === 's2')?.yield &&
                      Number.parseFloat(
                        startupData.find((s) => s.startup === 's2')?.yield ||
                          '0',
                      ) >= 0
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {startupData.find((s) => s.startup === 's2')?.yield
                      ? `${Number.parseFloat(startupData.find((s) => s.startup === 's2')?.yield || '0') >= 0 ? '+' : ''}${(Number.parseFloat(startupData.find((s) => s.startup === 's2')?.yield || '0') * 100).toFixed(2)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 4 - 북엔드 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-2">
                  북엔드
                </div>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <PieChart
                    startup="s3"
                    currentRound={round}
                    preCap={
                      startupData.find((s) => s.startup === 's3')?.pre_cap ||
                      null
                    }
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="text-sm text-gray-400">
                    $
                    {startupData
                      .find((s) => s.startup === 's3')
                      ?.pre_cap?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">→</div>
                  <div
                    className={`text-sm font-medium ${
                      startupData.find((s) => s.startup === 's3')?.yield &&
                      Number.parseFloat(
                        startupData.find((s) => s.startup === 's3')?.yield ||
                          '0',
                      ) >= 0
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {startupData.find((s) => s.startup === 's3')?.yield
                      ? `${Number.parseFloat(startupData.find((s) => s.startup === 's3')?.yield || '0') >= 0 ? '+' : ''}${(Number.parseFloat(startupData.find((s) => s.startup === 's3')?.yield || '0') * 100).toFixed(2)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 5 - 라스커 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-2">
                  라스커
                </div>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <PieChart
                    startup="s4"
                    currentRound={round}
                    preCap={
                      startupData.find((s) => s.startup === 's4')?.pre_cap ||
                      null
                    }
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="text-sm text-gray-400">
                    $
                    {startupData
                      .find((s) => s.startup === 's4')
                      ?.pre_cap?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">→</div>
                  <div
                    className={`text-sm font-medium ${
                      startupData.find((s) => s.startup === 's4')?.yield &&
                      Number.parseFloat(
                        startupData.find((s) => s.startup === 's4')?.yield ||
                          '0',
                      ) >= 0
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {startupData.find((s) => s.startup === 's4')?.yield
                      ? `${Number.parseFloat(startupData.find((s) => s.startup === 's4')?.yield || '0') >= 0 ? '+' : ''}${(Number.parseFloat(startupData.find((s) => s.startup === 's4')?.yield || '0') * 100).toFixed(2)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 6 - 뉴톤 */}
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: '#111111' }}
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-white mb-2">
                  뉴톤
                </div>
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <PieChart
                    startup="s5"
                    currentRound={round}
                    preCap={
                      startupData.find((s) => s.startup === 's5')?.pre_cap ||
                      null
                    }
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className="text-sm text-gray-400">
                    $
                    {startupData
                      .find((s) => s.startup === 's5')
                      ?.pre_cap?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">→</div>
                  <div
                    className={`text-sm font-medium ${
                      startupData.find((s) => s.startup === 's5')?.yield &&
                      Number.parseFloat(
                        startupData.find((s) => s.startup === 's5')?.yield ||
                          '0',
                      ) >= 0
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {startupData.find((s) => s.startup === 's5')?.yield
                      ? `${Number.parseFloat(startupData.find((s) => s.startup === 's5')?.yield || '0') >= 0 ? '+' : ''}${(Number.parseFloat(startupData.find((s) => s.startup === 's5')?.yield || '0') * 100).toFixed(2)}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="p-6 rounded-lg border border-gray-700"
          style={{ backgroundColor: '#0a0a0a' }}
        >
          <h2
            className="text-xl font-bold mb-4 text-center"
            style={{
              background:
                'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
            }}
          >
            게임 규칙
          </h2>
          <div className="text-gray-300 space-y-3 text-sm leading-relaxed">
            <p>
              &nbsp;&nbsp;&nbsp;&nbsp; &ldquo;포트폴리오 제출&rdquo; 버튼을
              클릭하면, &ldquo;나의 누적 투자금&rdquo;에 이번 라운드 투자금이
              누적됩니다.
            </p>

            <div
              className="mt-4 p-4 rounded-lg"
              style={{ backgroundColor: '#111' }}
            >
              {' '}
              <h3 className="font-semibold text-gray mb-2 text-lg">
                각 라운드 종료 후
              </h3>
              <p>
                모든 팀들의 포트폴리오가 제출 완료되면 라운드가 종료됩니다.
                라운드 종료 후 Total fund의 수익률이 결정되고, 각 스타트업에
                모인 투자금과 각 팀의 Total fund 및 누적 투자금 정보들이 모두
                공개됩니다.
              </p>
            </div>

            <div
              className="mt-4 p-4 rounded-lg"
              style={{ backgroundColor: '#111' }}
            >
              <h3 className="font-semibold text-gray mb-2 text-lg">
                모든 라운드 종료 후
              </h3>
              <p>
                최종 Total fund가 많은 팀 순으로 스타트업과 매칭되며, 이때 본인
                팀은 자리가 남은 스타트업 중 팀의 &ldquo;누적 투자금&rdquo;이
                가장 큰 곳과 매칭됩니다. (한 스타트업 당 3팀이 배정됩니다.)
              </p>
            </div>

            <div
              className="mt-4 p-4 rounded-lg"
              style={{ backgroundColor: '#111' }}
            >
              <h3 className="font-semibold text-gray mb-2 text-lg">
                Total fund 운용 전략
              </h3>
              <p>
                각 스타트업은 15개의 팀으로 부터 모인 자본(라운드 별)을 바탕으로
                수익률이 결정됩니다. 규모가 작을수록 high risk, high
                return입니다(기대 수익률 자체는 높지만 표준 편차가 큼). 순위를
                높이기 위한 도박이 필요할 때 비인기 스타트업에 투자해보세요!
              </p>

              <h3 className="font-bold text-green-500 mb-2 mt-4">
                수익률 공식
              </h3>
              <div className="text-gray-300 text-sm">
                <div className="mb-2 flex gap-2 items-center">
                  주요 파라미터:
                  <div className="group relative">
                    <button type="button" className="cursor-help">
                      C<sub>total</sub>
                    </button>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap">
                      5개 스타트업의 전체 투자금 합계 (Total_cap)
                    </div>
                  </div>
                  ,
                  <div className="group relative">
                    <button type="button" className="cursor-help">
                      C<sub>s</sub>
                    </button>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap">
                      특정 스타트업의 투자금 (S_cap)
                    </div>
                  </div>
                  ,
                  <div className="group relative">
                    <button type="button" className="cursor-help">
                      μ<sub>avg</sub>
                    </button>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap">
                      5개 스타트업 전체의 목표 평균 수익률(5%)
                    </div>
                  </div>
                  ,
                  <div className="group relative">
                    <button type="button" className="cursor-help">
                      σ<sub>avg</sub>
                    </button>
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap">
                      5개 스타트업 전체의 목표 평균 표준편차(10%)
                    </div>
                  </div>
                  (마우스를 올려 자세한 설명 확인)
                </div>
                <div className="font-mono">
                  <div>
                    μ<sub>s</sub> = 5/4 × μ<sub>avg</sub> × (1 - C<sub>s</sub>/C
                    <sub>total</sub>)
                  </div>
                  <div className="mb-2">
                    σ<sub>s</sub> = 5/4 × σ<sub>avg</sub> × (1 - C<sub>s</sub>/C
                    <sub>total</sub>)
                  </div>
                  <div className="text-sm text-gray-400">
                    각 스타트업의 수익률은 위와 같이 계산된 평균과 표준편차의
                    정규분포로부터 추출되며 최대 50% 최소 -30%의 범위에
                    존재합니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Panel - Portfolio Submission */}
      <div
        className="p-6 rounded-lg border border-gray-700"
        style={{
          backgroundColor: '#0a0a0a',
        }}
      >
        <h2
          className="text-xl font-bold mb-6"
          style={{
            background:
              'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'inline-block',
          }}
        >
          포트폴리오 제출
        </h2>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Fund Summary Card */}
          <div
            className="rounded-lg p-4 mb-6"
            style={{
              backgroundColor: '#111111',
            }}
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="text-sm text-gray-400">Total Fund</div>
                <div
                  className={`text-lg font-bold ${isRoundClosed ? 'text-gray-400' : 'text-green-400'}`}
                >
                  ${teamData.pre_fund?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Remaining</div>
                <div
                  className={`text-lg font-bold ${remain < 0 ? 'text-red-400' : 'text-white-400'}`}
                >
                  ${remain.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Startup Investment Cards */}
          <div className="space-y-3 mb-6">
            {(['s1', 's2', 's3', 's4', 's5'] as const).map((startup) => (
              <div
                key={startup}
                className="rounded-lg p-4"
                style={{
                  backgroundColor: '#111111',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #D0D7B1, #4BDE80)',
                        boxShadow: '0 0 10px rgba(75, 222, 128, 0.3)',
                      }}
                    >
                      <span className="text-black font-bold text-sm">
                        {startup.toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-white">
                      {startup === 's1' && '베럴아이'}
                      {startup === 's2' && '일리아스'}
                      {startup === 's3' && '북엔드'}
                      {startup === 's4' && '라스커'}
                      {startup === 's5' && '뉴톤'}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      $
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max={teamData.pre_fund || undefined}
                      value={teamData[startup]}
                      onChange={(e) => handleInputChange(e, startup)}
                      onKeyDown={handleKeyDown}
                      disabled={teamData.submitted}
                      className="w-32 border border-gray-600 rounded-md pl-8 pr-4 py-2 text-white text-right disabled:opacity-50 disabled:cursor-not-allowed focus:border-green-500 focus:outline-none"
                      style={{
                        backgroundColor: '#1a1a1a',
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isRoundClosed || teamData.submitted || isSubmitting || remain < 0
            }
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
              isRoundClosed || teamData.submitted || remain < 0
                ? 'cursor-not-allowed'
                : 'active:scale-95'
            }`}
            style={{
              background:
                isRoundClosed || teamData.submitted || remain < 0
                  ? '#374151'
                  : 'linear-gradient(to right,rgb(50, 234, 112),rgb(34, 107, 59))',
              border: 'none',
              outline: 'none',
              color: 'white',
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                <span>제출 중...</span>
              </div>
            ) : teamData.submitted ? (
              '제출 완료'
            ) : remain < 0 ? (
              '잔액 부족'
            ) : (
              '포트폴리오 제출'
            )}
          </button>
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
  const [isTabLoading, setIsTabLoading] = useState(false); // Add tab loading state
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
  const roundStatusRef = useRef(roundStatus);

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

  // Function to trigger refetch of team data
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => {
    console.log('Triggering refetch of team data');
    setRefetchTrigger((prev) => prev + 1);
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

  useEffect(() => {
    fetchRoundStatus();
  }, [fetchRoundStatus]);

  // SSE connection for team
  useEffect(() => {
    const teamSSE = new EventSource(
      `/api/teams/events?team=${teamName}&round=all`,
    );

    teamSSE.onopen = () => {
      console.log(`✅ ${teamName} SSE Connected!`);
    };

    teamSSE.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(`📨 ${teamName} received:`, data);

      // Handle round status updates
      if (data.type === 'round_status_updated') {
        console.log(`🔄 Round status updated: ${data.round} -> ${data.status}`);

        // Update the round status in state
        setRoundStatus((prev) => ({
          ...prev,
          [data.round]: { status: data.status },
        }));

        // Force a re-render to update the UI
        triggerRerender();
      }

      // Handle submission toggle updates
      if (data.type === 'submission_toggled') {
        console.log(
          `🔄 Submission status toggled: ${data.team} -> ${data.submitted ? 'submitted' : 'not submitted'}`,
        );

        // Force a re-render to update the UI
        triggerRerender();

        // Also refetch team data to get the updated submitted status
        // This will update the OpenRound component's teamData state
        if (data.team === teamName) {
          console.log(
            `🔄 Refetching team data for ${teamName} after submission toggle`,
          );
          triggerRefetch();
        }
      }

      // Handle team data reset
      if (data.type === 'team_data_reset') {
        console.log(
          `🔄 Team data reset received for ${data.team} in round ${data.round}`,
        );

        // Force a complete re-render of the entire dashboard
        triggerRerender();

        // Also refetch all data to get the fresh state
        if (data.team === teamName) {
          console.log(`🔄 Refetching all data for ${teamName} after reset`);
          triggerRefetch();
        }
      }
    };

    teamSSE.onerror = (error) => {
      console.error(`❌ ${teamName} SSE Error:`, error);
    };

    // Cleanup function to close SSE connection when component unmounts
    return () => {
      teamSSE.close();
      console.log(`🔌 ${teamName} SSE connection closed`);
    };
  }, [teamName, triggerRerender]);

  // Handle round change with loading state and persistence
  const handleRoundChange = useCallback((round: Round) => {
    setIsTabLoading(true);
    setActiveRound(round);
    setTimeout(() => setIsTabLoading(false), 100);
  }, []);

  if (isLoading) {
    return <div />;
  }

  const currentRoundStatus = roundStatus[activeRound].status;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-3xl font-bold"
            style={{
              background:
                'linear-gradient(90deg, #D0D7B1 0%, rgb(18, 245, 101) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
            }}
          >
            Team Dashboard
          </h1>

          <RoundTabs
            activeRound={activeRound}
            onRoundChange={handleRoundChange}
            roundStatus={roundStatus}
          />
        </div>

        <div className="space-y-6">
          {currentRoundStatus === 'locked' ? (
            <LockedRound />
          ) : (
            <>
              {/* Loading Overlay for Tab Switches */}
              {isTabLoading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
                </div>
              )}

              {/* Fixed Layout Container */}
              <div className="grid grid-cols-1 gap-6">
                {/* Main Content Area - Always present */}
                <div className="order-1">
                  <OpenRound
                    key={`${activeRound}-${teamName}`} // Remove refetchTrigger from key
                    round={activeRound}
                    isRoundClosed={currentRoundStatus === 'closed'}
                    teamName={teamName}
                    onPortfolioSubmitted={() =>
                      setRefetchTrigger((prev) => prev + 1)
                    }
                  />
                </div>

                {/* Team's Own Cumulative Investment Component - Fixed position */}
                <div className="order-2">
                  {currentRoundStatus === 'open' && (
                    <CumulativeInvestmentDisplay
                      key={`cumulative-${activeRound}-${teamName}`} // Add stable key
                      teamName={teamName}
                      currentRound={activeRound}
                      refetchTrigger={refetchTrigger}
                    />
                  )}
                </div>

                {/* Cumulative Investment Ranking Component - Fixed position */}
                <div className="order-3">
                  {currentRoundStatus === 'closed' && (
                    <CumulativeRankingDisplay
                      key={`ranking-${activeRound}`} // Add stable key
                      currentRound={activeRound}
                      teamName={teamName}
                    />
                  )}
                </div>
              </div>
            </>
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
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
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
