import { useStationOnboardingContext } from '../contexts/StationOnboardingContext';

const useStationOnboarding = () => {
  const { status, details, loading, error, refresh } = useStationOnboardingContext();

  return {
    status,
    details,
    loading,
    error,
    refresh,
  };
};

export default useStationOnboarding;
