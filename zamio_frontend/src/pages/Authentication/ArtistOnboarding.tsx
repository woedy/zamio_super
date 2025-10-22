import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import OnboardingWizard, { OnboardingStep } from '../../components/onboarding/OnboardingWizard';
import WelcomeStep from './Onboarding/steps/WelcomeStep';
import ProfileStep from './Onboarding/steps/ProfileStep';
import KYCStep from './Onboarding/steps/KYCStep';
import SocialMediaInfo from './Onboarding/SocialMediaInfo';
import PaymentInfo from './Onboarding/PaymentInfo';
import Publisher from './Onboarding/Publisher';
import { useAuth } from '../../lib/auth';
import { deriveNextArtistOnboardingStep } from '../../lib/api';
import {
  ArtistOnboardingProvider,
  useArtistOnboarding,
} from './Onboarding/ArtistOnboardingContext';

const onboardingSequence: Array<{ id: string; title: string; description: string; required?: boolean }>
  = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Learn about ZamIO and your self-publishing setup',
      required: true,
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Complete your artist profile information',
      required: true,
    },
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Connect your social media accounts',
    },
    {
      id: 'payment',
      title: 'Payment Info',
      description: 'Add your payment information for royalty collection',
    },
    {
      id: 'publisher',
      title: 'Publisher (Optional)',
      description: 'Connect with a publisher if you have one',
    },
    {
      id: 'kyc',
      title: 'Identity Verification',
      description: 'Upload KYC documents for account verification',
    },
  ];

const ArtistOnboardingInner = () => {
  const navigate = useNavigate();
  const params = useParams<{ stepId?: string }>();
  const {
    status,
    loading,
    error,
    currentStep,
    setCurrentStep,
    skipStep,
    completeOnboarding,
  } = useArtistOnboarding();
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const target = params.stepId;
    if (target && target !== currentStep) {
      setCurrentStep(target);
    }
  }, [params.stepId, currentStep, setCurrentStep]);

  useEffect(() => {
    const pointer = deriveNextArtistOnboardingStep(status ?? undefined);
    const isComplete = (status?.next_step === 'done' || status?.onboarding_step === 'done') && !pointer;
    if (isComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [status, navigate]);

  const progress = status?.progress ?? {};

  const steps: OnboardingStep[] = useMemo(() => {
    const kycCanSkip = status?.kyc?.can_skip;
    return onboardingSequence.map(({ id, title, description, required }) => ({
      id,
      title,
      description,
      component:
        id === 'welcome'
          ? WelcomeStep
          : id === 'profile'
            ? ProfileStep
            : id === 'social-media'
              ? SocialMediaInfo
              : id === 'payment'
                ? PaymentInfo
                : id === 'publisher'
                  ? Publisher
                  : KYCStep,
      isCompleted:
        id === 'welcome'
          ? true
          : id === 'profile'
            ? Boolean(progress.profile_completed)
            : id === 'social-media'
              ? Boolean(progress.social_media_added)
              : id === 'payment'
                ? Boolean(progress.payment_info_added)
                : id === 'publisher'
                  ? Boolean(progress.publisher_added)
                  : id === 'kyc'
                    ? Boolean(progress.kyc_verified || progress.kyc_submitted)
                    : false,
      isRequired:
        id === 'kyc'
          ? kycCanSkip === false
          : required ?? false,
    }));
  }, [progress, status?.kyc?.can_skip]);

  const handleStepChange = (stepId: string) => {
    setCompletionError(null);
    setCurrentStep(stepId);
    const targetPath = stepId ? `/onboarding/${stepId}` : '/onboarding';
    navigate(targetPath, { replace: true });
  };

  const handleSkip = async (stepId: string) => {
    if (!stepId) return;
    setCompletionError(null);
    setIsBusy(true);
    try {
      await skipStep(stepId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to skip this step right now.';
      setCompletionError(message);
      throw err;
    } finally {
      setIsBusy(false);
    }
  };

  const handleComplete = async () => {
    setIsBusy(true);
    setCompletionError(null);
    try {
      await completeOnboarding();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'We could not finalize your onboarding. Please try again.';
      setCompletionError(message);
      setIsBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-200">Preparing your onboarding…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold">We couldn't load your onboarding progress</h2>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {completionError && (
        <div className="bg-red-500/10 text-red-100 border border-red-500/30 mx-auto mb-4 max-w-3xl rounded-lg px-4 py-3 text-sm">
          {completionError}
        </div>
      )}
      <OnboardingWizard
        steps={steps}
        onComplete={handleComplete}
        title="Artist Onboarding"
        subtitle="Let's get you set up to start earning from your music"
        initialStepId="welcome"
        currentStepId={currentStep || 'profile'}
        onStepChange={handleStepChange}
        onStepSkip={handleSkip}
        isBusy={isBusy}
      />
    </>
  );
};

export default function ArtistOnboarding() {
  const { user } = useAuth();
  const params = useParams<{ stepId?: string }>();
  const artistId =
    user && typeof user === 'object' && user !== null
      ? (user['artist_id'] as string | undefined)
      : undefined;

  const initialStep = params.stepId ?? 'profile';

  if (!artistId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold">Artist profile not found</h2>
          <p className="text-sm text-slate-400">
            We couldn't determine your artist account. Please sign out and sign in again to continue onboarding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ArtistOnboardingProvider artistId={artistId} initialStep={initialStep}>
      <ArtistOnboardingInner />
    </ArtistOnboardingProvider>
  );
}
