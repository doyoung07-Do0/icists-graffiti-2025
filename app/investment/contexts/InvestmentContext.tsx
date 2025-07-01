'client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  RoundKey, 
  RoundName, 
  TeamNumber, 
  TeamName, 
  TEAM_NUMBERS, 
  STARTUP_KEYS, 
  StartupKey, 
  ROUND_KEYS,
  ROUND_NAMES,
  MarketCaps,
  ReturnsData
} from '@/app/investment/types/investment.types';
import { investmentApi } from '@/app/investment/utils/api';

interface InvestmentContextType {
  currentRound: RoundKey;
  setCurrentRound: (round: RoundKey) => void;
  investments: Record<TeamName, Record<StartupKey, number>>;
  teamTotals: Record<TeamName, number>;
  marketCaps: MarketCaps;
  returns: ReturnsData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateInvestment: (
    teamNumber: TeamNumber,
    startup: StartupKey,
    amount: number
  ) => Promise<void>;
  updateTeamTotal: (teamNumber: TeamNumber, amount: number) => Promise<void>;
  updateMarketCap: (startup: StartupKey, amount: number) => Promise<void>;
  generateReturns: (multiplier: number) => Promise<void>;
  resetReturns: () => Promise<void>;
}

// Helper function to create default investments
const createDefaultInvestments = (): Record<TeamName, Record<StartupKey, number>> => {
  return TEAM_NUMBERS.reduce<Record<TeamName, Record<StartupKey, number>>>((acc, teamNum) => {
    const teamName = `team${teamNum}` as TeamName;
    acc[teamName] = { s1: 0, s2: 0, s3: 0, s4: 0 };
    return acc;
  }, {} as Record<TeamName, Record<StartupKey, number>>);
};

// Helper function to create default team totals
const createDefaultTeamTotals = (): Record<TeamName, number> => {
  return TEAM_NUMBERS.reduce<Record<TeamName, number>>((acc, teamNum) => {
    const teamName = `team${teamNum}` as TeamName;
    acc[teamName] = 0;
    return acc;
  }, {} as Record<TeamName, number>);
};

// Helper function to create default returns data
const createDefaultReturns = (): ReturnsData => {
  const defaultReturns: ReturnsData = {
    r1: { s1: 1, s2: 1, s3: 1, s4: 1 },
    r2: { s1: 1, s2: 1, s3: 1, s4: 1 },
    r3: { s1: 1, s2: 1, s3: 1, s4: 1 },
    r4: { s1: 1, s2: 1, s3: 1, s4: 1 },
  };
  return defaultReturns;
};

const defaultContext: InvestmentContextType = {
  currentRound: 'r1',
  setCurrentRound: () => {},
  investments: createDefaultInvestments(),
  teamTotals: createDefaultTeamTotals(),
  marketCaps: { s1: 0, s2: 0, s3: 0, s4: 0 },
  returns: createDefaultReturns(),
  loading: false,
  error: null,
  refreshData: async () => {},
  updateInvestment: async () => {},
  updateTeamTotal: async () => {},
  updateMarketCap: async () => {},
  generateReturns: async () => {},
  resetReturns: async () => {},
};

const InvestmentContext = createContext<InvestmentContextType>(defaultContext);

interface InvestmentProviderProps {
  children: ReactNode;
}

