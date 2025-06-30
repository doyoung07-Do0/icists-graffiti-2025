import { 
  TeamData, 
  InvestmentFormData, 
  InvestmentApiResponse, 
  TeamNumber, 
  ROUND_NAMES, 
  ROUND_VALUES, 
  STARTUP_KEYS, 
  StartupKey 
} from '../types/investment.types';

const API_BASE_URL = '/api/investment';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

async function fetchWithTimeout(resource: string, options: FetchOptions = {}) {
  const { timeout = 5000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
    });

    clearTimeout(id);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return response;
  } catch (error) {
    clearTimeout(id);
    console.error('API Error:', error);
    throw error;
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const investmentApi = {
  // ===== TEAM OPERATIONS =====
  
  /**
   * Fetch data for a specific team and round
   */
  async getTeamData(round: string, teamNumber?: TeamNumber): Promise<TeamData> {
    const url = teamNumber 
      ? `${API_BASE_URL}?round=${round}&team=${teamNumber}`
      : `${API_BASE_URL}?round=${round}`;
    
    const response = await fetchWithTimeout(url);
    return response.json();
  },

  /**
   * Update team portfolio
   */
  async updatePortfolio(data: InvestmentFormData): Promise<InvestmentApiResponse> {
    const response = await fetchWithTimeout(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        roundName: data.roundName,
        teamName: `team${data.teamNumber}`,
        type: 'portfolio',
        data: {
          s1: data.s1,
          s2: data.s2,
          s3: data.s3,
          s4: data.s4,
        },
      }),
    });

    return response.json();
  },

  /**
   * Update team's total capital
   */
  async updateTeamTotal(teamNumber: TeamNumber, amount: number, round: string): Promise<InvestmentApiResponse> {
    const response = await fetchWithTimeout(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        roundName: round,
        teamName: `team${teamNumber}`,
        type: 'capital',
        data: { total: amount },
      }),
    });

    return response.json();
  },

  // ===== ADMIN OPERATIONS =====
  
  /**
   * Get all teams' data for admin view
   */
  async getAllTeamsData(round: string): Promise<Record<TeamNumber, TeamData>> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin?round=${round}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    return response.json();
  },

  /**
   * Update market cap for a startup
   */
  async updateMarketCap(startup: StartupKey, round: string, value: number): Promise<InvestmentApiResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/market-cap`, {
      method: 'POST',
      body: JSON.stringify({
        roundName: round,
        startup,
        value,
      }),
    });

    return response.json();
  },

  /**
   * Get current market caps
   */
  async getMarketCaps(round: string): Promise<Record<StartupKey, number>> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/market-caps?round=${round}`);
    return response.json();
  },

  // ===== RETURNS MANAGEMENT =====
  
  /**
   * Generate returns for a specific round
   */
  async generateReturns(round: string, multiplier: number): Promise<Record<StartupKey, number>> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/generate-returns`, {
      method: 'POST',
      body: JSON.stringify({
        roundName: round,
        multiplier,
      }),
    });
    
    return response.json();
  },
  
  /**
   * Get returns for a specific round
   */
  async getReturns(round: string): Promise<Record<StartupKey, number>> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/returns?round=${round}`);
    return response.json();
  },
  
  /**
   * Reset returns for a specific round
   */
  async resetReturns(round: string): Promise<void> {
    await fetchWithTimeout(`${API_BASE_URL}/admin/reset-returns`, {
      method: 'POST',
      body: JSON.stringify({ roundName: round }),
    });
  },
  
  // ===== BULK OPERATIONS =====
  
  /**
   * Update multiple investments at once
   */
  async bulkUpdateInvestments(
    updates: Array<{
      teamNumber: TeamNumber;
      startup: StartupKey;
      amount: number;
    }>,
    round: string
  ): Promise<InvestmentApiResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({
        roundName: round,
        updates,
      }),
    });
    
    return response.json();
  },
  
  // ===== AUTHENTICATION =====
  
  /**
   * Verify admin status
   */
  async verifyAdmin(): Promise<{ isAdmin: boolean }> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/admin/verify`);
    return response.json();
  },
  
  // ===== UTILITIES =====
  
  /**
   * Get server time (for syncing)
   */
  async getServerTime(): Promise<{ serverTime: string }> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/time`);
    return response.json();
  },
  
  /**
   * Get application status
   */
  async getStatus(): Promise<{
    status: 'ok' | 'maintenance' | 'updating';
    message?: string;
  }> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/status`);
    return response.json();
  },
};

export default investmentApi;
