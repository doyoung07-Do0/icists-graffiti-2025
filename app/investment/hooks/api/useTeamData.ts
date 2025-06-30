import { useState, useEffect, useCallback } from 'react';
import { TeamData, RoundName, TeamNumber } from '../../types/investment.types';
import { investmentApi } from '../../utils/api';

interface UseTeamDataProps {
  teamNumber?: TeamNumber;
  initialRound?: RoundName;
}

export const useTeamData = ({ teamNumber, initialRound = 'r1' }: UseTeamDataProps = {}) => {
  const [currentRound, setCurrentRound] = useState<RoundName>(initialRound);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTeamData = useCallback(async () => {
    if (!teamNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await investmentApi.getTeamData(currentRound, teamNumber);
      setTeamData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, [currentRound, teamNumber]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const updatePortfolio = async (formData: Omit<TeamData, 'teamNumber' | 'roundName' | 'updatedAt'>) => {
    if (!teamNumber || !teamData) return { success: false, error: 'Team data not loaded' };
    
    try {
      const response = await investmentApi.updatePortfolio({
        ...formData,
        teamNumber,
        roundName: currentRound,
      });
      
      if (response.success) {
        await fetchTeamData(); // Refresh data after successful update
      }
      
      return response;
    } catch (err) {
      console.error('Error updating portfolio:', err);
      return { success: false, error: 'Failed to update portfolio' };
    }
  };

  const refreshData = () => {
    return fetchTeamData();
  };

  return {
    // State
    currentRound,
    teamData,
    loading,
    error,
    lastUpdated,
    
    // Actions
    setCurrentRound,
    updatePortfolio,
    refreshData,
  };
};
