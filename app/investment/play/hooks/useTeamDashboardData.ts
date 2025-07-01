'use client';

import { useState, useEffect } from 'react';

interface TeamData {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  totalCapital: number;
  totalInvested: number;
  remaining: number;
  roundName: string;
  lastUpdated: string;
}

export const useTeamDashboardData = (teamNumber: number, round: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchTeamData = async () => {
    if (!teamNumber) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/investment?round=${round}&team=team${teamNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      
      const data = await response.json();
      setTeamData({
        s1: data.s1 || 0,
        s2: data.s2 || 0,
        s3: data.s3 || 0,
        s4: data.s4 || 0,
        totalCapital: data.totalCapital || 0,
        totalInvested: data.totalInvested || 0,
        remaining: data.remaining || 0,
        roundName: data.roundName || '',
        lastUpdated: data.lastUpdated || new Date().toISOString()
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTeamData();
    
    // Set up auto-refresh every 5 seconds
    const interval = setInterval(fetchTeamData, 5000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [teamNumber, round]);

  const refresh = () => {
    setError(null);
    return fetchTeamData();
  };

  return {
    loading,
    error,
    teamData,
    lastUpdated,
    refresh,
    totalInvested: teamData?.totalInvested || 0,
    remainingCapital: teamData?.remaining || 0,
    totalCapital: teamData?.totalCapital || 0
  };
};

export default useTeamDashboardData;
