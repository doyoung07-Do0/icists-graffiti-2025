'client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart2, TrendingUp } from 'lucide-react';
// Import table components directly
const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-full overflow-auto ${className || ''}`}>
    <table className="w-full caption-bottom text-sm">
      {children}
    </table>
  </div>
);

const TableHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <thead className={className}>{children}</thead>
);

const TableBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tbody className={className}>{children}</tbody>
);

const TableRow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className || ''}`}>
    {children}
  </tr>
);

const TableHead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}>
    {children}
  </th>
);

const TableCell = ({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) => (
  <td 
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    colSpan={colSpan}
  >
    {children}
  </td>
);
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

type StartupKey = 's1' | 's2' | 's3' | 's4';
type RoundKey = 'r1' | 'r2' | 'r3' | 'r4';
type ReturnsData = {
  [key in RoundKey]: {
    [key in StartupKey]: number;
  };
};

const ROUND_NAMES: Record<RoundKey, string> = {
  r1: 'Pre-seed',
  r2: 'Seed',
  r3: 'Series A',
  r4: 'Series B'
};

const ROUND_VALUES: RoundKey[] = ['r1', 'r2', 'r3', 'r4'];

export interface ReturnsSectionProps {
  currentRound: string;
}

export const ReturnsSection = ({ currentRound }: ReturnsSectionProps) => {
  const [returns, setReturns] = useState<ReturnsData>({
    r1: { s1: 1.0, s2: 1.0, s3: 1.0, s4: 1.0 },
    r2: { s1: 1.0, s2: 1.0, s3: 1.0, s4: 1.0 },
    r3: { s1: 1.0, s2: 1.0, s3: 1.0, s4: 1.0 },
    r4: { s1: 1.0, s2: 1.0, s3: 1.0, s4: 1.0 },
  } as const);
  
  const [selectedRound, setSelectedRound] = useState<RoundKey>(currentRound as RoundKey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1.0);

  // Generate mock returns data with proper typing
  const generateMockReturns = useCallback((): ReturnsData => {
    // Define local types for clarity
    type StartupKey = 's1' | 's2' | 's3' | 's4';
    type RoundKey = 'r1' | 'r2' | 'r3' | 'r4';
    
    // Define base returns with all startups at 1.0
    const baseReturns = {
      s1: 1.0,
      s2: 1.0,
      s3: 1.0,
      s4: 1.0,
    };

    // Initialize round data with base returns
    const roundData: Record<RoundKey, Record<StartupKey, number>> = {
      r1: { ...baseReturns },
      r2: { ...baseReturns },
      r3: { ...baseReturns },
      r4: { ...baseReturns },
    };

    // Apply random variation to make it realistic
    const rounds: RoundKey[] = ['r1', 'r2', 'r3', 'r4'];
    const startups: StartupKey[] = ['s1', 's2', 's3', 's4'];
    
    rounds.forEach(round => {
      startups.forEach(startup => {
        // Random multiplier between 0.5 and 2.0, rounded to 2 decimal places
        roundData[round][startup] = parseFloat((0.5 + Math.random() * 1.5).toFixed(2));
      });
    });

    return roundData;
  }, []);

  // Load returns data
  useEffect(() => {
    const loadReturns = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we would fetch this from the API
        // const response = await fetch(`/api/returns?round=${selectedRound}`);
        // const data = await response.json();
        // setReturns(data);
        
        // For now, use mock data
        const mockData = generateMockReturns();
        setReturns(mockData);
      } catch (err) {
        console.error('Error loading returns:', err);
        setError('Failed to load returns data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReturns();
  }, [selectedRound, generateMockReturns]);

  // Handle generate returns
  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setMultiplier(isNaN(value) ? 1.0 : value);
  };

  const handleGenerateReturns = async () => {
    if (isNaN(multiplier) || multiplier <= 0) {
      setError('Please enter a valid multiplier greater than 0');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // In a real app, we would call the API to generate returns
      // await fetch('/api/returns/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ round: selectedRound, multiplier })
      // });
      
      // For now, just update the local state with new random returns
      const newReturns = { ...returns };
      newReturns[selectedRound] = {
        s1: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
        s2: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
        s3: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
        s4: parseFloat((Math.random() * 2 * multiplier + 0.5).toFixed(2)),
      };
      
      setReturns(newReturns);
    } catch (err) {
      console.error('Error generating returns:', err);
      setError('Failed to generate returns');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle reset returns
  const handleResetReturns = async () => {
    if (!window.confirm('Are you sure you want to reset returns for this round? This cannot be undone.')) {
      return;
    }
    
    try {
      // In a real app, we would call the API to reset returns
      // await fetch('/api/returns/reset', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ round: selectedRound })
      // });
      
      // For now, just update the local state
      const newReturns = { ...returns };
      delete newReturns[selectedRound];
      setReturns(newReturns);
    } catch (err) {
      console.error('Error resetting returns:', err);
      setError('Failed to reset returns');
    }
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${(value * 100 - 100).toFixed(0)}%`;
  };

  // Get color class based on return value
  const getReturnColor = (value: number): string => {
    if (value > 1) return 'text-green-400';
    if (value < 1) return 'text-red-400';
    return 'text-gray-300';
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select 
            value={selectedRound} 
            onValueChange={(value: string) => setSelectedRound(value as RoundKey)}
            disabled={isLoading || isGenerating}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select round" />
            </SelectTrigger>
            <SelectContent>
              {ROUND_VALUES.map((round: RoundKey) => (
                <SelectItem key={round} value={round}>
                  {ROUND_NAMES[round]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            step="0.1"
            min="0.1"
            value={multiplier.toString()}
            onChange={handleMultiplierChange}
            className="w-24"
            placeholder="1.0"
            disabled={isGenerating}
          />
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleGenerateReturns}
            disabled={isGenerating || !multiplier}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetReturns}
            disabled={isGenerating}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Returns table */}
      <div className="rounded-md border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Startup</TableHead>
              <TableHead>Return Multiplier</TableHead>
              <TableHead>Return %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading returns data...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  <div className="text-red-500">{error}</div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={handleGenerateReturns}
                    disabled={isGenerating}
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              (['s1', 's2', 's3', 's4'] as const).map((startup: StartupKey) => {
                const value = returns[selectedRound][startup];
                const percentage = formatPercentage(value);
                const colorClass = getReturnColor(value);
                
                return (
                  <TableRow key={startup}>
                    <TableCell className="font-medium">{startup.toUpperCase()}</TableCell>
                    <TableCell>
                      <span className={colorClass}>
                        {value.toFixed(2)}x
                      </span>
                    </TableCell>
                    <TableCell className={colorClass}>
                      {percentage}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">
                Average Return
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {Object.values(returns[selectedRound] || {}).length > 0 
                ? (Object.values(returns[selectedRound]).reduce((a, b) => a + b, 0) / 4).toFixed(2) + 'x'
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">
                Best Performer
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(returns[selectedRound] || {}).length > 0 ? (
              <div>
                <p className="text-xl font-bold text-green-400">
                  {Object.entries(returns[selectedRound])
                    .sort((a, b) => b[1] - a[1])[0][0].toUpperCase()}
                  <span className="text-gray-300 ml-2">
                    {returns[selectedRound][
                      Object.entries(returns[selectedRound])
                        .sort((a, b) => b[1] - a[1])[0][0]
                    ].toFixed(2)}x
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-400">N/A</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">
                Round Status
              </CardTitle>
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {Object.keys(returns[selectedRound] || {}).length > 0 
                ? 'Returns Generated' 
                : 'Pending Generation'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnsSection;
