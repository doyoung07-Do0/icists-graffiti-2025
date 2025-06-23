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
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-purple-300 tracking-wider">관리자 대시보드</h1>
        <p className="text-sm text-gray-400 mb-6">투자 현황을 실시간으로 관리하고 업데이트합니다.</p>

        {/* Round Selector */}
        <div className="flex flex-wrap gap-2 mb-6 bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm border border-gray-700/50">
          {ROUNDS.map(round => (
            <button
              key={round}
              onClick={() => setCurrentRound(round)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${currentRound === round ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'}`}>
              {round}
            </button>
          ))}
        </div>

        {loading && <div className="text-center p-4">로딩 중...</div>}

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
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-gradient-to-br from-amber-900/40 to-orange-800/40 backdrop-blur-xl p-4 rounded-2xl text-center border border-amber-700/30 shadow-lg">
            <h3 className="text-xs font-semibold text-amber-200 mb-1 tracking-wide">총 투자액</h3>
            <p className="text-xl font-bold text-amber-100 tracking-tight">{Math.round(calculateGrandTotal()).toLocaleString()}</p>
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
            <span className="flex items-center gap-2">🚫 제출 차단</span>
          </button>
          <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105 border border-blue-500/30 backdrop-blur-sm">
            <span className="flex items-center gap-2">✓ 유효성 검사</span>
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105 border border-purple-500/30 backdrop-blur-sm">
            <span className="flex items-center gap-2">📊 수익률 뽑기</span>
          </button>
          <button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:transform hover:scale-105 border border-orange-500/30 backdrop-blur-sm">
            <span className="flex items-center gap-2">🚀 결과 배포</span>
          </button>
        </div>
      </div>
    </div>
  );
}
