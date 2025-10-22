import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import axios from 'axios';
import {
  fetchArtistOnboardingStatus,
  type ArtistOnboardingStatus,
} from '../../../lib/api';

interface ArtistOnboardingContextValue {
  status: ArtistOnboardingStatus | null;
  loading: boolean;
  error: string | null;
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  refreshStatus: () => Promise<ArtistOnboardingStatus | null>;
}

const ArtistOnboardingContext = createContext<ArtistOnboardingContextValue | undefined>(undefined);

const defaultErrorMessage = 'We were unable to load your onboarding progress. Please try again shortly.';

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const response = error.response?.data as {
      message?: string;
      detail?: string;
      errors?: Record<string, unknown>;
    } | undefined;

    if (response?.message && typeof response.message === 'string') {
      return response.message;
    }

    if (response?.detail && typeof response.detail === 'string') {
      return response.detail;
    }

    if (response?.errors && typeof response.errors === 'object') {
      const firstError = Object.values(response.errors)[0];
      if (Array.isArray(firstError) && typeof firstError[0] === 'string') {
        return firstError[0];
      }
    }

    return error.message || defaultErrorMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return defaultErrorMessage;
};

interface ArtistOnboardingProviderProps {
  artistId: string;
  initialStep?: string | null;
  children: ReactNode;
}

export const ArtistOnboardingProvider = ({
  artistId,
  initialStep = null,
  children,
}: ArtistOnboardingProviderProps) => {
  const [status, setStatus] = useState<ArtistOnboardingStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStepState] = useState<string | null>(initialStep);

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const envelope = await fetchArtistOnboardingStatus(artistId);
      const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
      setStatus(nextStatus);
      return nextStatus;
    } catch (err) {
      const message = resolveErrorMessage(err);
      setError(message);
      setStatus(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    let isActive = true;

    const loadStatus = async () => {
      setLoading(true);
      setError(null);

      try {
        const envelope = await fetchArtistOnboardingStatus(artistId);
        if (!isActive) {
          return;
        }
        const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
        setStatus(nextStatus);
      } catch (err) {
        if (!isActive) {
          return;
        }
        const message = resolveErrorMessage(err);
        setError(message);
        setStatus(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadStatus();

    return () => {
      isActive = false;
    };
  }, [artistId]);

  useEffect(() => {
    setCurrentStepState(initialStep ?? null);
  }, [initialStep]);

  useEffect(() => {
    if (currentStep) {
      return;
    }

    const nextSuggestedStep = status?.next_step || status?.onboarding_step || null;
    if (nextSuggestedStep) {
      setCurrentStepState(nextSuggestedStep);
    }
  }, [status, currentStep]);

  const setCurrentStep = useCallback((step: string | null) => {
    setCurrentStepState(step);
  }, []);

  const value = useMemo<ArtistOnboardingContextValue>(
    () => ({
      status,
      loading,
      error,
      currentStep,
      setCurrentStep,
      refreshStatus,
    }),
    [status, loading, error, currentStep, setCurrentStep, refreshStatus],
  );

  return <ArtistOnboardingContext.Provider value={value}>{children}</ArtistOnboardingContext.Provider>;
};

export const useArtistOnboarding = () => {
  const context = useContext(ArtistOnboardingContext);
  if (!context) {
    throw new Error('useArtistOnboarding must be used within an ArtistOnboardingProvider');
  }
  return context;
};