export const InvestmentProvider: React.FC<InvestmentProviderProps> = ({ children }) => {
  const [currentRound, setCurrentRound] = useState<RoundKey>('r1');
  // Initialize state with proper types
  const [investments, setInvestments] = useState<Record<TeamName, Record<StartupKey, number>>>(() => 
    TEAM_NUMBERS.reduce((acc, teamNum) => {
      const teamName = `team${teamNum}` as TeamName;
      acc[teamName] = { s1: 0, s2: 0, s3: 0, s4: 0 };
      return acc;
    }, {} as Record<TeamName, Record<StartupKey, number>>)
  );

  const [teamTotals, setTeamTotals] = useState<Record<TeamName, number>>(() =>
    TEAM_NUMBERS.reduce((acc, teamNum) => {
      const teamName = `team${teamNum}` as TeamName;
      acc[teamName] = 0;
      return acc;
    }, {} as Record<TeamName, number>)
  );
  const [marketCaps, setMarketCaps] = useState<MarketCaps>({ s1: 0, s2: 0, s3: 0, s4: 0 });
  const [returns, setReturns] = useState<ReturnsData>({
    r1: { s1: 1, s2: 1, s3: 1, s4: 1 },
    r2: { s1: 1, s2: 1, s3: 1, s4: 1 },
    r3: { s1: 1, s2: 1, s3: 1, s4: 1 },
    r4: { s1: 1, s2: 1, s3: 1, s4: 1 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would fetch this data from the API
      // For now, we'll use mock data
      
      // Mock investments data with proper typing
      const mockInvestments = TEAM_NUMBERS.reduce<Record<TeamName, Record<StartupKey, number>>>((acc, teamNum) => {
        const teamName = `team${teamNum}` as TeamName;
        acc[teamName] = {
          s1: Math.floor(Math.random() * 10000),
          s2: Math.floor(Math.random() * 10000),
          s3: Math.floor(Math.random() * 10000),
          s4: Math.floor(Math.random() * 10000),
        };
        return acc;
      }, {} as Record<TeamName, Record<StartupKey, number>>);
      
      // Mock team totals with proper typing
      const mockTeamTotals = TEAM_NUMBERS.reduce<Record<TeamName, number>>((acc, teamNum) => {
        const teamName = `team${teamNum}` as TeamName;
        acc[teamName] = 100000; // Default total per team
        return acc;
      }, {} as Record<TeamName, number>);
      
      // Mock market caps with proper MarketCaps type
      const mockMarketCaps: MarketCaps = {
        s1: Math.floor(Math.random() * 1000000),
        s2: Math.floor(Math.random() * 1000000),
        s3: Math.floor(Math.random() * 1000000),
        s4: Math.floor(Math.random() * 1000000)
      };
      
      // Mock returns data
      const mockReturns: ReturnsData = {
        r1: {
          s1: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s2: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s3: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s4: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        },
        r2: {
          s1: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s2: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s3: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s4: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        },
        r3: {
          s1: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s2: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s3: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s4: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        },
        r4: {
          s1: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s2: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s3: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s4: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        },
      };
      
      setInvestments(mockInvestments);
      setTeamTotals(mockTeamTotals);
      setMarketCaps(mockMarketCaps);
      setReturns(mockReturns);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load investment data');
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies since this is just for initial load

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Update investment amount for a team and startup
  const updateInvestment = useCallback(async (
    teamNumber: TeamNumber,
    startup: StartupKey,
    amount: number
  ) => {
    try {
      // In a real app, we would call the API to update the investment
      // await investmentApi.updatePortfolio({
      //   teamNumber,
      //   roundName: ROUND_NAMES[currentRound],
      //   [startup]: amount
      // });
      
      // For now, just update the local state with proper typing
      const teamName = `team${teamNumber}` as TeamName;
      setInvestments(prev => ({
        ...prev,
        [teamName]: {
          ...prev[teamName],
          [startup]: amount,
        },
      }));
      
    } catch (err) {
      console.error('Error updating investment:', err);
      throw new Error('Failed to update investment');
    }
  }, [currentRound]);

  // Update team total
  const updateTeamTotal = useCallback(async (teamNumber: TeamNumber, amount: number) => {
    try {
      // In a real app, we would call the API to update the team total
      // await investmentApi.updateTeamTotal(teamNumber, amount);
      
      // For now, just update the local state with proper typing
      const teamName = `team${teamNumber}` as TeamName;
      setTeamTotals(prev => ({
        ...prev,
        [teamName]: amount,
      }));
      
    } catch (err) {
      console.error('Error updating team total:', err);
      throw new Error('Failed to update team total');
    }
  }, []);

  // Update market cap for a startup
  const updateMarketCap = useCallback(async (startup: StartupKey, amount: number) => {
    try {
      // In a real app, we would call the API to update the market cap
      // await investmentApi.updateMarketCap(startup, amount);
      
      // For now, just update the local state with proper typing
      setMarketCaps(prev => ({
        ...prev,
        [startup]: amount,
      } as MarketCaps));
      
    } catch (err) {
      console.error('Error updating market cap:', err);
      throw new Error('Failed to update market cap');
    }
  }, []);

  // Generate returns for the current round
  const generateReturns = useCallback(async (multiplier: number) => {
    try {
      // In a real app, we would call the API to generate returns
      // const result = await investmentApi.generateReturns(currentRound, multiplier);
      
      // For now, just update the local state with mock returns
      const roundData = {
        s1: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
        s2: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
        s3: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
        s4: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
      };
      
      setReturns(prev => ({
        ...prev,
        [currentRound]: roundData
      }));
      
    } catch (err) {
      console.error('Error generating returns:', err);
      throw new Error('Failed to generate returns');
    }
  }, [currentRound]);

  // Reset returns for the current round
  const resetReturns = useCallback(async () => {
    try {
      // In a real app, we would call the API to reset returns
      // await investmentApi.resetReturns(currentRound);
      
      // For now, just update the local state with default values
      setReturns(prev => ({
        ...prev,
        [currentRound]: { s1: 1, s2: 1, s3: 1, s4: 1 }
      }));
      
    } catch (err) {
      console.error('Error resetting returns:', err);
      throw new Error('Failed to reset returns');
    }
  }, [currentRound]);

  // Context value
  const contextValue: InvestmentContextType = {
    currentRound,
    setCurrentRound,
    investments,
    teamTotals,
    marketCaps,
    returns,
    loading,
    error,
    refreshData,
    updateInvestment,
    updateTeamTotal,
    updateMarketCap,
    generateReturns,
    resetReturns,
  };

  return (
    <InvestmentContext.Provider value={contextValue}>
      {children}
    </InvestmentContext.Provider>
  );
};

export const useInvestment = () => {
  const context = useContext(InvestmentContext);
  if (context === undefined) {
    throw new Error('useInvestment must be used within an InvestmentProvider');
  }
  return context;
};

export default InvestmentContext;
