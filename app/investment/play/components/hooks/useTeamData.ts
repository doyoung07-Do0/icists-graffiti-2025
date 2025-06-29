import { useState, useEffect, useCallback, useMemo } from 'react';

export type RoundName = 'r1' | 'r2' | 'r3' | 'r4';
export type TeamNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export interface TeamData {
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  remain: number;
  total: number;
}

interface TeamRecord extends TeamData {
  teamNumber: TeamNumber;
  roundName: RoundName;
}

interface UseTeamDataProps {
  initialRound?: RoundName;
  teamNumber?: TeamNumber | null;
}

export interface UseTeamDataReturn {
  currentRound: RoundName;
  setCurrentRound: (round: RoundName) => void;
  loading: boolean;
  teamData: Record<TeamNumber, TeamData>;
  changes: Record<TeamNumber, Partial<TeamData>>;
  hasChanges: boolean;
  changedTeams: TeamNumber[];
  roundNames: Record<RoundName, string>;
  handleCellChange: (teamNumber: TeamNumber, field: keyof TeamData, value: string) => void;
  saveChanges: () => Promise<{ success: boolean; error?: string }>;
  resetTeamChanges: (teamNumber: TeamNumber) => void;
  resetAllChanges: () => Promise<void>;
  getValue: (teamNumber: TeamNumber, field: keyof TeamData) => number;
  reloadData: () => Promise<void>;
  setTeamData: React.Dispatch<React.SetStateAction<Record<TeamNumber, TeamData>>>;
  setChanges: React.Dispatch<React.SetStateAction<Record<TeamNumber, Partial<TeamData>>>>;
}

