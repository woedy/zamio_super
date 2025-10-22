import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchArtistOnboardingStatus,
  completeArtistOnboarding,
  skipArtistOnboardingStep,
  deriveNextArtistOnboardingStep,
  type ApiEnvelope,
  type ArtistOnboardingStatus,
} from '../../../lib/api';

interface ArtistOnboardingContextValue {
  artistId: string;
  status: ArtistOnboardingStatus | null;
  loading: boolean;
  error: string | null;
  currentStep: string;
  setCurrentStep: (step: string) => void;
  refresh: () => Promise<void>;
  applyEnvelope: (payload: ApiEnvelope<ArtistOnboardingStatus>) => void;
  skipStep: (step: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const ArtistOnboardingContext = createContext<ArtistOnboardingContextValue | undefined>(undefined);

const normalizeStatus = (payload?: ArtistOnboardingStatus | null): ArtistOnboardingStatus | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const kycDocuments = Array.isArray(payload?.kyc?.documents)
    ? payload?.kyc?.documents ?? []
    : [];

  const progress = {
    profile_completed: false,
    social_media_added: false,
    payment_info_added: false,
    publisher_added: false,
    track_uploaded: false,
    kyc_submitted: kycDocuments.length > 0,
    kyc_verified: payload?.kyc?.status === 'verified',
    ...(payload.onboarding_progress ?? {}),
    ...(payload.progress ?? {}),
  } as ArtistOnboardingStatus['progress'];

  if (progress.kyc_submitted !== true) {
    progress.kyc_submitted = kycDocuments.length > 0;
  }
  if (progress.kyc_verified !== true && payload?.kyc?.status === 'verified') {
    progress.kyc_verified = true;
  }

  const derivedNext = deriveNextArtistOnboardingStep({
    next_step: payload.next_step,
    onboarding_step: payload.onboarding_step,
    next_recommended_step: payload.next_recommended_step,
  });

  const nextStep = derivedNext
    ?? (typeof payload.next_step === 'string' && payload.next_step.length > 0
      ? payload.next_step
      : typeof payload.onboarding_step === 'string'
        ? payload.onboarding_step
        : 'profile');

  return {
    ...payload,
    progress,
    next_step: nextStep === 'track' ? 'done' : nextStep,
  };
};

interface ArtistOnboardingProviderProps {
  artistId: string;
  initialStep?: string;
  children: ReactNode;
}

export const ArtistOnboardingProvider = ({
  artistId,
  initialStep = 'profile',
  children,
}: ArtistOnboardingProviderProps) => {
  const [status, setStatus] = useState<ArtistOnboardingStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStepState] = useState<string>(initialStep);

  const setCurrentStep = useCallback((step: string) => {
    if (!step) return;
    setCurrentStepState(step);
  }, []);

  const applyEnvelope = useCallback(
    (payload: ApiEnvelope<ArtistOnboardingStatus>) => {
      const nextStatus = normalizeStatus(payload?.data);
      if (!nextStatus) {
        return;
      }

      setStatus(prev => ({
        ...prev,
        ...nextStatus,
        progress: {
          ...(prev?.progress ?? {}),
          ...(nextStatus.progress ?? {}),
        },
      }));

      setCurrentStepState(prev => {
        const proposed = nextStatus.next_step ?? nextStatus.onboarding_step ?? prev;
        if (proposed === 'done') {
          return prev;
        }
        return typeof proposed === 'string' && proposed.length > 0 ? proposed : prev;
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchArtistOnboardingStatus(artistId);
      applyEnvelope(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load onboarding status.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [artistId, applyEnvelope]);

  const skipStep = useCallback(async (step: string) => {
    if (!step) return;
    try {
      const response = await skipArtistOnboardingStep({
        artist_id: artistId,
        step,
      });
      applyEnvelope(response);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unable to skip onboarding step.');
    }
  }, [artistId, applyEnvelope]);

  const completeOnboarding = useCallback(async () => {
    try {
      const response = await completeArtistOnboarding({ artist_id: artistId });
      applyEnvelope(response);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Unable to complete onboarding.');
    }
  }, [artistId, applyEnvelope]);

  useEffect(() => {
    refresh().catch(() => {
      /* error state handled in refresh */
    });
  }, [refresh]);

  const value = useMemo<ArtistOnboardingContextValue>(
    () => ({
      artistId,
      status,
      loading,
      error,
      currentStep,
      setCurrentStep,
      refresh,
      applyEnvelope,
      skipStep,
      completeOnboarding,
    }),
    [artistId, status, loading, error, currentStep, setCurrentStep, refresh, applyEnvelope, skipStep, completeOnboarding],
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
