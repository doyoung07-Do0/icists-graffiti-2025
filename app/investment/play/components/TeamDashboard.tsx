'use client';

import { useState } from 'react';
import { extractTeamNumber, formatCurrency } from './utils';
import { Inter } from 'next/font/google';
import { useTeamDashboardData } from './hooks/useTeamDashboardData';

// Initialize Inter font with Korean support
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

interface TeamDashboardProps {
  userEmail: string | null | undefined;
}

// Map round names to their API values
const ROUND_MAPPING = {
  'Pre-seed': 'r1',
  'Seed': 'r2',
  'Series A': 'r3',
  'Series B': 'r4',
} as const;

type RoundKey = keyof typeof ROUND_MAPPING;

export default function TeamDashboard({ userEmail }: TeamDashboardProps) {
  const teamNumber = extractTeamNumber(userEmail);
  const [currentRound, setCurrentRound] = useState<RoundKey>('Pre-seed');
  
  // Get the API round value
  const apiRound = ROUND_MAPPING[currentRound];
  
  // Fetch team data using our custom hook
  const {
    loading,
    error,
    teamData,
    totalInvested,
    remainingCapital,
    totalCapital,
  } = useTeamDashboardData(teamNumber || 1, apiRound);
  
  // Calculate portfolio percentages
  const portfolioPercentages = {
    s1: teamData && totalCapital > 0 ? Math.round((teamData.s1 / totalCapital) * 100) : 0,
    s2: teamData && totalCapital > 0 ? Math.round((teamData.s2 / totalCapital) * 100) : 0,
    s3: teamData && totalCapital > 0 ? Math.round((teamData.s3 / totalCapital) * 100) : 0,
    s4: teamData && totalCapital > 0 ? Math.round((teamData.s4 / totalCapital) * 100) : 0,
  };

  if (!teamNumber) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-gray-900/50 backdrop-blur-lg border border-red-500/30">
          <h2 className="text-2xl font-bold text-red-400 mb-2">팀 정보 오류</h2>
          <p className="text-gray-300">유효한 팀 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${inter.variable} font-sans min-h-screen bg-black text-[#E5E7EB]`}>
      {/* Custom styles for consistent design */}
      <style jsx global>{`
        .gradient-text {
          background: linear-gradient(to right, #D2D8B2, #4CAF80);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, #D2D8B2 0%, #4CAF80 100%);
        }
        
        .glass-card {
          background: rgba(229, 231, 235, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(229, 231, 235, 0.1);
        }
        
        .stat-card {
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(210, 216, 178, 0.1);
        }
      `}</style>

      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light mb-4">
            <span className="gradient-text font-extrabold tracking-tight">Team {teamNumber} Dashboard</span>
          </h1>
          <p className="text-lg text-gray-400 font-light">
            Track and manage your investment portfolio in real-time
          </p>
        </div>

        {/* Round Selector */}
        <div className="flex justify-center mb-12">
          <div className="glass-card rounded-2xl p-1.5">
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="flex items-center space-x-1.5 text-sm text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <div className="animate-spin rounded-full size-3.5 border-t-2 border-[#4CAF80]"></div>
                  <span>로딩 중...</span>
                </div>
              )}
              {(Object.entries(ROUND_MAPPING) as [RoundKey, string][]).map(([roundName, _]) => (
                <button
                  key={roundName}
                  onClick={() => setCurrentRound(roundName)}
                  disabled={loading}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentRound === roundName
                      ? 'bg-gradient-to-r from-[#D2D8B2] to-[#4CAF80] text-gray-900'
                      : 'text-gray-300 hover:bg-gray-800/50 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {roundName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-300">총 자본금</h3>
              <div className="text-2xl font-bold text-green-400">
                {loading ? '...' : formatCurrency(totalCapital)}
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="stat-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-300">총 투자액</h3>
              <div className="text-2xl font-bold text-yellow-400">
                {loading ? '...' : formatCurrency(totalInvested)}
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                style={{ width: `${totalCapital > 0 ? Math.min(100, (totalInvested / totalCapital) * 100) : 0}%` }}
              />
            </div>
          </div>
          
          <div className="stat-card rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-300">잔여 자본</h3>
              <div className="text-2xl font-bold text-blue-400">
                {loading ? '...' : formatCurrency(remainingCapital)}
              </div>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-500"
                style={{ width: `${totalCapital > 0 ? (remainingCapital / totalCapital) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="glass-card rounded-2xl p-6 mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">포트폴리오 분석</h2>
            {loading && (
              <div className="flex items-center text-sm text-gray-400">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-400 mr-2"></div>
                업데이트 중...
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {['s1', 's2', 's3', 's4'].map((startup, index) => {
              if (!teamData) return null;
              const amount = teamData[startup as keyof typeof teamData] as number || 0;
              const percentage = portfolioPercentages[startup as keyof typeof portfolioPercentages] || 0;
              const colors = [
                'from-purple-400 to-pink-500',
                'from-blue-400 to-cyan-500',
                'from-green-400 to-emerald-500',
                'from-yellow-400 to-amber-500'
              ];
              
              return (
                <div key={startup} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">Startup {index + 1}</span>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{loading ? '...' : formatCurrency(amount)}</span>
                      <span className="text-sm text-gray-400">{percentage}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${colors[index]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700/50 rounded-lg text-red-300 text-sm">
              데이터를 불러오는 중 오류가 발생했습니다. 새로고침 해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
