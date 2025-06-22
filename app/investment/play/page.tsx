'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function InvestmentPlayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Same authentication logic as Navigation component
  const isRealUser = session?.user && 
                     session.user.email && 
                     !session.user.email.endsWith('@guest.com') &&
                     !session.user.email.startsWith('guest-');

  // Role detection logic
  const getUserRole = (email: string | null | undefined) => {
    if (!email) return 'unauthorized';
    
    if (email === 'admin@icists.com') {
      return 'admin';
    }
    
    // Check for team1@icists.com ~ team16@icists.com
    const teamPattern = /^team([1-9]|1[0-6])@icists\.com$/;
    if (teamPattern.test(email)) {
      return 'team';
    }
    
    return 'unauthorized';
  };

  const userRole = getUserRole(session?.user?.email);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'loading') return; // Still loading
    
    if (!isRealUser) {
      router.push('/login');
    }
  }, [status, isRealUser, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="w-[95vw] max-w-none mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 relative">
          {/* Loading overlay indicator */}
          <div className="absolute top-4 right-4 z-10">
            <div className="inline-flex items-center bg-gray-800/80 px-3 py-1 rounded-full text-blue-400 text-xs backdrop-blur-sm">
              <div className="animate-spin w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full mr-2"></div>
              로딩중
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isRealUser) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="w-[95vw] max-w-none mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 relative">
          {/* Loading overlay indicator */}
          <div className="absolute top-4 right-4 z-10">
            <div className="inline-flex items-center bg-gray-800/80 px-3 py-1 rounded-full text-blue-400 text-xs backdrop-blur-sm">
              <div className="animate-spin w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full mr-2"></div>
              Redirecting to login...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const AdminDashboard = () => {
    const [currentRound, setCurrentRound] = useState<string>('Pre-seed');
    const [loading, setLoading] = useState(false);
    const rounds = ['Pre-seed', 'Seed', 'Series A', 'Series B'];
    const startups = ['startup1', 'startup2', 'startup3', 'startup4'];
    const teams = Array.from({ length: 16 }, (_, i) => `team${i + 1}`);

    // Initialize portfolio data for all rounds
    const [portfolioData, setPortfolioData] = useState<Record<string, Record<string, Record<string, number>>>>(() => {
      const initialData: Record<string, Record<string, Record<string, number>>> = {};
      rounds.forEach(round => {
        initialData[round] = {};
        startups.forEach(startup => {
          initialData[round][startup] = {};
          teams.forEach(team => {
            initialData[round][startup][team] = 0;
          });
        });
      });
      return initialData;
    });

    // Initialize team total data for all rounds (총 자본금 row)
    const [teamTotalData, setTeamTotalData] = useState<Record<string, Record<string, number>>>(() => {
      const initialData: Record<string, Record<string, number>> = {};
      rounds.forEach(round => {
        initialData[round] = {};
        teams.forEach(team => {
          initialData[round][team] = 0;
        });
      });
      return initialData;
    });

    // Load data from database
    const loadData = async (round: string) => {
      try {
        setLoading(true);
        console.log(`[AdminDashboard] Loading data for round: ${round}`);
        
        // Initialize rounds if needed
        await fetch('/api/investment/init', { method: 'POST' });
        
        // Fetch current data
        const response = await fetch(`/api/investment?round=${encodeURIComponent(round)}`);
        console.log(`[AdminDashboard] API Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[AdminDashboard] Received data:`, data);
          
          // Update portfolio data
          if (data.portfolios) {
            setPortfolioData(prev => ({
              ...prev,
              [round]: data.portfolios
            }));
          }
          
          // Update team capital data
          if (data.capitals) {
            setTeamTotalData(prev => ({
              ...prev,
              [round]: data.capitals
            }));
          }
        } else {
          console.error(`[AdminDashboard] API request failed with status: ${response.status}`);
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

    // Number formatting utility
    const formatCurrency = (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '$0.00';
      
      // Round to 2 decimal places and format with commas
      const rounded = Math.round(num * 100) / 100;
      return `$${rounded.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    };

    // Calculate totals
    const calculateStartupTotal = (startup: string) => {
      const total = teams.reduce((sum, team) => {
        const value = portfolioData[currentRound]?.[startup]?.[team] || 0;
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);
      return total;
    };

    const calculateTeamTotal = (team: string) => {
      const total = startups.reduce((sum, startup) => {
        const value = portfolioData[currentRound]?.[startup]?.[team] || 0;
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return sum + (isNaN(numValue) ? 0 : numValue);
      }, 0);
      return total;
    };

    const calculateGrandTotal = () => {
      const total = startups.reduce((sum, startup) => sum + calculateStartupTotal(startup), 0);
      return total;
    };

    // Handle cell value change with database sync
    const handleCellChange = async (startup: string, team: string, value: string) => {
      const numericValue = value === '' ? 0 : parseFloat(value) || 0;
      
      // Update local state immediately for responsive UI
      setPortfolioData(prev => ({
        ...prev,
        [currentRound]: {
          ...prev[currentRound],
          [startup]: {
            ...prev[currentRound][startup],
            [team]: numericValue
          }
        }
      }));

      // Sync to database
      try {
        await fetch('/api/investment', {
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
      } catch (error) {
        console.error('Error syncing portfolio data:', error);
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
        await fetch('/api/investment', {
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
      } catch (error) {
        console.error('Error syncing capital data:', error);
      }
    };

    return (
      <div className="w-[95vw] max-w-none mx-auto bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 relative">
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
          <h2 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h2>
          <p className="text-gray-300 text-sm">투자 게임 포트폴리오 관리</p>
        </div>

        {/* Round Selection Buttons */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {rounds.map((round) => (
              <button
                key={round}
                onClick={() => setCurrentRound(round)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
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

        {/* Spreadsheet */}
        <div className="overflow-x-auto">
          <div className="w-full">
            <table className="w-full border-collapse table-fixed">
              {/* Header Row */}
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-800 border border-gray-600 p-1 text-center font-semibold text-gray-200 w-[60px] text-xs">
                    Startup / Team
                  </th>
                  {teams.map((team) => (
                    <th key={team} className="border border-gray-600 p-0.5 text-center font-semibold text-blue-400 w-[35px] text-xs">
                      {team}
                    </th>
                  ))}
                  <th className="border border-gray-600 p-1 text-center font-semibold text-red-400 w-[60px] text-xs">
                    시가총액
                  </th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody>
                {startups.map((startup) => (
                  <tr key={startup}>
                    <td className="sticky left-0 bg-gray-800 border border-gray-600 p-1 text-center font-semibold text-green-400 text-xs">
                      {startup}
                    </td>
                    {teams.map((team) => (
                      <td key={team} className="border border-gray-600 p-0.5">
                        <input
                          type="number"
                          value={portfolioData[currentRound]?.[startup]?.[team] || ''}
                          onChange={(e) => handleCellChange(startup, team, e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full h-6 bg-gray-700 text-white text-center text-xs rounded border-none focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-600 p-1 text-center font-bold text-red-400 bg-gray-800/50 text-xs">
                      {formatCurrency(calculateStartupTotal(startup))}
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-gray-800/70">
                  <td className="sticky left-0 bg-gray-800 border border-gray-600 p-1 text-center font-bold text-purple-400 text-xs">
                    총 자본금
                  </td>
                  {teams.map((team) => (
                    <td key={team} className="border border-gray-600 p-0.5">
                      <input
                        type="number"
                        value={teamTotalData[currentRound]?.[team] || ''}
                        onChange={(e) => handleTeamTotalChange(team, e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className="w-full h-6 bg-gray-700 text-white text-center text-xs rounded border-none focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-bold text-purple-400"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-600 p-1 text-center font-bold text-yellow-400 bg-gray-700 text-xs">
                    {formatCurrency(calculateGrandTotal())}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gray-800/50 p-3 rounded-xl text-center">
            <h3 className="text-sm font-medium text-green-400 mb-1">총 투자액</h3>
            <p className="text-lg font-bold text-white">{formatCurrency(calculateGrandTotal())}</p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-xl text-center">
            <h3 className="text-sm font-medium text-blue-400 mb-1">활성 팀</h3>
            <p className="text-lg font-bold text-white">
              {teams.filter(team => calculateTeamTotal(team) > 0).length}/16
            </p>
          </div>
          <div className="bg-gray-800/50 p-3 rounded-xl text-center">
            <h3 className="text-sm font-medium text-purple-400 mb-1">참여 스타트업</h3>
            <p className="text-lg font-bold text-white">
              {startups.filter(startup => calculateStartupTotal(startup) > 0).length}/4
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-all">
            수정 차단
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all">
            유효성 검사
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-all">
            수익률 뽑기
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition-all">
            결과 배포
          </button>
        </div>
      </div>
    );
  };

  // Team Dashboard
  const TeamDashboard = () => {
    const teamNumber = session?.user?.email?.match(/team(\d+)@icists\.com/)?.[1];
    const teamName = `team${teamNumber}`;
    
    const [currentRound, setCurrentRound] = useState<string>('Pre-seed');
    const [portfolioData, setPortfolioData] = useState<Record<string, number>>({});
    const [teamCapital, setTeamCapital] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    
    const rounds = ['Pre-seed', 'Seed', 'Series A', 'Series B'];
    const startups = ['startup1', 'startup2', 'startup3', 'startup4'];

    // Number formatting utility
    const formatCurrency = (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '$0.00';
      
      const rounded = Math.round(num * 100) / 100;
      return `$${rounded.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    };

    // Load team data from backend
    const loadTeamData = async (round: string) => {
      try {
        setLoading(true);
        console.log(`[TeamDashboard] Loading data for team: ${teamName}, round: ${round}`);
        
        const response = await fetch(`/api/investment?round=${encodeURIComponent(round)}&team=${encodeURIComponent(teamName)}`);
        console.log(`[TeamDashboard] API Response status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[TeamDashboard] Received data:`, data);
          
          // Update portfolio data - extract team-specific data
          if (data.portfolios) {
            const teamPortfolio: Record<string, number> = {};
            startups.forEach(startup => {
              if (data.portfolios[startup] && data.portfolios[startup][teamName]) {
                const value = data.portfolios[startup][teamName];
                teamPortfolio[startup] = typeof value === 'string' ? parseFloat(value) : value;
              } else {
                teamPortfolio[startup] = 0;
              }
            });
            console.log(`[TeamDashboard] Setting portfolio data:`, teamPortfolio);
            setPortfolioData(teamPortfolio);
          }
          
          // Update team capital
          if (data.capitals && data.capitals[teamName]) {
            const capitalValue = data.capitals[teamName];
            const numCapital = typeof capitalValue === 'string' ? parseFloat(capitalValue) : capitalValue;
            console.log(`[TeamDashboard] Setting capital: ${numCapital}`);
            setTeamCapital(numCapital);
          } else {
            console.log(`[TeamDashboard] No capital data found for team: ${teamName}`);
            setTeamCapital(0);
          }
        } else {
          console.error(`[TeamDashboard] API request failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error('[TeamDashboard] Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load data on mount and round change
    useEffect(() => {
      if (teamName && teamName !== 'teamundefined') {
        console.log(`[TeamDashboard] Initial load triggered for ${teamName}, ${currentRound}`);
        loadTeamData(currentRound);
      }
    }, [teamName, currentRound]);

    // Auto-refresh data every 5 seconds for real-time updates
    useEffect(() => {
      if (!teamName || teamName === 'teamundefined') {
        console.log(`[TeamDashboard] Skipping auto-refresh - invalid team name: ${teamName}`);
        return;
      }

      console.log(`[TeamDashboard] Setting up auto-refresh for ${teamName}, ${currentRound}`);
      
      const interval = setInterval(() => {
        console.log(`[TeamDashboard] Auto-refresh triggered for ${teamName}, ${currentRound}`);
        loadTeamData(currentRound);
      }, 5000);

      // Cleanup function
      return () => {
        console.log(`[TeamDashboard] Cleaning up auto-refresh interval`);
        clearInterval(interval);
      };
    }, [teamName, currentRound]);

    // Handle portfolio investment change with database sync
    const handlePortfolioChange = async (startup: string, value: string) => {
      const numericValue = value === '' ? 0 : parseFloat(value) || 0;
      
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
      const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
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
            {rounds.map((round) => (
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

        {/* Portfolio Breakdown */}
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-purple-400">포트폴리오 현황 ({currentRound})</h3>
          <div className="space-y-4">
            {startups.map((startup) => {
              const investment = portfolioData[startup] || 0;
              const numValue = typeof investment === 'string' ? parseFloat(investment) : investment;
              const safeValue = isNaN(numValue) ? 0 : numValue;
              const percentage = teamCapital > 0 ? ((safeValue / teamCapital) * 100).toFixed(1) : '0.0';
              
              return (
                <div key={startup} className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-200 capitalize">
                      {startup.replace('startup', 'Startup ')}
                    </span>
                    <input
                      type="number"
                      value={safeValue}
                      onChange={(e) => handlePortfolioChange(startup, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full h-6 bg-gray-700 text-white text-center text-xs rounded border-none focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">투자 비율</span>
                    <span className="text-blue-400 font-medium">{percentage}%</span>
                  </div>
                  {/* Investment bar */}
                  <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
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

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center text-xs text-gray-500">
          🔄 데이터는 5초마다 자동으로 업데이트됩니다
        </div>
      </div>
    );
  };

  // Unauthorized Access
  const UnauthorizedAccess = () => (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-red-700 rounded-2xl p-8">
      <div className="text-center">
        <div className="text-6xl mb-6">🚫</div>
        <h2 className="text-3xl font-bold mb-4 text-red-400">
          접근 권한이 없습니다!
        </h2>
        <p className="text-gray-300 mb-6">
          이 페이지에 접근할 권한이 없습니다.<br/>
          관리자에게 문의하세요.
        </p>
        <div className="text-sm text-gray-500">
          현재 로그인: {session?.user?.email}
        </div>
      </div>
    </div>
  );

  // Main page content for authenticated users
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      {/* Main Content */}
      <div className="pt-24 px-4">
        <div className="max-w-[95vw] mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Investment Game
              </span>
            </h1>
            <p className="text-gray-300 text-lg">
              Welcome, {session.user.email?.split('@')[0]}!
            </p>
          </div>

          {/* Role-based Content */}
          {userRole === 'admin' && <AdminDashboard />}
          {userRole === 'team' && <TeamDashboard />}
          {userRole === 'unauthorized' && <UnauthorizedAccess />}
        </div>
      </div>
    </div>
  );
}
