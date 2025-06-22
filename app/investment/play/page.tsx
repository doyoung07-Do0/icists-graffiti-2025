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
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isRealUser) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const AdminDashboard = () => {
    const [currentRound, setCurrentRound] = useState<string>('Pre-seed');
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

    // Calculate totals
    const calculateStartupTotal = (startup: string) => {
      return teams.reduce((sum, team) => sum + (portfolioData[currentRound]?.[startup]?.[team] || 0), 0);
    };

    const calculateTeamTotal = (team: string) => {
      return startups.reduce((sum, startup) => sum + (portfolioData[currentRound]?.[startup]?.[team] || 0), 0);
    };

    const calculateGrandTotal = () => {
      return startups.reduce((sum, startup) => sum + calculateStartupTotal(startup), 0);
    };

    // Handle cell value change
    const handleCellChange = (startup: string, team: string, value: string) => {
      const numericValue = value === '' ? 0 : parseFloat(value) || 0;
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
    };

    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h2>
          <p className="text-gray-300">투자 게임 포트폴리오 관리</p>
        </div>

        {/* Round Selection Buttons */}
        <div className="mb-6">
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
                  <th className="sticky left-0 bg-gray-800 border border-gray-600 p-2 text-center font-semibold text-gray-200 w-[80px]">
                    Startup / Team
                  </th>
                  {teams.map((team) => (
                    <th key={team} className="border border-gray-600 p-1 text-center font-semibold text-blue-400 w-[45px] text-xs">
                      {team}
                    </th>
                  ))}
                  <th className="border border-gray-600 p-2 text-center font-semibold text-red-400 w-[80px] text-xs">
                    시가총액
                  </th>
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody>
                {startups.map((startup) => (
                  <tr key={startup}>
                    <td className="sticky left-0 bg-gray-800 border border-gray-600 p-2 text-center font-semibold text-green-400 text-sm">
                      {startup}
                    </td>
                    {teams.map((team) => (
                      <td key={team} className="border border-gray-600 p-0.5">
                        <input
                          type="number"
                          value={portfolioData[currentRound]?.[startup]?.[team] || ''}
                          onChange={(e) => handleCellChange(startup, team, e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                          onMouseDown={(e) => e.preventDefault()}
                          className="w-full h-8 bg-gray-700 text-white text-center text-xs rounded border-none focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-600 p-2 text-center font-bold text-red-400 bg-gray-800/50 text-xs">
                      ${calculateStartupTotal(startup).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-gray-800/70">
                  <td className="sticky left-0 bg-gray-800 border border-gray-600 p-2 text-center font-bold text-purple-400 text-sm">
                    총 자본금
                  </td>
                  {teams.map((team) => (
                    <td key={team} className="border border-gray-600 p-1 text-center font-bold text-purple-400 text-xs">
                      ${calculateTeamTotal(team).toLocaleString()}
                    </td>
                  ))}
                  <td className="border border-gray-600 p-2 text-center font-bold text-yellow-400 bg-gray-700 text-xs">
                    ${calculateGrandTotal().toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 p-4 rounded-xl text-center">
            <h3 className="text-lg font-medium text-green-400 mb-2">총 투자액</h3>
            <p className="text-2xl font-bold text-white">${calculateGrandTotal().toLocaleString()}</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl text-center">
            <h3 className="text-lg font-medium text-blue-400 mb-2">활성 팀</h3>
            <p className="text-2xl font-bold text-white">
              {teams.filter(team => calculateTeamTotal(team) > 0).length}/16
            </p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-xl text-center">
            <h3 className="text-lg font-medium text-purple-400 mb-2">참여 스타트업</h3>
            <p className="text-2xl font-bold text-white">
              {startups.filter(startup => calculateStartupTotal(startup) > 0).length}/4
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-all">
            데이터 저장
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all">
            리포트 생성
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-all">
            CSV 내보내기
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-semibold transition-all">
            다음 라운드
          </button>
        </div>
      </div>
    );
  };

  // Team Dashboard
  const TeamDashboard = () => {
    const teamNumber = session?.user?.email?.match(/team(\d+)@icists\.com/)?.[1];
    
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Team {teamNumber} Dashboard
            </span>
          </h2>
          <p className="text-gray-300">팀 {teamNumber} 투자 게임 대시보드</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4 text-green-400">Portfolio Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Balance:</span>
                <span className="text-green-400 font-semibold">$125,430</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Return:</span>
                <span className="text-blue-400 font-semibold">+25.43%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rank:</span>
                <span className="text-purple-400 font-semibold">3rd / 16</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <h3 className="text-xl font-medium mb-4 text-blue-400">Current Holdings</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">AAPL:</span>
                <span className="text-green-400">+12.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">GOOGL:</span>
                <span className="text-red-400">-3.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">TSLA:</span>
                <span className="text-green-400">+8.7%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-purple-400">Trading Interface</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-all">
              Buy Stocks
            </button>
            <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition-all">
              Sell Stocks
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-all">
              View Market
            </button>
          </div>
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
