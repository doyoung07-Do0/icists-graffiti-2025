'use client';

import { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUND_NAMES, ROUND_VALUES, TeamNumber } from '../../types/investment.types';
import { useTeamData } from '../../hooks/api/useTeamData';
import { InvestmentForm } from '../shared/ui/InvestmentForm';

export interface TeamDashboardProps {
  userEmail?: string | null;
}

export const TeamDashboard = ({ userEmail }: TeamDashboardProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const email = userEmail || session?.user?.email;
  
  // Extract team number from email (e.g., "team1@example.com" -> 1)
  const teamNumber = useMemo<TeamNumber | undefined>(() => {
    if (!email) return undefined;
    const match = email.match(/team(\d+)/i);
    return match ? (parseInt(match[1], 10) as TeamNumber) : undefined;
  }, [email]);

  const [currentRound, setCurrentRound] = useState(ROUND_VALUES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { 
    teamData, 
    loading, 
    error, 
    updatePortfolio, 
    refreshData 
  } = useTeamData({ 
    teamNumber: teamNumber as TeamNumber | undefined,
    initialRound: currentRound
  });

  // Handle form submission
  const handleSubmit = useCallback(async (values: Record<string, number>) => {
    if (!teamNumber) return { success: false, error: 'Team number not found' };
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const result = await updatePortfolio({
        ...values,
        remain: teamData?.remain || 0,
        total: teamData?.total || 0,
      });
      
      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setSubmitError(result.error || 'Failed to update portfolio');
      }
      
      return result;
    } catch (err) {
      console.error('Error updating portfolio:', err);
      setSubmitError('An error occurred while updating your portfolio');
      return { success: false, error: 'An error occurred' };
    } finally {
      setIsSubmitting(false);
    }
  }, [teamNumber, teamData, updatePortfolio]);

  // Redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    router.push('/api/auth/signin');
    return null;
  }

  if (!teamNumber) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-300">
            Your account ({email}) is not associated with a valid team.
            Please contact the administrator for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Team {teamNumber} Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your investment portfolio for the current round
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="round-select" className="text-sm font-medium text-gray-300">
            Round:
          </label>
          <select
            id="round-select"
            value={currentRound}
            onChange={(e) => setCurrentRound(e.target.value as any)}
            className="rounded-md border-gray-600 bg-gray-700 text-white text-sm focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          >
            {ROUND_VALUES.map((round) => (
              <option key={round} value={round}>
                {ROUND_NAMES[round]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${teamData?.total?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">
              ${teamData?.remain?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Current Round</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {ROUND_NAMES[currentRound]}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Form */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl">Update Portfolio</CardTitle>
          <p className="text-sm text-gray-400">
            Allocate your investment across different startups
          </p>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <p className="text-red-300">Error loading portfolio data: {error}</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : teamData ? (
            <>
              <InvestmentForm
                initialData={teamData}
                onSubmit={handleSubmit}
                disabled={isSubmitting}
                submitButtonText={isSubmitting ? 'Saving...' : 'Update Portfolio'}
                showRemaining={true}
              />
              
              {submitSuccess && (
                <div className="mt-4 p-3 bg-green-900/30 border border-green-700 rounded-md">
                  <p className="text-green-300 text-sm">Portfolio updated successfully!</p>
                </div>
              )}
              
              {submitError && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-md">
                  <p className="text-red-300 text-sm">{submitError}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400">No portfolio data available for this round.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Last Updated */}
      <div className="text-right">
        <p className="text-xs text-gray-500">
          {loading ? 'Loading...' : `Last updated: ${new Date().toLocaleString()}`}
        </p>
      </div>
    </div>
  );
};

export default TeamDashboard;
