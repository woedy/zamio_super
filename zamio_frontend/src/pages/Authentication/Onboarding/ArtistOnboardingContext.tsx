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
  completeArtistOnboarding,
  completeArtistPayment,
  completeArtistProfile,
  completeArtistPublisher,
  completeArtistSocial,
  fetchArtistOnboardingStatus,
  getStoredAuth,
  skipArtistOnboardingStep,
  type ArtistOnboardingStatus,
} from '../../../lib/api';
import { useAuth } from '../../../lib/auth';

interface ArtistOnboardingContextValue {
  status: ArtistOnboardingStatus | null;
  loading: boolean;
  error: string | null;
  currentStep: string | null;
  setCurrentStep: (step: string | null) => void;
  refreshStatus: () => Promise<ArtistOnboardingStatus | null>;
  submitProfile: (payload: ArtistProfileSubmission) => Promise<ArtistOnboardingStatus | null>;
  completeSocial: (payload: ArtistSocialSubmission) => Promise<ArtistOnboardingStatus | null>;
  skipSocial: () => Promise<ArtistOnboardingStatus | null>;
  submitPayment: (payload: ArtistPaymentSubmission) => Promise<ArtistOnboardingStatus | null>;
  submitPublisher: (payload: ArtistPublisherSubmission) => Promise<ArtistOnboardingStatus | null>;
  finalizeOnboarding: () => Promise<ArtistOnboardingStatus | null>;
  skipStep: (step: string) => Promise<ArtistOnboardingStatus | null>;
  artistId: string;
}

const ArtistOnboardingContext = createContext<ArtistOnboardingContextValue | undefined>(undefined);

const wizardStepSet = new Set<string>(['welcome', 'profile', 'social-media', 'payment', 'publisher', 'kyc']);

const sanitizeOptionalString = (value?: string | null) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const deriveStepFromStatus = (
  status: ArtistOnboardingStatus | null,
  currentStep: string | null,
): string | null => {
  if (!status) {
    return null;
  }

  const rawStep = (status.next_step || status.onboarding_step || null) as string | null;
  if (!rawStep || rawStep === 'done') {
    return null;
  }

  const normalized = rawStep.replace(/_/g, '-');
  if (!wizardStepSet.has(normalized)) {
    return null;
  }

  if (currentStep === 'welcome' && normalized === 'profile') {
    return null;
  }

  return normalized;
};

export interface ArtistProfileSubmission {
  artistName: string;
  bio: string;
  genre: string;
  style: string;
  location?: string;
  country?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
  spotify?: string;
  profileImage?: File | null;
}

export interface ArtistSocialSubmission {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  accounts?: Record<string, unknown>[];
  skip?: boolean;
}

export interface ArtistPaymentSubmission {
  preferredMethod: string;
  currency?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  routingNumber?: string;
  mobileProvider?: string;
  mobileNumber?: string;
  mobileAccountName?: string;
  internationalInstructions?: string;
}

