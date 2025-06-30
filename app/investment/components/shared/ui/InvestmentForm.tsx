import { useState, useEffect } from 'react';
import { TeamData, StartupKey } from '../../../types/investment.types';

interface InvestmentFormProps {
  initialData?: Partial<TeamData>;
  onSubmit: (data: Record<StartupKey, number>) => Promise<{ success: boolean; error?: string }>;
  disabled?: boolean;
  submitButtonText?: string;
  showRemaining?: boolean;
  className?: string;
}

export const InvestmentForm = ({
  initialData = { s1: 0, s2: 0, s3: 0, s4: 0, remain: 0 },
  onSubmit,
  disabled = false,
  submitButtonText = 'Save Changes',
  showRemaining = true,
  className = '',
}: InvestmentFormProps) => {
  const [values, setValues] = useState({
    s1: initialData.s1 || 0,
    s2: initialData.s2 || 0,
    s3: initialData.s3 || 0,
    s4: initialData.s4 || 0,
  });
  
  const [remaining, setRemaining] = useState(initialData.remain || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData.remain !== undefined) {
      setRemaining(initialData.remain);
    }
  }, [initialData.remain]);

  const handleChange = (key: StartupKey, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
    setValues(prev => ({
      ...prev,
      [key]: numValue,
    }));
  };

  const calculateRemaining = (): number => {
    if (!initialData.total) return 0;
    const totalInvested = Object.values(values).reduce((sum, val) => sum + (val || 0), 0);
    return Math.max(0, (initialData.total || 0) - totalInvested);
  };

  useEffect(() => {
    setRemaining(calculateRemaining());
  }, [values]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (disabled) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await onSubmit(values);
      if (result.success) {
        setSuccess(true);
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to save changes');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startupLabels: Record<StartupKey, string> = {
    s1: 'Startup 1',
    s2: 'Startup 2',
    s3: 'Startup 3',
    s4: 'Startup 4',
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(values) as StartupKey[]).map((key) => (
          <div key={key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
              {startupLabels[key]}
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                min="0"
                value={values[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={disabled || isSubmitting}
                className="block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:opacity-50"
              />
            </div>
          </div>
        ))}
      </div>

      {showRemaining && (
        <div className="pt-2">
          <p className="text-sm text-gray-400">
            Remaining: <span className="font-medium">${remaining.toLocaleString()}</span>
          </p>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={disabled || isSubmitting || remaining < 0}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            disabled || isSubmitting || remaining < 0
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-900/30 p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-900/30 p-4">
          <p className="text-sm text-green-300">Changes saved successfully!</p>
        </div>
      )}
    </form>
  );
};

export default InvestmentForm;