export const useTeamData = ({
  initialRound = 'r1',
  teamNumber = null 
}: UseTeamDataProps = {}): UseTeamDataReturn => {
  const [currentRound, setCurrentRound] = useState<RoundName>(initialRound);
  const [loading, setLoading] = useState(false);
  const [teamData, setTeamData] = useState<Record<TeamNumber, TeamData>>({} as Record<TeamNumber, TeamData>);
  const [changes, setChanges] = useState<Record<TeamNumber, Partial<TeamData>>>({} as Record<TeamNumber, Partial<TeamData>>);

  // Generate round names for the UI
  const roundNames = useMemo(() => ({
    r1: 'Pre-seed',
    r2: 'Seed',
    r3: 'Series A',
    r4: 'Series B'
  }), []);

  // Load team data
  const loadTeamData = useCallback(async (round: RoundName) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teams?round=${round}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch team data: ${response.statusText}`);
      }
      
      const teamDataResponse = await response.json();
      
      // Transform the API response to our local state format
      const newTeamData = teamDataResponse.reduce((acc: Record<TeamNumber, TeamData>, item: any) => {
        acc[item.teamNumber as TeamNumber] = {
          s1: item.s1 || 0,
          s2: item.s2 || 0,
          s3: item.s3 || 0,
          s4: item.s4 || 0,
          remain: item.remain || 0,
          total: item.total || 0,
        };
        return acc;
      }, {} as Record<TeamNumber, TeamData>);
      
      // Ensure we have entries for all 16 teams
      for (let i = 1; i <= 16; i++) {
        const teamNum = i as TeamNumber;
        if (!newTeamData[teamNum]) {
          newTeamData[teamNum] = {
            s1: 0,
            s2: 0,
            s3: 0,
            s4: 0,
            remain: 0,
            total: 0,
          };
        }
      }
      
      setTeamData(newTeamData);
      setChanges({} as Record<TeamNumber, Partial<TeamData>>);
    } catch (error) {
      console.error('Error loading team data:', error);
      // Initialize with empty data if there's an error
      const emptyData = {} as Record<TeamNumber, TeamData>;
      for (let i = 1; i <= 16; i++) {
        emptyData[i as TeamNumber] = {
          s1: 0,
          s2: 0,
          s3: 0,
          s4: 0,
          remain: 0,
          total: 0,
        };
      }
      setTeamData(emptyData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle cell changes
  const handleCellChange = useCallback((
    teamNumber: TeamNumber, 
    field: keyof TeamData, 
    value: string
  ) => {
    const numericValue = value === '' ? 0 : parseInt(value, 10) || 0;
    
    setChanges(prevChanges => {
      const updatedChanges = {
        ...prevChanges,
        [teamNumber]: {
          ...prevChanges[teamNumber],
          [field]: numericValue
        }
      };
      
      // If s1-s4 or total is changed, we'll update remain in the effect
      // to ensure it's always calculated correctly
      return updatedChanges;
    });
  }, []);

  // Reset changes for a specific team
  const resetTeamChanges = useCallback((teamNumber: TeamNumber) => {
    setChanges(prevChanges => {
      const newChanges = { ...prevChanges };
      delete newChanges[teamNumber];
      return Object.keys(newChanges).length > 0 ? newChanges : {} as Record<TeamNumber, Partial<TeamData>>;
    });
  }, []);

  // Save changes to the server
  const saveChanges = useCallback(async () => {
    if (Object.keys(changes).length === 0) return { success: true };

    try {
      setLoading(true);
      const updates = Object.entries(changes).map(([teamNum, teamChanges]) => ({
        teamNumber: parseInt(teamNum, 10) as TeamNumber,
        roundName: currentRound,
        ...teamData[parseInt(teamNum, 10) as TeamNumber],
        ...teamChanges
      }));

      const response = await fetch('/api/teams/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        // Refresh data after successful update
        await loadTeamData(currentRound);
        setChanges({} as Record<TeamNumber, Partial<TeamData>>);
        return { success: true };
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving team data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save changes'
      };
    } finally {
      setLoading(false);
    }
  }, [changes, currentRound, loadTeamData, teamData]);

  // Create empty team data object
  const getEmptyTeamData = useCallback(() => {
    const emptyData: Record<TeamNumber, TeamData> = {} as Record<TeamNumber, TeamData>;
    for (let i = 1; i <= 16; i++) {
      const teamNum = i as TeamNumber;
      emptyData[teamNum] = {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        remain: 0,
        total: 0,
      };
    }
    return emptyData;
  }, []);

  // Calculate remain based on total and sum of s1-s4
  const calculateRemain = useCallback((data: TeamData) => {
    const sum = data.s1 + data.s2 + data.s3 + data.s4;
    return Math.max(0, (data.total || 0) - sum);
  }, []);

  // Update remain whenever s1-s4 or total changes
  useEffect(() => {
    const updatedChanges = { ...changes } as Record<TeamNumber, Partial<TeamData>>;
    let hasUpdates = false;

    Object.entries(changes).forEach(([teamNum, teamChanges]) => {
      // Skip if we're already updating remain for this team
      if (teamChanges && 'remain' in teamChanges) return;
      
      const teamNumTyped = parseInt(teamNum) as TeamNumber;
      const currentData = { ...teamData[teamNumTyped], ...teamChanges };
      const newRemain = calculateRemain(currentData);
      
      if (currentData.remain !== newRemain) {
        updatedChanges[teamNumTyped] = {
          ...teamChanges,
          remain: newRemain
        };
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      setChanges(updatedChanges);
    }
  }, [changes, teamData, calculateRemain]);

  // Reset all teams to default values (s1-s4=0, total=1000, remain=1000)
  const resetAllChanges = useCallback(async () => {
    const resetData = {} as Record<TeamNumber, TeamData>;
    const resetChanges = {} as Record<TeamNumber, Partial<TeamData>>;
    
    // Prepare the reset data for all teams
    for (let i = 1; i <= 16; i++) {
      const teamNum = i as TeamNumber;
      resetData[teamNum] = {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        remain: 1000,
        total: 1000
      };
      
      resetChanges[teamNum] = {
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        remain: 1000,
        total: 1000
      };
    }
    
    // Update local state
    setTeamData(resetData);
    setChanges(resetChanges);
    
    // Save to database
    try {
      const response = await fetch('/api/teams/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          Object.entries(resetChanges).map(([teamNum, data]) => ({
            teamNumber: parseInt(teamNum) as TeamNumber,
            roundName: currentRound,
            ...data
          }))
        )
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset team data');
      }
      
      // Reload data to ensure consistency
      
    } catch (error) {
      console.error('Error resetting team data:', error);
      // Reload the current data if reset fails
      await loadTeamData(currentRound);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentRound, loadTeamData]);

  // Initialize with empty data
  useEffect(() => {
    setTeamData(getEmptyTeamData());
  }, [getEmptyTeamData]);

  // Load data when round changes
  useEffect(() => {
    loadTeamData(currentRound);
  }, [currentRound, loadTeamData]);

  // Initial load
  useEffect(() => {
    loadTeamData(currentRound);
  }, [loadTeamData, currentRound]);

  // Get the effective value (changed or original)
  const getValue = useCallback((teamNumber: TeamNumber, field: keyof TeamData) => {
    return changes[teamNumber]?.[field] !== undefined
      ? changes[teamNumber][field]!
      : teamData[teamNumber]?.[field] || 0;
  }, [changes, teamData]);

  // Check if there are any unsaved changes
  const hasChanges = useMemo(() => {
    return Object.keys(changes).length > 0;
  }, [changes]);

  // Get changed teams
  const changedTeams = useMemo(() => {
    return Object.keys(changes).map(Number) as TeamNumber[];
  }, [changes]);

  return {
    // State
    currentRound,
    setCurrentRound,
    loading,
    teamData,
    changes,
    hasChanges: Object.keys(changes).length > 0,
    changedTeams,
    roundNames,
    
    // Methods
    handleCellChange,
    saveChanges,
    resetTeamChanges,
    resetAllChanges,
    getValue,
    reloadData: () => loadTeamData(currentRound),
    setTeamData,
    setChanges,
  };
};
