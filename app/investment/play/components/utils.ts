// Utility functions for investment play components

export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₩0';
  
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

export const getUserRole = (email: string | null | undefined): 'admin' | 'team' | 'unauthorized' => {
  if (!email) return 'unauthorized';
  
  if (email === 'admin@icists.com') {
    return 'admin';
  }
  
  // Check for team1@icists.com ~ team16@icists.com
  const teamPattern = /^team([1-9]|1[0-6])@icists\.com$/;
  if (teamPattern.test(email)) {
    return 'team';
  }
  
  return 'unauthorized';
};

export const extractTeamNumber = (email: string | null | undefined): string | null => {
  if (!email) return null;
  const teamPattern = /^team([1-9]|1[0-6])@icists\.com$/;
  const match = email.match(teamPattern);
  return match ? match[1] : null;
};
