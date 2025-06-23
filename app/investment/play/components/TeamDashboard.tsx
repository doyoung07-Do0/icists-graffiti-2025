'use client';

import { useInvestmentData } from './hooks/useInvestmentData';
import { extractTeamNumber, formatCurrency } from './utils';
import { ROUNDS, STARTUPS } from './types';

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
    return <div className="text-center text-red-500 p-8">유효한 팀 정보가 없습니다.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-900 text-white">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-blue-400">Team {teamNumber} Dashboard</h2>
        <p className="text-gray-400">라운드: {currentRound}</p>
      </div>

      <div className="flex justify-center space-x-2 mb-6">
        {ROUNDS.map(round => (
          <button
            key={round}
            onClick={() => setCurrentRound(round)}
            className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors ${currentRound === round ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {round}
          </button>
        ))}
      </div>

      {loading && <div className="text-center p-4">로딩 중...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-purple-400 text-center">자본 현황</h3>
          <div className="space-y-4">
            <div className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
              <span className="text-gray-300">총 자본금</span>
              <span className="text-xl font-bold text-green-400">{formatCurrency(teamCapital, 'KRW')}</span>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
              <span className="text-gray-300">총 투자액</span>
              <span className="text-xl font-bold text-orange-400">{formatCurrency(totalInvestment, 'KRW')}</span>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
              <span className="text-gray-300">잔여 자본</span>
              <span className={`text-xl font-bold ${remainingCapital < 0 ? 'text-red-500' : 'text-blue-400'}`}>
                {formatCurrency(remainingCapital, 'KRW')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-medium mb-4 text-purple-400 text-center">포트폴리오 현황 ({currentRound})</h3>
          <div className="space-y-4">
            {STARTUPS.map((startup) => {
              const investment = teamPortfolio[startup] || 0;
              const percentage = teamCapital > 0 ? ((investment / teamCapital) * 100).toFixed(1) : '0.0';

              return (
                <div key={startup} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium text-sm">{startup}</span>
                    <input
                      type="number"
                      value={investment}
                      onChange={(e) => handleCellChange(startup, teamName, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyPress={(e) => { if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                      className="w-24 h-7 bg-gray-700 text-white text-center text-sm rounded border-none focus:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-gray-400">투자 비율</span>
                    <span className="text-blue-400 font-medium">{percentage}%</span>
                  </div>
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
