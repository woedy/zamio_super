import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

export interface OnboardingStatus {
  is_onboarded: boolean;
  onboarding_step: string;
  next_recommended_step: string;
  station_id: string;
  station_name: string;
  // Add other fields as per your API response
}

// Mock data for development
const mockOnboardingStatus: OnboardingStatus = {
  is_onboarded: true,
  onboarding_step: 'done',
  next_recommended_step: 'done',
  station_id: 'mock-station-123',
  station_name: 'Mock Station',
};

const useStationOnboarding = () => {
  const [status, setStatus] = useState<OnboardingStatus | undefined>(
    import.meta.env.DEV ? mockOnboardingStatus : undefined,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (import.meta.env.DEV) {
        console.log('Using mock onboarding status data');
        setStatus(mockOnboardingStatus);
        return mockOnboardingStatus;
      }

      const response = await api.get('/api/v1/station/onboarding/status');
      setStatus(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Error fetching onboarding status:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        url: err?.config?.url,
      });

      if (import.meta.env.DEV) {
        console.warn('API request failed, using mock data as fallback');
        setStatus(mockOnboardingStatus);
        return mockOnboardingStatus;
      }

      setStatus(undefined);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus().catch(() => {
      // error state handled in fetchStatus
    });
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
};

export default useStationOnboarding;
