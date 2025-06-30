'client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, X, RefreshCw } from 'lucide-react';

type TeamNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
type StartupKey = 's1' | 's2' | 's3' | 's4';
type TeamName = `team${TeamNumber}`;

const TEAM_NUMBERS: TeamNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const STARTUP_KEYS: StartupKey[] = ['s1', 's2', 's3', 's4'];

// Mock API client
const investmentApi = {
  updatePortfolio: async (data: any) => {
    console.log('Updating portfolio:', data);
    return { success: true };
  },
};

// Define table components with proper TypeScript types
interface TableProps {
  children: ReactNode;
  className?: string;
}

const Table = ({ children, className = '' }: TableProps) => (
  <div className={`w-full overflow-hidden rounded-lg border ${className}`}>
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: ReactNode }) => (
  <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
);

const TableBody = ({ children }: { children: ReactNode }) => (
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
);

const TableRow = ({ children }: { children: ReactNode }) => (
  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">{children}</tr>
);

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

const TableHead = ({ children, className = '' }: TableHeadProps) => (
  <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

interface TableCellProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isNumeric?: boolean;
}

const TableCell = ({ 
  children, 
  className = '',
  onClick,
  isNumeric = false
}: TableCellProps) => (
  <td 
    className={`px-4 py-2 whitespace-nowrap text-sm ${
      isNumeric ? 'text-right' : 'text-left'
    } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </td>
);

interface InvestmentTableProps {
  currentRound: string;
}

interface TeamInvestments {
  [key: string]: number; // team1: number, team2: number, etc.
}

interface TeamTotals {
  [key: string]: number;
}

interface MarketCaps {
  [key in StartupKey]: number;
}

interface EditingCell {
  team: TeamName;
  startup: StartupKey;
  value: number;
}

export const InvestmentTable = ({ currentRound }: InvestmentTableProps) => {
  const [investments, setInvestments] = useState<Record<TeamName, Record<StartupKey, number>>>({} as Record<TeamName, Record<StartupKey, number>>);
  const [teamTotals, setTeamTotals] = useState<TeamTotals>({});
  const [marketCaps, setMarketCaps] = useState<MarketCaps>({
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  // Load investment data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Mock data - replace with actual API calls
      const mockInvestments = {} as Record<TeamName, Record<StartupKey, number>>;
      const mockTeamTotals: TeamTotals = {};
      const mockMarketCaps: MarketCaps = {
        s1: 1000000,
        s2: 2000000,
        s3: 3000000,
        s4: 4000000
      };
      
      // Initialize with mock data
      TEAM_NUMBERS.forEach(teamNum => {
        const team = `team${teamNum}` as TeamName;
        mockInvestments[team] = {} as Record<StartupKey, number>;
        let teamTotal = 0;
        
        STARTUP_KEYS.forEach(startup => {
          const amount = Math.floor(Math.random() * 50000);
          mockInvestments[team][startup] = amount;
          teamTotal += amount;
        });
        
        mockTeamTotals[team] = teamTotal;
      });
      
      setInvestments(mockInvestments);
      setTeamTotals(mockTeamTotals);
      setMarketCaps(mockMarketCaps);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentRound]);

  // Load data on component mount and when round changes
  useEffect(() => {
    loadData();
  }, [currentRound, loadData]);

  // Handle cell click to start editing
  const handleCellClick = (team: TeamName, startup: StartupKey, value: number) => {
    setEditingCell({ team, startup, value });
  };

  // Handle cell edit cancel
  const handleCancelEdit = (): void => {
    setEditingCell(null);
  };

  // Handle input value change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCell) return;
    const value = Math.max(0, parseInt(e.target.value) || 0);
    setEditingCell({ ...editingCell, value });
  };

  // Save cell value
  const saveCellValue = async () => {
    if (!editingCell) return;
    
    const { team, startup, value } = editingCell;
    
    try {
      setIsSaving(true);
      
      // Update local state with proper typing
      setInvestments(prev => ({
        ...prev,
        [team]: {
          ...(prev[team as TeamName] || {}),
          [startup]: value
        } as Record<StartupKey, number>
      }));
      
      // Update team total with proper typing
      const teamTotal = STARTUP_KEYS.reduce((sum: number, s: StartupKey) => {
        const investment = s === startup ? value : (investments[team as TeamName]?.[s] || 0);
        return sum + investment;
      }, 0);
      
      setTeamTotals(prev => ({
        ...prev,
        [team]: teamTotal
      }));
      
      // Save to API
      await investmentApi.updatePortfolio({
        round: currentRound,
        team: team.replace('team', ''),
        startup,
        amount: value
      });
      
      setEditingCell(null);
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error('Error saving investment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate remaining funds for a team
  const calculateRemaining = (team: TeamName): number => {
    const total = teamTotals[team] || 0;
    return 1000000 - total; // Assuming 1M is the total funds
  };

  // Calculate total investment for a startup across all teams
  const calculateStartupTotal = (startup: StartupKey): number => {
    return TEAM_NUMBERS.reduce((sum: number, teamNum: TeamNumber) => {
      const team = `team${teamNum}` as TeamName;
      return sum + (investments[team]?.[startup] || 0);
    }, 0);
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
      <p className="text-red-300">{error}</p>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-4"
        onClick={loadData}
        disabled={isSaving}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        {isSaving ? 'Saving...' : 'Retry'}
      </Button>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            {STARTUP_KEYS.map((startup: StartupKey) => (
              <TableHead key={startup} className="text-center">
                <div>{startup.toUpperCase()}</div>
                <div className="text-xs text-gray-400">
                  ${marketCaps[startup].toLocaleString()}
                </div>
              </TableHead>
            ))}
            <TableHead className="text-right">Remaining</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TEAM_NUMBERS.map((teamNum: TeamNumber) => {
            const team = `team${teamNum}` as TeamName;
            const remaining = calculateRemaining(team);
            const teamTotal = teamTotals[team] || 0;
            const teamInvestments = investments[team] || {} as Record<StartupKey, number>;
            
            return (
              <TableRow key={team}>
                <TableCell className="font-medium">{teamNum}</TableCell>
                
                {STARTUP_KEYS.map((startup: StartupKey) => {
                  const isEditing = editingCell?.team === team && editingCell?.startup === startup;
                  const value = teamInvestments[startup] || 0;
                  
                  return (
                    <TableCell key={`${team}-${startup}`} className="p-0">
                      {isEditing ? (
                        <div className="flex items-center">
                          <Input
                            type="number"
                            value={editingCell?.value || 0}
                            onChange={handleValueChange}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveCellValue();
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            className="h-8 w-full text-center"
                            autoFocus
                            min={0}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 ml-1"
                            onClick={saveCellValue}
                            disabled={isSaving}
                            aria-label="Save changes"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            aria-label="Cancel editing"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="w-full p-2 text-left hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => handleCellClick(team, startup, value)}
                          disabled={isSaving}
                        >
                          {value.toLocaleString()}
                        </button>
                      )}
                    </TableCell>
                  );
                })}
                
                <TableCell className="text-right">
                  <span className={remaining < 0 ? 'text-red-400' : ''}>
                    {remaining.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {teamTotal.toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
          
          {/* Totals row */}
          <TableRow className="bg-gray-100 dark:bg-gray-800 font-medium">
            <TableCell>Total</TableCell>
            {STARTUP_KEYS.map((startup: StartupKey) => (
              <TableCell key={`total-${startup}`} className="text-right">
                {calculateStartupTotal(startup).toLocaleString()}
              </TableCell>
            ))}
            <TableCell className="text-right">
              {Object.values(teamTotals).reduce((sum: number, total: number) => sum + total, 0).toLocaleString()}
            </TableCell>
            <TableCell className="text-right">
              {STARTUP_KEYS.reduce((sum: number, startup: StartupKey) => 
                sum + calculateStartupTotal(startup), 0).toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  // Load data on mount and when currentRound changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingCell(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main component render
  if (isLoading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Investment Dashboard</h2>
        <div className="text-sm text-gray-500">
          Round: <span className="font-medium">{currentRound}</span>
        </div>
      </div>
      {renderTable()}
    </div>
  );
            ))}
            <TableCell className="text-right font-bold">
              {TEAM_NUMBERS.reduce((sum, teamNum) => 
                sum + calculateRemaining(`team${teamNum}`), 0
              ).toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold">
              {TEAM_NUMBERS.reduce((sum, teamNum) => 
                sum + (teamTotals[`team${teamNum}`] || 0), 0
              ).toLocaleString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Click on any cell to edit the investment amount.</p>
      </div>
    </div>
  );
};
