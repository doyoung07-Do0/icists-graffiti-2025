'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useReturns } from '../hooks/useReturns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ROUND_NAMES: Record<string, string> = {
  r1: 'Pre-seed',
  r2: 'Seed',
  r3: 'Series A',
  r4: 'Series B',
};

const STARTUP_NAMES: Record<string, string> = {
  s1_return: 'Startup 1',
  s2_return: 'Startup 2',
  s3_return: 'Startup 3',
  s4_return: 'Startup 4',
};

export function ReturnsSection() {
  const { returns, loading, error, generating, generateReturns, getReturnsForRound } = useReturns();

  const handleGenerate = async (round: string) => {
    try {
      await generateReturns(round);
      toast.success(`Returns generated for ${ROUND_NAMES[round]}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate returns');
    }
  };

  const formatReturn = (value: number) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  const getReturnColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-foreground';
  };

  if (loading) {
    return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Startup Returns</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(ROUND_NAMES).map(([roundKey, roundName]) => {
          const roundReturns = getReturnsForRound(roundKey);
          const isGenerating = generating;
          
          return (
            <Card key={roundKey}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{roundName}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(roundKey)}
                    disabled={!!roundReturns || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : roundReturns ? (
                      'Generated'
                    ) : (
                      '수익률 뽑기'
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {roundReturns ? (
                  <div className="space-y-2">
                    {Object.entries(roundReturns)
                      .filter(([key]) => key.endsWith('_return') && roundReturns[key as keyof typeof roundReturns] !== null)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{STARTUP_NAMES[key] || key}:</span>
                          <span className={getReturnColor(Number(value) || 0)}>
                            {formatReturn(Number(value) || 0)}
                          </span>
                        </div>
                      ))}
                    <div className="text-xs text-muted-foreground mt-2">
                      Generated on {new Date(roundReturns.createdAt).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click the button to generate returns for this round.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
