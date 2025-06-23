import { STARTUPS, TEAMS } from '../types';
import { KeyboardEvent } from 'react';

interface InvestmentTableProps {
  currentRound: string;
  portfolioData: Record<string, Record<string, Record<string, number>>>;
  teamTotalData: Record<string, Record<string, number>>;
  marketCapData: Record<string, Record<string, number>>;
  handleCellChange: (startup: string, team: string, value: string) => void;
  handleTeamTotalChange: (team: string, value: string) => void;
  handleMarketCapChange: (team: string, value: string) => void;
  savePortfolioChange: (startup: string, team: string) => void;
  saveTeamTotalChange: (team: string) => void;
  saveMarketCapChange: (team: string) => void;
  calculateStartupTotal: (startup: string) => number;
}

export const InvestmentTable = ({ 
  currentRound, 
  portfolioData, 
  teamTotalData, 
  marketCapData, 
  handleCellChange, 
  handleTeamTotalChange, 
  handleMarketCapChange, 
  savePortfolioChange,
  saveTeamTotalChange,
  saveMarketCapChange,
  calculateStartupTotal 
}: InvestmentTableProps) => {

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, saveFunction: () => void) => {
    if (e.key === 'Enter') {
      saveFunction();
    }
  };

  return (
    <div className="overflow-x-auto bg-gray-900/50 p-4 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-lg">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wider">
            <th className="bg-gray-800/60 p-3 text-left sticky left-0 z-20 rounded-tl-2xl font-semibold backdrop-blur-sm shadow-lg min-w-[150px]">
              스타트업
            </th>
            {TEAMS.map(team => (
              <th key={team} className="bg-gray-800/60 p-3 border-b border-gray-600/50 min-w-[90px] font-semibold backdrop-blur-sm">
                {team.replace('team', 'T')}
              </th>
            ))}
            <th className="bg-gradient-to-r from-amber-800/80 to-orange-700/80 text-amber-200 p-3 border-b border-gray-600/50 min-w-[90px] rounded-tr-2xl font-semibold backdrop-blur-sm">
              총합
            </th>
          </tr>
        </thead>
        <tbody>
          {STARTUPS.map(startup => (
            <tr key={startup} className="border-b border-gray-700/50 hover:bg-gray-800/40 transition-colors duration-200">
              <td className="bg-gray-800/60 p-3 text-sm font-bold text-white sticky left-0 z-10 backdrop-blur-sm shadow-lg">
                {startup}
              </td>
              {TEAMS.map(team => (
                <td key={team} className="p-1">
                  <input
                    type="number"
                    value={portfolioData[currentRound]?.[startup]?.[team] || 0}
                    onChange={(e) => handleCellChange(startup, team, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => savePortfolioChange(startup, team))}
                    onBlur={() => savePortfolioChange(startup, team)}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyPress={(e) => { if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                    className="w-full h-10 bg-gray-700/40 text-white text-center text-sm border-none rounded-xl focus:bg-gray-600/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none backdrop-blur-sm shadow-inner"
                    min="0"
                    step="1"
                  />
                </td>
              ))}
              <td className="bg-gradient-to-r from-amber-700/40 to-orange-600/40 text-amber-200 font-semibold text-center p-3">
                {Math.round(calculateStartupTotal(startup)).toLocaleString()}
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-purple-400/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <td className="bg-gradient-to-r from-purple-700/80 to-indigo-700/80 text-purple-200 font-bold p-3 sticky left-0 z-10 rounded-bl-2xl backdrop-blur-sm shadow-lg">
              총 자본금
            </td>
            {TEAMS.map(team => (
              <td key={team} className="bg-purple-800/30 p-1 backdrop-blur-sm">
                <input
                  type="number"
                  value={teamTotalData[currentRound]?.[team] || 0}
                  onChange={(e) => handleTeamTotalChange(team, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, () => saveTeamTotalChange(team))}
                  onBlur={() => saveTeamTotalChange(team)}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyPress={(e) => { if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                  className="w-full h-10 bg-purple-700/40 text-white text-center text-sm border-none rounded-xl focus:bg-purple-600/60 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none backdrop-blur-sm shadow-inner"
                  min="0"
                  step="1"
                />
              </td>
            ))}
            <td className="bg-gradient-to-r from-amber-700/60 to-orange-600/60 text-amber-100 font-bold text-center p-3 rounded-br-2xl backdrop-blur-sm shadow-lg">
              {Math.round(Object.values(teamTotalData[currentRound] || {}).reduce((sum, val) => sum + val, 0)).toLocaleString()}
            </td>
          </tr>
          <tr className="border-t-2 border-cyan-400/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
            <td className="bg-gradient-to-r from-cyan-700/80 to-blue-700/80 text-cyan-200 font-bold p-3 sticky left-0 z-10 rounded-bl-2xl backdrop-blur-sm shadow-lg">
              시가총액
            </td>
            {TEAMS.map(team => (
              <td key={team} className="bg-cyan-800/30 p-1 backdrop-blur-sm">
                <input
                  type="number"
                  value={marketCapData[currentRound]?.[team] || 0}
                  onChange={(e) => handleMarketCapChange(team, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, () => saveMarketCapChange(team))}
                  onBlur={() => saveMarketCapChange(team)}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyPress={(e) => { if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                  className="w-full h-10 bg-cyan-700/40 text-white text-center text-sm border-none rounded-xl focus:bg-cyan-600/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none backdrop-blur-sm shadow-inner"
                  min="0"
                  step="1"
                />
              </td>
            ))}
            <td className="bg-gradient-to-r from-cyan-700/60 to-blue-600/60 text-cyan-100 font-bold text-center p-3 rounded-br-2xl backdrop-blur-sm shadow-lg">
              {Math.round(Object.values(marketCapData[currentRound] || {}).reduce((sum, val) => sum + val, 0)).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
