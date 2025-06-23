'use client';

import { useInvestmentData } from './hooks/useInvestmentData';
import { InvestmentTable } from './admin/InvestmentTable';
import { ROUNDS, TEAMS, STARTUPS } from './types';

export default function AdminDashboard() {
  const {
    currentRound,
    setCurrentRound,
    loading,
    portfolioData,
    teamTotalData,
    marketCapData,
    handleCellChange,
    handleTeamTotalChange,
    handleMarketCapChange,
    savePortfolioChange,
    saveTeamTotalChange,
    saveMarketCapChange,
    calculateStartupTotal,
    calculateGrandTotal
  } = useInvestmentData();

  return (
    <div className="bg-black text-[#E5E7EB] min-h-screen">
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
        
        .admin-button {
          background: linear-gradient(135deg, rgba(210, 216, 178, 0.1) 0%, rgba(76, 175, 128, 0.1) 100%);
          border: 1px solid rgba(210, 216, 178, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .admin-button:hover {
          background: linear-gradient(135deg, rgba(210, 216, 178, 0.2) 0%, rgba(76, 175, 128, 0.2) 100%);
          border-color: rgba(210, 216, 178, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(210, 216, 178, 0.1);
        }
        
        .stat-card {
          background: rgba(17, 17, 17, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(210, 216, 178, 0.1);
        }
      `}</style>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light mb-4">
            <span className="gradient-text font-extrabold tracking-tight">Admin Dashboard</span>
          </h1>
          <p className="text-lg text-gray-400 font-light">
            Manage and update investment status in real-time
          </p>
        </div>



        {/* Investment Table */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-medium text-white">Portfolio Overview</h2>
            <div className="flex items-center space-x-4">
              {loading && (
                <div className="flex items-center space-x-1.5 text-sm text-gray-300 bg-gray-800/50 px-3 py-1.5 rounded-lg">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-[#4CAF80]"></div>
                  <span>로딩 중...</span>
                </div>
              )}
              <div className="flex items-center space-x-1 bg-gray-800/50 rounded-xl p-1">
                {ROUNDS.map(round => (
                  <button
                    key={round}
                    onClick={() => setCurrentRound(round)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      currentRound === round 
                        ? 'bg-white/10 text-white shadow' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}>
                    {round}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <InvestmentTable 
            currentRound={currentRound}
            portfolioData={portfolioData}
            teamTotalData={teamTotalData}
            marketCapData={marketCapData}
            handleCellChange={handleCellChange}
            handleTeamTotalChange={handleTeamTotalChange}
            handleMarketCapChange={handleMarketCapChange}
            savePortfolioChange={savePortfolioChange}
            saveTeamTotalChange={saveTeamTotalChange}
            saveMarketCapChange={saveMarketCapChange}
            calculateStartupTotal={calculateStartupTotal}
            loading={loading}
          />
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="stat-card rounded-lg p-4 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-black text-xs font-bold">₩</span>
            </div>
            <p className="text-sm font-medium text-gray-400">
              총 투자액: {Math.round(calculateGrandTotal()).toLocaleString()}
            </p>
          </div>
          
          <div className="stat-card rounded-lg p-4 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-black text-xs font-bold">👥</span>
            </div>
            <p className="text-sm font-medium text-gray-400">
              활성 팀: {TEAMS.length}
            </p>
          </div>
          
          <div className="stat-card rounded-lg p-4 text-center group hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-black text-xs font-bold">🚀</span>
            </div>
            <p className="text-sm font-medium text-gray-400">
              스타트업: {STARTUPS.length}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button className="admin-button px-12 py-6 rounded-2xl font-semibold text-white text-2xl">
            <span className="flex items-center gap-3">
              <span className="text-red-400">🚫</span>
              제출 차단
            </span>
          </button>
          
          <button className="admin-button px-12 py-6 rounded-2xl font-semibold text-white text-2xl">
            <span className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              유효성 검사
            </span>
          </button>
          
          <button className="admin-button px-12 py-6 rounded-2xl font-semibold text-white text-2xl">
            <span className="flex items-center gap-3">
              <span className="text-blue-400">📊</span>
              수익률 뽑기
            </span>
          </button>
          
          <button className="admin-button px-12 py-6 rounded-2xl font-semibold text-white text-2xl">
            <span className="flex items-center gap-3">
              <span className="text-orange-400">🚀</span>
              결과 배포
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
