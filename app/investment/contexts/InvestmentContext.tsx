'client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ROUND_VALUES, ROUND_NAMES, TeamNumber, TEAM_NUMBERS, STARTUP_KEYS, StartupKey } from '../../types/investment.types';
import { investmentApi } from '../utils/api';

interface InvestmentContextType {
  currentRound: typeof ROUND_VALUES[number];
  setCurrentRound: (round: typeof ROUND_VALUES[number]) => void;
  investments: {
    [key: string]: { [key in StartupKey]: number };
  };
  teamTotals: { [key: string]: number };
  marketCaps: { [key: string]: number };
  returns: { [key: string]: { [key: string]: number } };
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

const defaultContext: InvestmentContextType = {
  currentRound: ROUND_VALUES[0],
  setCurrentRound: () => {},
  investments: {},
  teamTotals: {},
  marketCaps: {},
  returns: {},
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

export const InvestmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRound, setCurrentRound] = useState<typeof ROUND_VALUES[number]>(ROUND_VALUES[0]);
  const [investments, setInvestments] = useState<{
    [key: string]: { [key in StartupKey]: number };
  }>({});
  const [teamTotals, setTeamTotals] = useState<{ [key: string]: number }>({});
  const [marketCaps, setMarketCaps] = useState<{ [key: string]: number }>({});
  const [returns, setReturns] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, we would fetch this data from the API
      // For now, we'll use mock data
      
      // Mock investments data
      const mockInvestments = TEAM_NUMBERS.reduce((acc, teamNum) => {
        acc[`team${teamNum}`] = {
          s1: Math.floor(Math.random() * 10000),
          s2: Math.floor(Math.random() * 10000),
          s3: Math.floor(Math.random() * 10000),
          s4: Math.floor(Math.random() * 10000),
        };
        return acc;
      }, {} as { [key: string]: { [key in StartupKey]: number } });
      
      // Mock team totals
      const mockTeamTotals = TEAM_NUMBERS.reduce((acc, teamNum) => {
        acc[`team${teamNum}`] = 100000; // Default total per team
        return acc;
      }, {} as { [key: string]: number });
      
      // Mock market caps
      const mockMarketCaps = STARTUP_KEYS.reduce((acc, key) => {
        acc[key] = Math.floor(Math.random() * 1000000);
        return acc;
      }, {} as { [key: string]: number });
      
      // Mock returns data
      const mockReturns = ROUND_VALUES.reduce((roundAcc, round) => {
        roundAcc[round] = {
          s1: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s2: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s3: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
          s4: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        };
        return roundAcc;
      }, {} as { [key: string]: { [key: string]: number } });
      
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
      
      // For now, just update the local state
      setInvestments(prev => ({
        ...prev,
        [`team${teamNumber}`]: {
          ...prev[`team${teamNumber}`],
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
      
      // For now, just update the local state
      setTeamTotals(prev => ({
        ...prev,
        [`team${teamNumber}`]: amount,
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
      
      // For now, just update the local state
      setMarketCaps(prev => ({
        ...prev,
        [startup]: amount,
      }));
      
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
      setReturns(prev => ({
        ...prev,
        [currentRound]: {
          s1: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
          s2: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
          s3: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
          s4: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
        },
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
      
      // For now, just update the local state
      setReturns(prev => {
        const newReturns = { ...prev };
        delete newReturns[currentRound];
        return newReturns;
      });
      
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
