import { useState, useCallback, useEffect } from 'react';
import { StartupReturns } from '@/lib/db/schema';

export function useReturns() {
  const [returns, setReturns] = useState<StartupReturns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/returns');
      if (!response.ok) {
        throw new Error('Failed to fetch returns');
      }
      const data = await response.json();
      setReturns(data);
    } catch (err) {
      console.error('Error fetching returns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReturns = useCallback(async (roundName: string) => {
    try {
      setGenerating(true);
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roundName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate returns');
      }

      const newReturn = await response.json();
      setReturns(prev => [...prev, newReturn]);
      return newReturn;
    } catch (err) {
      console.error('Error generating returns:', err);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const getReturnsForRound = useCallback((roundName: string) => {
    return returns.find(r => r.roundName === roundName);
  }, [returns]);

  const resetReturns = useCallback(async (roundName?: string) => {
    try {
      setGenerating(true);
      const url = roundName 
        ? `/api/returns?round=${encodeURIComponent(roundName)}`
        : '/api/returns';
      
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset returns');
      }

      // Refresh the returns data
      await fetchReturns();
      return { success: true };
    } catch (err) {
      console.error('Error resetting returns:', err);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [fetchReturns]);

  return {
    returns,
    loading,
    error,
    generating,
    generateReturns,
    resetReturns,
    getReturnsForRound,
    refreshReturns: fetchReturns,
  };
}
