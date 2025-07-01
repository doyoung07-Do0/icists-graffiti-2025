'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from './utils';

interface TeamData {
  id: number;
  name: string;
  totalCapital: number;
  totalInvested: number;
  remaining: number;
  lastUpdated: string;
}

export default function AdminDashboard() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState('r1');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const rounds = [
    { id: 'r1', name: 'Pre-seed' },
    { id: 'r2', name: 'Seed' },
    { id: 'r3', name: 'Series A' },
    { id: 'r4', name: 'Series B' },
  ];

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      // Fetch all teams data
      const response = await fetch(`/api/teams?round=${selectedRound}`);
      if (!response.ok) throw new Error('Failed to fetch team data');
      
      const data = await response.json();
      setTeams(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    const interval = setInterval(fetchTeamData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [selectedRound]);

  const handleRoundChange = (round: string) => {
    setSelectedRound(round);
  };

  // Calculate totals
  const totalCapital = teams.reduce((sum, team) => sum + team.totalCapital, 0);
  const totalInvested = teams.reduce((sum, team) => sum + team.totalInvested, 0);
  const totalRemaining = teams.reduce((sum, team) => sum + team.remaining, 0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedRound}
              onChange={(e) => handleRoundChange(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  {round.name}
                </option>
              ))}
            </select>
            <button
              onClick={fetchTeamData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg disabled:opacity-50 flex items-center"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Capital</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalCapital)}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Invested</h3>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Total Remaining</h3>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRemaining)}</p>
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Capital
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Invested
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Remaining
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-800/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      Team {team.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                      {formatCurrency(team.totalCapital)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-blue-400">
                      {formatCurrency(team.totalInvested)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-400">
                      {formatCurrency(team.remaining)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
                      {new Date(team.lastUpdated).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last updated */}
        <div className="mt-4 text-right text-sm text-gray-500">
          Last updated: {lastUpdated}
        </div>
      </div>
    </div>
  );
}
