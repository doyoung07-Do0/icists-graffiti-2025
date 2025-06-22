'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from './utils';
import { ROUNDS, STARTUPS, TEAMS, PortfolioData, TeamTotalData } from './types';

export default function AdminDashboard() {
  const [currentRound, setCurrentRound] = useState<string>('Pre-seed');
  const [loading, setLoading] = useState(false);

  // Initialize portfolio data for all rounds
  const [portfolioData, setPortfolioData] = useState<Record<string, Record<string, Record<string, number>>>>(() => {
    const initialData: Record<string, Record<string, Record<string, number>>> = {};
    ROUNDS.forEach(round => {
      initialData[round] = {};
      STARTUPS.forEach(startup => {
        initialData[round][startup] = {};
        TEAMS.forEach(team => {
          initialData[round][startup][team] = 0;
        });
      });
    });
    return initialData;
  });

  // Initialize team total data for all rounds (총 자본금 row)
  const [teamTotalData, setTeamTotalData] = useState<Record<string, Record<string, number>>>(() => {
    const initialData: Record<string, Record<string, number>> = {};
    ROUNDS.forEach(round => {
      initialData[round] = {};
      TEAMS.forEach(team => {
        initialData[round][team] = 1000; // Default 1000
      });
    });
    return initialData;
  });

  // Initialize market cap data for all rounds (시가총액 row)
  const [marketCapData, setMarketCapData] = useState<Record<string, Record<string, number>>>(() => {
    const initialData: Record<string, Record<string, number>> = {};
    ROUNDS.forEach(round => {
      initialData[round] = {};
      TEAMS.forEach(team => {
        initialData[round][team] = 0; // Default ₩0
      });
    });
    return initialData;
  });

  // Load data from database
  const loadData = async (round: string) => {
    try {
      setLoading(true);
      console.log(`[AdminDashboard] Loading data for round: ${round}`);
      
      const response = await fetch(`/api/investment?round=${encodeURIComponent(round)}`);
      console.log(`[AdminDashboard] API Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AdminDashboard] Received data:', data);
        
        setPortfolioData(prev => ({ ...prev, [round]: data.portfolios || {} }));
        setTeamTotalData(prev => ({ ...prev, [round]: data.capitals || {} }));
        setMarketCapData(prev => ({ ...prev, [round]: data.marketCaps || {} }));
      } else {
        console.error(`[AdminDashboard] Failed to fetch data for round ${round}:`, response.status);
      }
    } catch (error) {
      console.error('[AdminDashboard] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and round change
  useEffect(() => {
    console.log(`[AdminDashboard] Initial load triggered for round: ${currentRound}`);
    loadData(currentRound);
  }, [currentRound]);

  // Auto-refresh data every 5 seconds for real-time updates from teams
  useEffect(() => {
    console.log(`[AdminDashboard] Setting up auto-refresh for round: ${currentRound}`);
    
    const interval = setInterval(() => {
      console.log(`[AdminDashboard] Auto-refresh triggered for round: ${currentRound}`);
      loadData(currentRound);
    }, 5000);

    // Cleanup function
    return () => {
      console.log(`[AdminDashboard] Cleaning up auto-refresh interval`);
      clearInterval(interval);
    };
  }, [currentRound]);

  // Calculate totals
  const calculateStartupTotal = (startup: string) => {
    const startupData = portfolioData[currentRound]?.[startup] || {};
    return Object.values(startupData).reduce((sum, value) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const calculateTeamTotal = (team: string) => {
    const teamData = portfolioData[currentRound] || {};
    return Object.values(teamData).reduce((sum, startupData) => {
      const value = startupData[team] || 0;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return STARTUPS.reduce((sum, startup) => sum + calculateStartupTotal(startup), 0);
  };

  // Handle cell value change with database sync
  const handleCellChange = async (startup: string, team: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value) || 0;
    
    // Update local state immediately for responsive UI
    setPortfolioData(prev => ({
      ...prev,
      [currentRound]: {
        ...prev[currentRound],
        [startup]: {
          ...prev[currentRound]?.[startup],
          [team]: numericValue
        }
      }
    }));

    // Sync to database
    try {
      const response = await fetch('/api/investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundName: currentRound,
          teamName: team,
          type: 'portfolio',
          data: {
            startup,
            amount: numericValue
          }
        }),
      });

      if (!response.ok) {
        console.error('Failed to update portfolio data:', response.status);
      }
    } catch (error) {
      console.error('Error updating portfolio data:', error);
    }
  };

  // Handle team total (총 자본금) change with database sync
  const handleTeamTotalChange = async (team: string, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value) || 0;
    
    // Update local state immediately for responsive UI
    setTeamTotalData(prev => ({
      ...prev,
      [currentRound]: {
        ...prev[currentRound],
        [team]: numericValue
      }
    }));

    // Sync to database
    try {
      const response = await fetch('/api/investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundName: currentRound,
          teamName: team,
          type: 'capital',
          data: {
            capital: numericValue
          }
        }),
      });

      if (!response.ok) {
        console.error('Failed to update team capital:', response.status);
      }
    } catch (error) {
      console.error('Error updating team capital:', error);
    }
  };

  // Handle market cap change with database sync
  const handleMarketCapChange = async (team: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value) || 0;
    
    // Update local state immediately for responsive UI
    setMarketCapData(prev => ({
      ...prev,
      [currentRound]: {
        ...prev[currentRound],
        [team]: numericValue
      }
    }));

    // Sync to database
    try {
      const response = await fetch('/api/investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundName: currentRound,
          teamName: team,
          type: 'marketCap',
          data: {
            marketCap: numericValue
          }
        }),
      });

      if (!response.ok) {
        console.error('Failed to update market cap:', response.status);
      }
    } catch (error) {
      console.error('Error updating market cap:', error);
    }
  };

  return (
    <div className="w-full max-w-[98vw] mx-auto px-4 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl py-6 relative">
      {/* Loading overlay indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-flex items-center bg-gray-800/80 px-3 py-1 rounded-full text-blue-400 text-xs backdrop-blur-sm">
            <div className="animate-spin w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full mr-2"></div>
            로딩중
          </div>
        </div>
      )}
      
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </span>
        </h2>
        <p className="text-gray-400 text-lg">투자 게임 관리자 대시보드</p>
        <div className="mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-sm border border-blue-700/30 text-sm font-medium text-blue-300">
            현재 라운드: <span className="text-blue-100 ml-1">{currentRound}</span>
          </span>
        </div>
      </div>

      {/* Round Selection */}
      <div className="mb-6">
        <div className="flex justify-center space-x-3">
          {ROUNDS.map((round) => (
            <button
              key={round}
              onClick={() => setCurrentRound(round)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 text-sm shadow-lg backdrop-blur-sm border ${
                currentRound === round
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-blue-500/25 transform scale-105'
                  : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 border-gray-600/50 hover:border-gray-500/50 hover:text-white hover:shadow-xl hover:transform hover:scale-102'
              }`}
            >
              {round}
            </button>
          ))}
        </div>
      </div>

      {/* Investment Table */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 overflow-x-auto">
          <table className="w-full border-collapse rounded-2xl overflow-hidden shadow-xl min-w-fit">
            <thead>
              <tr>
                <th className="bg-gradient-to-r from-slate-800 to-gray-800 text-blue-300 p-4 text-left sticky left-0 z-10 border-b border-gray-600/50 rounded-tl-2xl font-semibold">
                  Startup / Team
                </th>
                {TEAMS.map((team, index) => (
                  <th key={team} className={`bg-gradient-to-r from-slate-800 to-gray-800 text-emerald-300 p-3 border-b border-gray-600/50 min-w-[70px] max-w-[90px] font-semibold ${index === TEAMS.length - 1 ? 'rounded-tr-2xl' : ''}`}>
                    {team.replace('team', 'T')}
                  </th>
                ))}
                <th className="bg-gradient-to-r from-amber-800/80 to-orange-700/80 text-amber-200 p-3 border-b border-gray-600/50 min-w-[90px] rounded-tr-2xl font-semibold backdrop-blur-sm">
                  시가총액
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Portfolio Rows for each startup */}
              {STARTUPS.map((startup, rowIndex) => (
                <tr key={startup} className="hover:bg-gray-700/20 transition-all duration-200">
                  <td className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 text-blue-300 font-semibold p-3 sticky left-0 z-10 border-b border-gray-600/30 backdrop-blur-sm">
                    {startup.replace('startup', 's')}
                  </td>
                  {TEAMS.map((team) => (
                    <td key={team} className="bg-gray-800/50 p-1 border-b border-gray-600/30 backdrop-blur-sm">
                      <input
                        type="number"
                        value={portfolioData[currentRound]?.[startup]?.[team] || 0}
                        onChange={(e) => handleCellChange(startup, team, e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        onKeyPress={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                        className="w-full h-10 bg-gray-700/40 text-white text-center text-sm border-none rounded-xl focus:bg-gray-600/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none backdrop-blur-sm shadow-inner"
                        min="0"
                        step="1"
                      />
                    </td>
                  ))}
                  <td className="bg-gradient-to-r from-amber-700/40 to-orange-600/40 text-amber-200 font-semibold text-center p-3 border-b border-gray-600/30 backdrop-blur-sm">
                    {calculateStartupTotal(startup).toLocaleString()}
                  </td>
                </tr>
              ))}

              {/* Total Capital Row (총 자본금) - Special styling for last row */}
              <tr className="border-t-2 border-purple-400/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                <td className="bg-gradient-to-r from-purple-700/80 to-indigo-700/80 text-purple-200 font-bold p-3 sticky left-0 z-10 rounded-bl-2xl backdrop-blur-sm shadow-lg">
                  총 자본금
                </td>
                {TEAMS.map((team, index) => (
                  <td key={team} className="bg-purple-800/30 p-1 backdrop-blur-sm">
                    <input
                      type="number"
                      value={teamTotalData[currentRound]?.[team] || 0}
                      onChange={(e) => handleTeamTotalChange(team, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyPress={(e) => {
                        if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                      className="w-full h-10 bg-purple-700/40 text-white text-center text-sm border-none rounded-xl focus:bg-purple-600/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none backdrop-blur-sm shadow-inner"
                      min="0"
                      step="1"
                    />
                  </td>
                ))}
                <td className="bg-gradient-to-r from-amber-700/60 to-orange-600/60 text-amber-100 font-bold text-center p-3 rounded-br-2xl backdrop-blur-sm shadow-lg">
                  {Object.values(teamTotalData[currentRound] || {}).reduce((sum, val) => sum + val, 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-amber-900/40 to-orange-800/40 backdrop-blur-xl p-4 rounded-2xl text-center border border-amber-700/30 shadow-lg">
          <h3 className="text-xs font-semibold text-amber-200 mb-1 tracking-wide">총 투자액</h3>
          <p className="text-xl font-bold text-amber-100 tracking-tight">{calculateGrandTotal().toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/40 to-green-800/40 backdrop-blur-xl p-4 rounded-2xl text-center border border-emerald-700/30 shadow-lg">
          <h3 className="text-xs font-semibold text-emerald-200 mb-1 tracking-wide">활성 팀</h3>
          <p className="text-xl font-bold text-emerald-100 tracking-tight">{TEAMS.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-800/40 backdrop-blur-xl p-4 rounded-2xl text-center border border-blue-700/30 shadow-lg">
          <h3 className="text-xs font-semibold text-blue-200 mb-1 tracking-wide">스타트업</h3>
          <p className="text-xl font-bold text-blue-100 tracking-tight">{STARTUPS.length}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105 border border-red-500/30 backdrop-blur-sm">
          <span className="flex items-center gap-2">
            🚫 제출 차단
          </span>
        </button>
        <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105 border border-blue-500/30 backdrop-blur-sm">
          <span className="flex items-center gap-2">
            ✓ 유효성 검사
          </span>
        </button>
        <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105 border border-purple-500/30 backdrop-blur-sm">
          <span className="flex items-center gap-2">
            📊 수익률 뽑기
          </span>
        </button>
        <button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105 border border-orange-500/30 backdrop-blur-sm">
          <span className="flex items-center gap-2">
            🚀 결과 배포
          </span>
        </button>
      </div>
    </div>
  );
}
