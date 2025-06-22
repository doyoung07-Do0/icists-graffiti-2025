'use client';

import { useEffect } from 'react';
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
  const AdminDashboard = () => (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          <span className="bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
            Admin Dashboard
          </span>
        </h2>
        <p className="text-gray-300">관리자 전용 대시보드</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-red-400">Team Management</h3>
          <p className="text-gray-400 mb-4">팀별 진행 상황 관리</p>
          <div className="space-y-2">
            <div className="text-sm text-green-400">✓ Team 1-8: Active</div>
            <div className="text-sm text-yellow-400">⚠ Team 9-12: Pending</div>
            <div className="text-sm text-gray-400">⭘ Team 13-16: Not Started</div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-blue-400">Game Statistics</h3>
          <p className="text-gray-400 mb-4">전체 게임 통계</p>
          <div className="space-y-2">
            <div className="text-sm">총 참여 팀: <span className="text-green-400">16팀</span></div>
            <div className="text-sm">평균 수익률: <span className="text-blue-400">+15.3%</span></div>
            <div className="text-sm">게임 진행률: <span className="text-purple-400">75%</span></div>
          </div>
        </div>
        
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-purple-400">System Control</h3>
          <p className="text-gray-400 mb-4">시스템 제어 패널</p>
          <div className="space-y-3">
            <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition-colors">
              Start New Round
            </button>
            <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition-colors">
              View Reports
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm transition-colors">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
        <div className="max-w-6xl mx-auto">
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
