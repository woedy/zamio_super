import React from 'react';
import OnboardingWizard, { OnboardingStep } from '../../components/onboarding/OnboardingWizard';
import WelcomeStep from './Onboarding/steps/WelcomeStep';
import ProfileStep from './Onboarding/steps/ProfileStep';
import KYCStep from './Onboarding/steps/KYCStep';
import SocialMediaInfo from './Onboarding/SocialMediaInfo';
import PaymentInfo from './Onboarding/PaymentInfo';
import Publisher from './Onboarding/Publisher';

// All step components are now properly imported above

export default function ArtistOnboarding() {
  const steps: OnboardingStep[] = [
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
      isCompleted: false,
      isRequired: true,
    },
    {
      id: 'kyc',
      title: 'Identity Verification',
      description: 'Upload KYC documents for account verification',
      component: KYCStep,
      isCompleted: false,
      isRequired: false,
    },
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Connect your social media accounts',
      component: SocialMediaInfo,
      isCompleted: false,
      isRequired: false,
    },
    {
      id: 'payment',
      title: 'Payment Info',
      description: 'Add your payment information for royalty collection',
      component: PaymentInfo,
      isCompleted: false,
      isRequired: false,
    },
    {
      id: 'publisher',
      title: 'Publisher (Optional)',
      description: 'Connect with a publisher if you have one',
      component: Publisher,
      isCompleted: false,
      isRequired: false,
    },
  ];

  const handleComplete = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <OnboardingWizard
      steps={steps}
      onComplete={handleComplete}
      title="Artist Onboarding"
      subtitle="Let's get you set up to start earning from your music"
      initialStepId="welcome"
    />
  );
}
