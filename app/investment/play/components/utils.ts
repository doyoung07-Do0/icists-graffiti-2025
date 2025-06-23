// Utility functions for investment play components

export const formatCurrency = (value: number | string, currency: 'KRW' | 'USD' = 'USD'): string => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  if (isNaN(num)) {
    return currency === 'KRW' ? '₩0' : '$0';
  }

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, 
  };

  const locale = currency === 'KRW' ? 'ko-KR' : 'en-US';

  return new Intl.NumberFormat(locale, options).format(num);
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