export interface ArtistPublisherSubmission {
  selfPublish: boolean;
  publisherId?: string;
  publisherName?: string;
  publisherType?: string;
  publisherLocation?: string;
  publisherSpecialties?: string[];
  relationshipNotes?: string;
  agreedToTerms?: boolean;
  selectedPublisher?: Record<string, unknown> | null;
}

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
  const { login, user: authUser } = useAuth();
  const [status, setStatus] = useState<ArtistOnboardingStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStepState] = useState<string | null>(initialStep);

  const updateAuthFromStatus = useCallback(
    (nextStatus: ArtistOnboardingStatus | null) => {
      if (!nextStatus) {
        return;
      }

      const stored = getStoredAuth();
      const baseUser =
        (stored.user && typeof stored.user === 'object' ? stored.user : null)
        || (authUser && typeof authUser === 'object' ? authUser : null)
        || {};

      const mergedUser: Record<string, unknown> = { ...baseUser };

      if (nextStatus.artist_id) {
        mergedUser['artist_id'] = nextStatus.artist_id;
      }

      const profile = (nextStatus.profile ?? {}) as Record<string, unknown>;
      const stageNameCandidate =
        (profile['stage_name'] as string | undefined)
        || (profile['stageName'] as string | undefined)
        || (nextStatus['stage_name'] as string | undefined)
        || (nextStatus['artist_name'] as string | undefined);

      if (stageNameCandidate && stageNameCandidate.trim().length > 0) {
        mergedUser['stage_name'] = stageNameCandidate;
        mergedUser['artist_name'] = stageNameCandidate;
        mergedUser['display_name'] = stageNameCandidate;
        if (!mergedUser['name']) {
          mergedUser['name'] = stageNameCandidate;
        }
      }

      if (typeof profile['location'] === 'string' && profile['location']) {
        mergedUser['location'] = profile['location'];
      }
      if (typeof profile['country'] === 'string' && profile['country']) {
        mergedUser['country'] = profile['country'];
      }

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('zamio_user_payload', JSON.stringify(mergedUser));
        } catch (_error) {
          // Ignore storage errors in non-browser contexts
        }
      }

      login({ user: mergedUser });
    },
    [authUser, login],
  );

  const applyNextStatus = useCallback(
    (nextStatus: ArtistOnboardingStatus | null) => {
      setStatus(nextStatus);
      updateAuthFromStatus(nextStatus);

      const suggestedStep = deriveStepFromStatus(nextStatus, currentStep);
      if (suggestedStep) {
        setCurrentStepState(suggestedStep);
      }

      return nextStatus;
    },
    [currentStep, updateAuthFromStatus],
  );

  const refreshStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const envelope = await fetchArtistOnboardingStatus(artistId);
      const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
      return applyNextStatus(nextStatus);
    } catch (err) {
      const message = resolveErrorMessage(err);
      setError(message);
      setStatus(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [artistId, applyNextStatus]);

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
        applyNextStatus(nextStatus);
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
  }, [artistId, applyNextStatus]);

  useEffect(() => {
    setCurrentStepState(initialStep ?? null);
  }, [initialStep]);

  useEffect(() => {
    if (currentStep) {
      return;
    }

    const nextSuggestedStep = deriveStepFromStatus(status, currentStep);
    if (nextSuggestedStep) {
      setCurrentStepState(nextSuggestedStep);
    }
  }, [status, currentStep]);

  const setCurrentStep = useCallback((step: string | null) => {
    setCurrentStepState(step);
  }, []);

  const submitProfile = useCallback(
    async (payload: ArtistProfileSubmission) => {
      const formData = new FormData();
      const stageName = payload.artistName.trim();
      const bio = payload.bio.trim();
      const genre = sanitizeOptionalString(payload.genre) ?? '';
      const style = sanitizeOptionalString(payload.style) ?? '';

      formData.append('artist_id', artistId);
      formData.append('artist_name', stageName);
      formData.append('bio', bio);
      formData.append('genre', genre);
      formData.append('style', style);

      const optionalFields: Array<[string, string | undefined]> = [
        ['location', sanitizeOptionalString(payload.location)],
        ['country', sanitizeOptionalString(payload.country)],
        ['website', sanitizeOptionalString(payload.website)],
        ['instagram', sanitizeOptionalString(payload.instagram)],
        ['twitter', sanitizeOptionalString(payload.twitter)],
        ['facebook', sanitizeOptionalString(payload.facebook)],
        ['youtube', sanitizeOptionalString(payload.youtube)],
        ['spotify', sanitizeOptionalString(payload.spotify)],
      ];

      optionalFields.forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      if (payload.profileImage) {
        formData.append('profile_image', payload.profileImage);
      }

      if (!payload.profileImage && status?.profile) {
        const profileSnapshot = status.profile as Record<string, unknown>;
        const existingPhoto = sanitizeOptionalString(
          (profileSnapshot['photo'] as string | undefined)
            || (profileSnapshot['profile_image'] as string | undefined)
            || (profileSnapshot['profileImage'] as string | undefined),
        );
        if (existingPhoto) {
          formData.append('existing_photo', existingPhoto);
        }
      }

      try {
        const envelope = await completeArtistProfile(formData);
        const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
        return applyNextStatus(nextStatus);
      } catch (err) {
        throw new Error(resolveErrorMessage(err));
      }
    },
    [artistId, applyNextStatus, status],
  );

  const completeSocial = useCallback(
    async (payload: ArtistSocialSubmission) => {
      try {
        const envelope = await completeArtistSocial({
          artist_id: artistId,
          ...payload,
        });
        const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
        return applyNextStatus(nextStatus);
      } catch (err) {
        throw new Error(resolveErrorMessage(err));
      }
    },
    [artistId, applyNextStatus],
  );

  const skipSocial = useCallback(() => completeSocial({ skip: true }), [completeSocial]);

  const submitPayment = useCallback(
    async (payload: ArtistPaymentSubmission) => {
      const request: Record<string, unknown> = {
        artist_id: artistId,
        preferred_method: sanitizeOptionalString(payload.preferredMethod) ?? '',
      };

      const normalizedCurrency = sanitizeOptionalString(payload.currency);
      if (normalizedCurrency) {
        request.currency = normalizedCurrency;
      }

      const method = payload.preferredMethod?.toLowerCase();
      if (method === 'mobile-money') {
        request.mobile_provider = sanitizeOptionalString(payload.mobileProvider);
        request.mobile_number = sanitizeOptionalString(payload.mobileNumber);
        request.mobile_account_name = sanitizeOptionalString(payload.mobileAccountName);
      } else if (method === 'bank-transfer') {
        request.bank_name = sanitizeOptionalString(payload.bankName);
        request.account_number = sanitizeOptionalString(payload.accountNumber);
        request.account_holder_name = sanitizeOptionalString(payload.accountHolderName);
        request.routing_number = sanitizeOptionalString(payload.routingNumber);
      } else if (method === 'international') {
        request.international_instructions = sanitizeOptionalString(payload.internationalInstructions);
      }

      try {
        const envelope = await completeArtistPayment(request);
        const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
        return applyNextStatus(nextStatus);
      } catch (err) {
        throw new Error(resolveErrorMessage(err));
      }
    },
    [artistId, applyNextStatus],
  );

  const submitPublisher = useCallback(
    async (payload: ArtistPublisherSubmission) => {
      const request: Record<string, unknown> = {
        artist_id: artistId,
        self_publish: payload.selfPublish,
      };

      if (sanitizeOptionalString(payload.publisherId)) {
        request.publisher_id = sanitizeOptionalString(payload.publisherId);
      }
      if (sanitizeOptionalString(payload.publisherName)) {
        request.publisher_name = sanitizeOptionalString(payload.publisherName);
      }
      if (sanitizeOptionalString(payload.publisherType)) {
        request.publisher_type = sanitizeOptionalString(payload.publisherType);
      }
      if (sanitizeOptionalString(payload.publisherLocation)) {
        request.publisher_location = sanitizeOptionalString(payload.publisherLocation);
      }
      if (payload.publisherSpecialties && payload.publisherSpecialties.length > 0) {
        request.publisher_specialties = payload.publisherSpecialties.filter(Boolean);
      }
      if (sanitizeOptionalString(payload.relationshipNotes)) {
        request.relationship_notes = sanitizeOptionalString(payload.relationshipNotes);
      }
      if (typeof payload.agreedToTerms !== 'undefined') {
        request.agreed_to_terms = payload.agreedToTerms;
      }
      if (payload.selectedPublisher) {
        request.publisher_details = payload.selectedPublisher;
      }

      try {
        const envelope = await completeArtistPublisher(request);
        const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
        return applyNextStatus(nextStatus);
      } catch (err) {
        throw new Error(resolveErrorMessage(err));
      }
    },
    [artistId, applyNextStatus],
  );

  const finalizeOnboarding = useCallback(async () => {
    try {
      const envelope = await completeArtistOnboarding({ artist_id: artistId });
      const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
      return applyNextStatus(nextStatus);
    } catch (err) {
      throw new Error(resolveErrorMessage(err));
    }
  }, [artistId, applyNextStatus]);

  const skipStep = useCallback(
    async (step: string) => {
      try {
        const envelope = await skipArtistOnboardingStep({ artist_id: artistId, step });
        const nextStatus = (envelope?.data ?? null) as ArtistOnboardingStatus | null;
        return applyNextStatus(nextStatus);
      } catch (err) {
        throw new Error(resolveErrorMessage(err));
      }
    },
    [artistId, applyNextStatus],
  );

  const value = useMemo<ArtistOnboardingContextValue>(
    () => ({
      status,
      loading,
      error,
      currentStep,
      setCurrentStep,
      refreshStatus,
      submitProfile,
      completeSocial,
      skipSocial,
      submitPayment,
      submitPublisher,
      finalizeOnboarding,
      skipStep,
      artistId,
    }),
    [
      status,
      loading,
      error,
      currentStep,
      setCurrentStep,
      refreshStatus,
      submitProfile,
      completeSocial,
      skipSocial,
      submitPayment,
      submitPublisher,
      finalizeOnboarding,
      skipStep,
      artistId,
    ],
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

