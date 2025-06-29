import { useState, useEffect, useCallback } from 'react';

export interface TeamDashboardData {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  remain: number;
  total: number;
  teamNumber: number;
  roundName: string;
  updatedAt: string;
}

export const useTeamDashboardData = (teamNumber: number, round: string = 'r1') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamDashboardData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTeamData = useCallback(async () => {
    if (!teamNumber) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teams?round=${round}&team=${teamNumber}`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team data: ${response.statusText}`);
      }
      
      const data = await response.json();
      if (data && data.length > 0) {
        setTeamData(data[0]);
      } else {
        // If no data exists, create a default entry
        setTeamData({
          s1: 0,
          s2: 0,
          s3: 0,
          s4: 0,
          remain: 3000, // Default starting capital
          total: 3000,  // Default starting capital
          teamNumber,
          roundName: round,
          updatedAt: new Date().toISOString(),
        });
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, [teamNumber, round]);

  // Initial fetch
  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTeamData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchTeamData]);

  const totalInvested = teamData 
    ? (teamData.s1 || 0) + (teamData.s2 || 0) + (teamData.s3 || 0) + (teamData.s4 || 0)
    : 0;

  const remainingCapital = teamData ? teamData.remain : 0;
  const totalCapital = teamData ? teamData.total : 0;

  return {
    loading,
    error,
    teamData,
    lastUpdated,
    totalInvested,
    remainingCapital,
    totalCapital,
    refresh: fetchTeamData,
  };
};
