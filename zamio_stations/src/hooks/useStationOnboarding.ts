import { useQuery } from '@tanstack/react-query';
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
  const {
    data: status,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<OnboardingStatus>({
    queryKey: ['onboardingStatus'],
    queryFn: async () => {
      try {
        // For development, return mock data
        if (import.meta.env.DEV) {
          console.log('Using mock onboarding status data');
          return mockOnboardingStatus;
        }
        
        // For production, use the real API
        const response = await api.get('/api/v1/station/onboarding/status');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching onboarding status:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
        });
        
        // In development, return mock data if the API fails
        if (import.meta.env.DEV) {
          console.warn('API request failed, using mock data as fallback');
          return mockOnboardingStatus;
        }
        
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    status,
    loading,
    error,
    refetch,
  };
};

export default useStationOnboarding;
