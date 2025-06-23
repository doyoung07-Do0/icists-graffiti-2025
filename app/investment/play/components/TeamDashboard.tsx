'use client';

import { useInvestmentData } from './hooks/useInvestmentData';
import { extractTeamNumber, formatCurrency } from './utils';
import { ROUNDS, STARTUPS } from './types';
import { Inter } from 'next/font/google';

// Initialize Inter font with Korean support
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

interface TeamDashboardProps {
  userEmail: string | null | undefined;
}

export default function TeamDashboard({ userEmail }: TeamDashboardProps) {
  const teamNumber = extractTeamNumber(userEmail);
  const teamName = teamNumber ? `team${teamNumber}` : null;

  const {
    currentRound,
    setCurrentRound,
    loading,
    portfolioData,
    teamTotalData,
    handleCellChange,
  } = useInvestmentData('Pre-seed', teamName);

  const teamPortfolio = STARTUPS.reduce((acc, startup) => {
    acc[startup] = portfolioData[currentRound]?.[startup]?.[teamName || ''] || 0;
    return acc;
  }, {} as Record<string, number>);

  const teamCapital = teamTotalData[currentRound]?.[teamName || ''] || 0;
  const totalInvestment = Object.values(teamPortfolio).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const remainingCapital = teamCapital - totalInvestment;

  if (!teamName) {
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
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-[#4CAF80]"></div>
                  <span>로딩 중...</span>
                </div>
              )}
              {ROUNDS.map(round => (
                <button
                  key={round}
                  onClick={() => setCurrentRound(round)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentRound === round 
                      ? 'gradient-bg text-black font-semibold shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}>
                  {round}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Capital Overview Card */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-2xl p-6 h-full">
              <h2 className="text-xl font-semibold text-white mb-6 pb-2 border-b border-gray-700">
                <span className="gradient-text">자본 현황</span>
              </h2>
              
              <div className="space-y-4">
                <div className="stat-card p-5 rounded-xl group hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-black text-lg font-bold">$</span>
                      </div>
                      <span className="text-gray-300">총 자본금</span>
                    </div>
                    <span className="text-xl font-semibold text-green-400">
                      {formatCurrency(teamCapital, 'USD')}
                    </span>
                  </div>
                </div>

                <div className="stat-card p-5 rounded-xl group hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-black text-lg">💸</span>
                      </div>
                      <span className="text-gray-300">총 투자액</span>
                    </div>
                    <span className="text-xl font-semibold text-orange-400">
                      {formatCurrency(totalInvestment, 'USD')}
                    </span>
                  </div>
                </div>

                <div className="stat-card p-5 rounded-xl group hover:scale-[1.02] transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                        <span className="text-black text-lg">💎</span>
                      </div>
                      <span className="text-gray-300">잔여 자본</span>
                    </div>
                    <span className={`text-xl font-semibold ${
                      remainingCapital < 0 ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      {formatCurrency(remainingCapital, 'USD')}
                    </span>
                  </div>
                  {remainingCapital < 0 && (
                    <p className="mt-2 text-xs text-red-400 text-right">
                      경고: 자본이 부족합니다
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Card */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-6 h-full">
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  <span className="gradient-text">포트폴리오 현황</span>
                  <span className="text-gray-400 text-sm ml-2">{currentRound}</span>
                </h2>
                <div className="text-xs text-gray-400">
                  Investment Amount (USD)
                </div>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {STARTUPS.map((startup) => {
                  const investment = teamPortfolio[startup] || 0;
                  const percentage = teamCapital > 0 ? ((investment / teamCapital) * 100).toFixed(1) : '0.0';
                  const isOverBudget = remainingCapital < 0;

                  return (
                    <div 
                      key={startup} 
                      className="glass-card p-4 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-100">{startup}</span>
                        <div className="relative">
                          <input
                            type="number"
                            value={investment}
                            onChange={(e) => handleCellChange(startup, teamName, e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                            onKeyPress={(e) => { 
                              if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') e.preventDefault(); 
                            }}
                            className={`w-28 h-10 bg-gray-800/50 text-white text-right text-sm rounded-lg border ${
                              isOverBudget ? 'border-red-500/50' : 'border-gray-600/50'
                            } px-3 focus:outline-none focus:ring-1 focus:ring-[#4CAF80]/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            min="0"
                            step="1"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4CAF80] to-[#D2D8B2] rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          parseFloat(percentage) > 0 ? 'text-[#4CAF80]' : 'text-gray-500'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
