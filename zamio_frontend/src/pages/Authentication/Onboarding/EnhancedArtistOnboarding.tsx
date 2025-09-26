import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OnboardingWizard, { OnboardingStep } from '../../../components/onboarding/OnboardingWizard';
import WelcomeStep from './steps/WelcomeStep';
import ProfileStep from './steps/ProfileStep';
import KYCStep from './steps/KYCStep';
import SocialMediaInfo from './SocialMediaInfo';
import PaymentInfo from './PaymentInfo';
import Publisher from './Publisher';
import api from '../../../lib/api';
import { getArtistId } from '../../../lib/auth';

const EnhancedArtistOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [artistData, setArtistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialStepId, setInitialStepId] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadArtistData();
  }, []);

  const loadArtistData = async () => {
    try {
      const response = await api.get(`api/accounts/artist-onboarding-status/${getArtistId()}/`);
      setArtistData(response.data.data);
    } catch (error) {
      console.error('Failed to load artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const steps: OnboardingStep[] = useMemo(() => ([
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Learn about ZamIO and your self-publishing setup',
      component: WelcomeStep,
      isCompleted: true,
      isRequired: true,
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Complete your artist profile information',
      component: ProfileStep,
      isCompleted: artistData?.profile_completed || false,
      isRequired: true,
    },
    {
      id: 'kyc',
      title: 'Identity Verification',
      description: 'Upload KYC documents for account verification',
      component: KYCStep,
      isCompleted: artistData?.kyc_status === 'verified' || artistData?.kyc_status === 'incomplete',
      isRequired: false,
    },
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Connect your social media accounts',
      component: SocialMediaInfo,
      isCompleted: artistData?.social_media_added || false,
      isRequired: false,
    },
    {
      id: 'payment',
      title: 'Payment Info',
      description: 'Add your payment information for royalty collection',
      component: PaymentInfo,
      isCompleted: artistData?.payment_info_added || false,
      isRequired: false,
    },
    {
      id: 'publisher',
      title: 'Publisher (Optional)',
      description: 'Connect with a publisher if you have one',
      component: Publisher,
      isCompleted: artistData?.publisher_added || false,
      isRequired: false,
    },
  ]), [artistData]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!steps.length) {
      return;
    }

    const availableStepIds = steps.map(step => step.id);
    const searchParams = new URLSearchParams(location.search);
    const requestedStep = searchParams.get('step');

    let targetStepId: string | undefined;

    if (requestedStep && availableStepIds.includes(requestedStep)) {
      targetStepId = requestedStep;
    }

    if (!targetStepId) {
      const recommendedStep = artistData?.next_recommended_step;
      if (recommendedStep && availableStepIds.includes(recommendedStep)) {
        targetStepId = recommendedStep;
      }
    }

    if (!targetStepId) {
      const firstIncomplete = steps.find(step => !step.isCompleted);
      targetStepId = firstIncomplete?.id || steps[steps.length - 1].id;
    }

    if (targetStepId !== initialStepId) {
      setInitialStepId(targetStepId);
    }
  }, [artistData, initialStepId, loading, location.search, steps]);

  const handleStepComplete = async () => {
    await loadArtistData();
  };

  const handleStepSkip = async (stepId: string) => {
    try {
      await api.post('api/accounts/skip-artist-onboarding/', {
        artist_id: getArtistId(),
        step: stepId,
      });
    } catch (error) {
      console.error('Failed to update skip status:', error);
    } finally {
      await loadArtistData();
    }
  };

  const handleStepChange = (stepId: string) => {
    const params = new URLSearchParams(location.search);
    if (params.get('step') === stepId) {
      return;
    }
    params.set('step', stepId);
    const query = params.toString();
    navigate(`/onboarding${query ? `?${query}` : ''}`, { replace: true });
  };

  const handleOnboardingComplete = async () => {
    try {
      // Mark onboarding as complete
      await api.post('api/accounts/complete-artist-onboarding/', {
        artist_id: getArtistId(),
      });

      // Set self-published status
      await api.post('api/accounts/set-self-published-status/', {
        artist_id: getArtistId(),
        self_published: true,
      });

      // Navigate to dashboard
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      // Still navigate to dashboard even if API calls fail
      navigate('/dashboard', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <OnboardingWizard
      steps={steps}
      onComplete={handleOnboardingComplete}
      title="Artist Onboarding"
      subtitle="Let's get you set up to start earning from your music"
      initialStepId={initialStepId}
      onStepComplete={handleStepComplete}
      onStepSkip={handleStepSkip}
      onStepChange={handleStepChange}
    />
  );
};

export default EnhancedArtistOnboarding;