import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [artistData, setArtistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const updateArtistOnboardingStatus = async (step: string, completed: boolean) => {
    try {
      await api.post('api/accounts/update-onboarding-status/', {
        artist_id: getArtistId(),
        step,
        completed,
      });
      // Reload artist data to get updated status
      await loadArtistData();
    } catch (error) {
      console.error('Failed to update onboarding status:', error);
    }
  };

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Learn about ZamIO and your self-publishing setup',
      component: WelcomeStep,
      isCompleted: true, // Welcome step is always completed once viewed
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
      isRequired: false, // KYC can be skipped but is highly recommended
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
  ];

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
    />
  );
};

export default EnhancedArtistOnboarding;