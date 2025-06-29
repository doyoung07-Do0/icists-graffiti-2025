import { useState, useEffect, useCallback } from 'react';
import { ROUNDS, STARTUPS, TEAMS } from '../types';

// Type definitions
type PortfolioData = Record<string, Record<string, Record<string, number>>>;
type TeamTotalData = Record<string, Record<string, number>>;
type MarketCapData = Record<string, Record<string, number>>;

interface InvestmentDataResponse {
  portfolios: Record<string, Record<string, string | number>>;
  capitals: Record<string, string | number>;
  marketCaps: Record<string, string | number>;
}

// Initial data generators
const generateInitialPortfolioData = (): PortfolioData => {
  const data: PortfolioData = {};
  ROUNDS.forEach(round => {
    data[round] = {};
    STARTUPS.forEach(startup => {
      data[round][startup] = {};
      TEAMS.forEach(team => {
        data[round][startup][team] = 0;
      });
    });
  });
  return data;
};

const generateInitialTeamTotalData = (): TeamTotalData => {
  const data: TeamTotalData = {};
  ROUNDS.forEach(round => {
    data[round] = {};
    TEAMS.forEach(team => {
      data[round][team] = 1000;
    });
  });
  return data;
};

const generateInitialMarketCapData = (): MarketCapData => {
  const data: MarketCapData = {};
  ROUNDS.forEach(round => {
    data[round] = {};
    TEAMS.forEach(team => {
      data[round][team] = 0;
    });
  });
  return data;
};

export const useInvestmentData = (initialRound = 'Pre-seed', teamName: string | null = null) => {
  const [currentRound, setCurrentRound] = useState<string>(initialRound);
  const [loading, setLoading] = useState(false);

  const [portfolioData, setPortfolioData] = useState<PortfolioData>(generateInitialPortfolioData);
  const [teamTotalData, setTeamTotalData] = useState<TeamTotalData>(generateInitialTeamTotalData);
  const [marketCapData, setMarketCapData] = useState<MarketCapData>(generateInitialMarketCapData);

  const loadData = useCallback(async (round: string) => {
    try {
      setLoading(true);
      const url = teamName 
        ? `/api/investment?round=${encodeURIComponent(round)}&team=${encodeURIComponent(teamName)}` 
        : `/api/investment?round=${encodeURIComponent(round)}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const data: InvestmentDataResponse = await response.json();

        const parsedPortfolios = Object.entries(data.portfolios || {}).reduce((acc, [startup, teams]) => {
          acc[startup] = Object.entries(teams).reduce((teamAcc, [team, value]) => {
            teamAcc[team] = parseInt(String(value), 10) || 0;
            return teamAcc;
          }, {} as Record<string, number>);
          return acc;
        }, {} as Record<string, Record<string, number>>);

        const parsedCapitals = Object.entries(data.capitals || {}).reduce((acc, [team, value]) => {
          acc[team] = parseInt(String(value), 10) || 0;
          return acc;
        }, {} as Record<string, number>);

        const parsedMarketCaps = Object.entries(data.marketCaps || {}).reduce((acc, [team, value]) => {
          acc[team] = parseInt(String(value), 10) || 0;
          return acc;
        }, {} as Record<string, number>);

        setPortfolioData(prev => ({ ...prev, [round]: parsedPortfolios }));
        setTeamTotalData(prev => ({ ...prev, [round]: parsedCapitals }));
        setMarketCapData(prev => ({ ...prev, [round]: parsedMarketCaps }));
      }
    } catch (error) {
      console.error('[useInvestmentData] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [teamName]);

  useEffect(() => {
    loadData(currentRound);
  }, [currentRound, loadData]);

  useEffect(() => {
    if (!teamName) return;

    const handleStorageUpdate = (event: StorageEvent) => {
      if (event.key === 'admin_investment_update' && event.newValue) {
        try {
          const update = JSON.parse(event.newValue);
          if (update.round === currentRound) {
            loadData(currentRound);
          }
        } catch (error) {
          console.error('[useInvestmentData] Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, [currentRound, loadData, teamName]);

  const handleCellChange = (startup: string, team: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10) || 0;
    const teamToUpdate = teamName || team;

    setPortfolioData(prev => ({
      ...prev,
      [currentRound]: {
        ...prev[currentRound],
        [startup]: {
          ...prev[currentRound]?.[startup],
          [teamToUpdate]: numericValue,
        },
      },
    }));
  };

  const savePortfolioChange = async (startup: string, team: string) => {
    const teamToUpdate = teamName || team;
    const numericValue = portfolioData[currentRound]?.[startup]?.[teamToUpdate] ?? 0;

    try {
      const response = await fetch('/api/investment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundName: currentRound,
          teamName: teamToUpdate,
          type: 'portfolio',
          data: { startup: startup, amount: numericValue },
        }),
      });

      if (response.ok) {
        localStorage.setItem('admin_investment_update', JSON.stringify({ round: currentRound, timestamp: Date.now() }));
      } else {
        console.error('Failed to save portfolio data:', await response.text());
      }
    } catch (error) {
      console.error('Error saving portfolio data:', error);
    }
  };

  const handleTeamTotalChange = (team: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10) || 0;
    setTeamTotalData(prev => ({ ...prev, [currentRound]: { ...prev[currentRound], [team]: numericValue } }));
  };

  const saveTeamTotalChange = async (team: string) => {
    const numericValue = teamTotalData[currentRound]?.[team] ?? 0;
    try {
      await fetch('/api/investment', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          roundName: currentRound, 
          teamName: team, 
          type: 'capital', 
          data: { total: numericValue } 
        })
      });
    } catch (error) {
      console.error('Error saving team total:', error);
    }
  };

  const handleMarketCapChange = (team: string, value: string) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10) || 0;
    setMarketCapData(prev => ({ ...prev, [currentRound]: { ...prev[currentRound], [team]: numericValue } }));
  };

  const saveMarketCapChange = async (team: string) => {
    const numericValue = marketCapData[currentRound]?.[team] ?? 0;
    try {
      await fetch('/api/investment', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          roundName: currentRound, 
          teamName: team, 
          type: 'marketCap', 
          data: { marketCap: numericValue } 
        })
      });
    } catch (error) {
      console.error('Error saving market cap:', error);
    }
  };

  const calculateStartupTotal = (startup: string) => {
    const startupData = portfolioData[currentRound]?.[startup] || {};
    return Object.values(startupData).reduce((sum, value) => sum + (Number.isInteger(value) ? value : 0), 0);
  };

  const calculateGrandTotal = () => {
    return STARTUPS.reduce((sum, startup) => sum + calculateStartupTotal(startup), 0);
  };

  const resetPortfolio = async () => {
    if (!confirm('Are you sure you want to reset all portfolio data for this round? This cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/investment/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundName: currentRound })
      });

      if (response.ok) {
        // Reload the data after reset
        await loadData(currentRound);
      } else {
        console.error('Failed to reset portfolio data:', await response.text());
      }
    } catch (error) {
      console.error('Error resetting portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
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
    calculateGrandTotal,
    resetPortfolio
  };
};
