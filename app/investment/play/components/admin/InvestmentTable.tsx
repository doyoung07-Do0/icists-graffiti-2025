import { STARTUPS, TEAMS } from '../types';
import { KeyboardEvent } from 'react';

// Import font
import { Inter } from 'next/font/google';

// Shorten startup names (e.g., 'startup1' -> 's1')
const shortenStartupName = (name: string) => {
  return name.replace(/startup(\d+)/i, 's$1');
};

// Initialize Inter font with Korean support
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
 });

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
  loading?: boolean;
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
  calculateStartupTotal,
  loading
}: InvestmentTableProps) => {

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, saveFunction: () => void) => {
    if (e.key === 'Enter') {
      saveFunction();
    }
  };

  return (
    <div className={`${inter.variable} font-sans overflow-x-auto bg-gray-900/30 p-6 rounded-2xl border border-gray-700/30 backdrop-blur-lg w-full max-w-[95vw] mx-auto`}>
      
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-sm text-gray-300 font-medium">
            <th className="bg-gray-800/90 p-3 text-left sticky left-0 z-20 rounded-l-lg backdrop-blur-sm min-w-[80px] border-b border-gray-700">
              T/S
            </th>
            {TEAMS.map(team => (
              <th key={team} className="bg-gray-800/90 p-3 border-b border-gray-700 font-medium min-w-[100px] text-center">
                {team.replace('team', 'T')}
              </th>
            ))}
            <th className="bg-gray-800/90 p-3 border-b border-gray-700 font-medium rounded-r-lg min-w-[120px] text-center">
              시가총액
            </th>
          </tr>
        </thead>
        <tbody>
          {STARTUPS.map((startup, index) => (
            <tr 
              key={startup} 
              className={`hover:bg-gray-800/20 transition-all duration-150 ${index % 2 === 0 ? 'bg-gray-800/5' : 'bg-gray-800/10'}`}
            >
              <td className="p-3 text-sm font-medium text-gray-200 sticky left-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
                {shortenStartupName(startup)}
              </td>
              {TEAMS.map(team => (
                <td key={team} className="p-1.5 border-b border-gray-800">
                  <input
                    type="number"
                    value={portfolioData[currentRound]?.[startup]?.[team] || 0}
                    onChange={(e) => handleCellChange(startup, team, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, () => savePortfolioChange(startup, team))}
                    onBlur={() => savePortfolioChange(startup, team)}
                    onWheel={(e) => e.currentTarget.blur()}
                    onKeyPress={(e) => { if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                    className="w-full h-10 bg-gray-700/30 text-white text-center text-sm border border-gray-700/50 rounded-lg focus:bg-gray-600/50 focus:outline-none focus:ring-1 focus:ring-[#4CAF80]/50 transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none backdrop-blur-sm font-mono"
                    min="0"
                    step="1"
                  />
                </td>
              ))}
              <td className="p-3 text-sm font-medium text-center text-amber-300 bg-amber-900/20 border-b border-amber-900/30">
                {Math.round(calculateStartupTotal(startup)).toLocaleString()}
              </td>
            </tr>
          ))}
          
          {/* Remaining Capital Row */}
          <tr className="border-t border-emerald-900/30 bg-emerald-900/5 hover:bg-emerald-900/10">
            <td className="p-3 text-sm font-medium text-emerald-100 sticky left-0 z-10 bg-emerald-900/20 backdrop-blur-sm border-b border-emerald-900/30">
              잔여 자본
            </td>
            {TEAMS.map(team => {
              const totalCapital = teamTotalData[currentRound]?.[team] || 0;
              const totalInvested = STARTUPS.reduce((sum, startup) => {
                return sum + (portfolioData[currentRound]?.[startup]?.[team] || 0);
              }, 0);
              const remainingCapital = totalCapital - totalInvested;
              
              return (
                <td key={team} className="p-3 text-sm font-medium text-center text-emerald-100 bg-emerald-900/20 border-b border-emerald-900/30">
                  {Math.round(remainingCapital).toLocaleString()}
                </td>
              );
            })}
            <td className="p-3 text-sm font-bold text-center text-emerald-100 bg-emerald-900/30 border-b border-emerald-900/30">
              {TEAMS.reduce((grandTotal, team) => {
                const totalCapital = teamTotalData[currentRound]?.[team] || 0;
                const totalInvested = STARTUPS.reduce((sum, startup) => {
                  return sum + (portfolioData[currentRound]?.[startup]?.[team] || 0);
                }, 0);
                return grandTotal + (totalCapital - totalInvested);
              }, 0).toLocaleString()}
            </td>
          </tr>
          
          {/* Total Capital Row */}
          <tr className="border-t border-amber-900/30 bg-amber-900/5 hover:bg-amber-900/10">
            <td className="p-3 text-sm font-medium text-amber-100 sticky left-0 z-10 bg-amber-900/20 backdrop-blur-sm rounded-bl-lg border-b border-amber-900/30">
              총 자본금
            </td>
            {TEAMS.map(team => (
              <td key={team} className="p-1.5 border-b border-amber-900/30">
                <input
                  type="number"
                  value={teamTotalData[currentRound]?.[team] || 0}
                  onChange={(e) => handleTeamTotalChange(team, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, () => saveTeamTotalChange(team))}
                  onBlur={() => saveTeamTotalChange(team)}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyPress={(e) => { if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E') e.preventDefault(); }}
                  className="w-full h-10 bg-amber-900/20 text-amber-100 text-center text-sm border border-amber-700/30 rounded-lg focus:bg-amber-800/30 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none backdrop-blur-sm font-mono"
                  min="0"
                  step="1"
                />
              </td>
            ))}
            <td className="p-3 text-sm font-bold text-center text-amber-100 bg-amber-900/40 rounded-br-lg border-b border-amber-900/30">
              {Math.round(Object.values(teamTotalData[currentRound] || {}).reduce((sum, val) => sum + val, 0)).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
