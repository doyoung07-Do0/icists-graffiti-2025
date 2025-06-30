'client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';
import { ROUND_NAMES, ROUND_VALUES, TeamNumber, TEAM_NUMBERS } from '../../../../types/investment.types';
import { InvestmentTable } from '../investments/InvestmentTable';
import { ReturnsSection } from '../returns/ReturnsSection';

export const AdminDashboard = () => {
  const [currentRound, setCurrentRound] = useState<typeof ROUND_VALUES[number]>(ROUND_VALUES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Handle saving changes
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Handle refreshing data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Investment Dashboard
          </h1>
          <p className="text-gray-400">
            Manage team investments and track performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={currentRound}
            onChange={(e) => setCurrentRound(e.target.value as any)}
            className="rounded-md border-gray-600 bg-gray-700 text-white text-sm focus:ring-blue-500 focus:border-blue-500 h-10 px-3"
          >
            {ROUND_VALUES.map((round) => (
              <option key={round} value={round}>
                {ROUND_NAMES[round]}
              </option>
            ))}
          </select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Round</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {ROUND_NAMES[currentRound]}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {TEAM_NUMBERS.length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">
              {TEAM_NUMBERS.length * 4} {/* 4 startups per team */}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Team Investments</CardTitle>
          <p className="text-sm text-gray-400">
            View and manage investments for each team
          </p>
        </CardHeader>
        <CardContent>
          <InvestmentTable currentRound={currentRound} />
        </CardContent>
      </Card>

      {/* Returns Section */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle>Investment Returns</CardTitle>
          <p className="text-sm text-gray-400">
            Track and manage investment returns
          </p>
        </CardHeader>
        <CardContent>
          <ReturnsSection currentRound={currentRound} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
