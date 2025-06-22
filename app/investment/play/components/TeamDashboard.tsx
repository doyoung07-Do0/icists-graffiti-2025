'use client';

import { useEffect, useState } from 'react';
import { formatCurrency, extractTeamNumber } from './utils';
import { ROUNDS, STARTUPS } from './types';

interface TeamDashboardProps {
  userEmail: string | null | undefined;
}

export default function TeamDashboard({ userEmail }: TeamDashboardProps) {
  const [currentRound, setCurrentRound] = useState<string>('Pre-seed');
  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<Record<string, number>>({});
  const [teamCapital, setTeamCapital] = useState<number>(100000000); // Default ₩100M

  // Extract team information from email
  const teamNumber = extractTeamNumber(userEmail);
  const teamName = teamNumber ? `team${teamNumber}` : null;

  // Load team data from backend
  const loadTeamData = async (round: string) => {
    if (!teamName) return;
    
    try {
      setLoading(true);
      console.log(`[TeamDashboard] Loading data for ${teamName}, round: ${round}`);
      
      const response = await fetch(`/api/investment?round=${encodeURIComponent(round)}&team=${teamName}`);
      console.log(`[TeamDashboard] API Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[TeamDashboard] Received data:', data);
        
        // Extract team-specific data from the response
        const teamCapitalValue = data.capitals?.[teamName] || 100000000;
        setTeamCapital(typeof teamCapitalValue === 'string' ? parseFloat(teamCapitalValue) : teamCapitalValue);
        
        // Extract portfolio data for this team
        const teamPortfolio: Record<string, number> = {};
        if (data.portfolios) {
          STARTUPS.forEach(startup => {
            const startupData = data.portfolios[startup];
            if (startupData && startupData[teamName] !== undefined) {
              const value = startupData[teamName];
              teamPortfolio[startup] = typeof value === 'string' ? parseFloat(value) : value;
            } else {
              teamPortfolio[startup] = 0;
            }
          });
        }
        
        setPortfolioData(teamPortfolio);
        console.log('[TeamDashboard] Processed portfolio data:', teamPortfolio);
      } else {
        console.error(`[TeamDashboard] Failed to fetch data for ${teamName}, round ${round}:`, response.status);
      }
    } catch (error) {
      console.error('[TeamDashboard] Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (teamName) {
      console.log(`[TeamDashboard] Loading data for ${teamName}, round: ${currentRound}`);
      loadTeamData(currentRound);
    }
  }, [teamName, currentRound]);

  // Auto-refresh data every 5 seconds for real-time updates
  useEffect(() => {
    if (!teamName) return;
    
    console.log(`[TeamDashboard] Setting up auto-refresh for ${teamName}, round: ${currentRound}`);
    
    const interval = setInterval(() => {
      console.log(`[TeamDashboard] Auto-refresh triggered for ${teamName}, round: ${currentRound}`);
      loadTeamData(currentRound);
    }, 5000);

    // Cleanup function
    return () => {
      console.log(`[TeamDashboard] Cleaning up auto-refresh interval for ${teamName}`);
      clearInterval(interval);
    };
  }, [teamName, currentRound]);

  // Handle portfolio investment change with database sync
  const handlePortfolioChange = async (startup: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value) || 0;
    
    // Update local state immediately for responsive UI
    setPortfolioData(prev => ({
      ...prev,
      [startup]: numericValue
    }));

    // Sync to database
    try {
      console.log(`[TeamDashboard] Syncing portfolio data: ${startup} = ${numericValue}`);
      
      const response = await fetch('/api/investment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundName: currentRound,
          teamName: teamName,
          startup: startup,
          type: 'portfolio',
          data: {
            investment: numericValue
          }
        }),
      });

      if (response.ok) {
        console.log(`[TeamDashboard] Successfully synced ${startup} investment: ${numericValue}`);
      } else {
        console.error(`[TeamDashboard] Failed to sync ${startup} investment:`, response.status);
      }
    } catch (error) {
      console.error('[TeamDashboard] Error syncing portfolio data:', error);
    }
  };

  // Calculate team's total investment in current round
  const totalInvested = Object.values(portfolioData).reduce((sum, amount) => {
    const numAmount = typeof amount === 'string' ? parseInt(amount) : amount;
    return sum + (isNaN(numAmount) ? 0 : numAmount);
  }, 0);

  // Calculate remaining capital
  const remainingCapital = teamCapital - totalInvested;

  if (!teamNumber || teamName === 'teamundefined') {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-red-700 rounded-2xl p-8">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-3xl font-bold mb-4 text-red-400">팀 정보를 찾을 수 없습니다</h2>
          <p className="text-gray-300">올바른 팀 계정으로 로그인해주세요.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 relative">
      {/* Loading overlay indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-10">
          <div className="inline-flex items-center bg-gray-800/80 px-3 py-1 rounded-full text-blue-400 text-xs backdrop-blur-sm">
            <div className="animate-spin w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full mr-2"></div>
            로딩중
          </div>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Team {teamNumber} Dashboard
          </span>
        </h2>
        <p className="text-gray-300">팀 {teamNumber} 투자 게임 대시보드</p>
      </div>

      {/* Round Selection */}
      <div className="mb-6">
        <div className="flex justify-center space-x-2">
          {ROUNDS.map((round) => (
            <button
              key={round}
              onClick={() => setCurrentRound(round)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                currentRound === round
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {round}
            </button>
          ))}
        </div>
        <div className="text-center mt-3">
          <span className="text-lg font-medium text-blue-400">
            현재 라운드: {currentRound}
          </span>
        </div>
      </div>

      {/* Capital Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800/50 p-4 rounded-xl text-center">
          <h3 className="text-sm font-medium text-green-400 mb-1">총 자본금</h3>
          <p className="text-xl font-bold text-white">{formatCurrency(teamCapital)}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl text-center">
          <h3 className="text-sm font-medium text-blue-400 mb-1">총 투자액</h3>
          <p className="text-xl font-bold text-white">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl text-center">
          <h3 className="text-sm font-medium text-purple-400 mb-1">잔여 자본</h3>
          <p className={`text-xl font-bold ${remainingCapital >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(remainingCapital)}
          </p>
        </div>
      </div>

      {/* Main Content: Greeting + Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Greeting & Welcome Message */}
        <div className="bg-gray-800/50 p-8 rounded-xl flex flex-col justify-center">
          <div className="text-center lg:text-left">
            <h3 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                안녕하세요, Team {teamNumber}!
              </span>
            </h3>
            <p className="text-gray-300 text-lg mb-4">
              ICISTS 투자 게임에 오신 것을 환영합니다.
            </p>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center justify-center lg:justify-start">
                <span className="mr-2">🎯</span>
                현재 라운드: <span className="text-blue-400 ml-1 font-semibold">{currentRound}</span>
              </p>
              <p className="flex items-center justify-center lg:justify-start">
                <span className="mr-2">💰</span>
                자본금: <span className="text-green-400 ml-1 font-semibold">{formatCurrency(teamCapital)}</span>
              </p>
              <p className="flex items-center justify-center lg:justify-start">
                <span className="mr-2">📈</span>
                투자액: <span className="text-blue-400 ml-1 font-semibold">{formatCurrency(totalInvested)}</span>
              </p>
              <p className="flex items-center justify-center lg:justify-start">
                <span className="mr-2">🏦</span>
                잔여: <span className={`ml-1 font-semibold ${remainingCapital >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(remainingCapital)}
                </span>
              </p>
            </div>
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700/30">
              <p className="text-blue-300 text-sm">
                💡 <strong>팁:</strong> 오른쪽에서 각 스타트업에 대한 투자 금액을 수정할 수 있습니다. 
                변경사항은 실시간으로 저장됩니다!
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Portfolio Input */}
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-purple-400 text-center">
            포트폴리오 현황 ({currentRound})
          </h3>
          <div className="space-y-4">
            {STARTUPS.map((startup) => {
              const investment = portfolioData[startup] || 0;
              const numInvestment = typeof investment === 'string' ? parseInt(investment) : investment;
              const safeValue = isNaN(numInvestment) ? '' : numInvestment.toString();
              const percentage = teamCapital > 0 ? ((numInvestment / teamCapital) * 100).toFixed(1) : '0.0';

              return (
                <div key={startup} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium text-sm">
                      {startup.replace('startup', 'Startup ')}
                    </span>
                    <input
                      type="number"
                      value={safeValue}
                      onChange={(e) => handlePortfolioChange(startup, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyPress={(e) => {
                        if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                      className="w-24 h-7 bg-gray-700 text-white text-center text-sm rounded border-none focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-gray-400">투자 비율</span>
                    <span className="text-blue-400 font-medium">{percentage}%</span>
                  </div>
                  {/* Investment bar */}
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
