import { 
  TeamData, 
  InvestmentFormData, 
  InvestmentApiResponse, 
  TeamNumber 
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
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const investmentApi = {
  /**
   * Fetch data for a specific team and round
   */
  async getTeamData(round: string, teamNumber?: TeamNumber): Promise<TeamData> {
    const url = teamNumber 
      ? `${API_BASE_URL}?round=${round}&team=${teamNumber}`
      : `${API_BASE_URL}?round=${round}`;
      
    const response = await fetchWithTimeout(url, { credentials: 'include' });
    return handleResponse<TeamData>(response);
  },

  /**
   * Update team portfolio
   */
  async updatePortfolio(data: InvestmentFormData): Promise<InvestmentApiResponse> {
    const response = await fetchWithTimeout(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify({
        roundName: data.roundName,
        teamNumber: data.teamNumber,
        type: 'portfolio',
        data: {
          s1: data.s1 || 0,
          s2: data.s2 || 0,
          s3: data.s3 || 0,
          s4: data.s4 || 0,
        },
      }),
      credentials: 'include',
    });

    return handleResponse<InvestmentApiResponse>(response);
  },
};

export default investmentApi;
