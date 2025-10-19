import React from 'react';
import OnboardingWizard, { OnboardingStep } from '../../components/onboarding/OnboardingWizard';
import WelcomeStep from './Onboarding/steps/WelcomeStep';
import CompanyProfileStep from './Onboarding/steps/CompanyProfileStep';
import RevenueSplitStep from './Onboarding/steps/RevenueSplitStep';
import ArtistManagementStep from './Onboarding/steps/ArtistManagementStep';
import PublisherPaymentStep from './Onboarding/steps/PublisherPaymentStep';

export default function PublisherOnboarding() {
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Introduction to Zamio Publisher platform',
      component: WelcomeStep,
      isCompleted: true,
      isRequired: true,
    },
    {
      id: 'company-profile',
      title: 'Company Profile',
      description: 'Complete your publisher company information',
      component: CompanyProfileStep,
      isCompleted: false,
      isRequired: true,
    },
    {
      id: 'revenue-split',
      title: 'Revenue Split',
      description: 'Configure writer and publisher revenue splits',
      component: RevenueSplitStep,
      isCompleted: false,
      isRequired: true,
    },
    {
      id: 'artist-management',
      title: 'Artist Management',
      description: 'Link and manage your artists',
      component: ArtistManagementStep,
      isCompleted: false,
      isRequired: false,
    },
    {
      id: 'payment-setup',
      title: 'Payment Setup',
      description: 'Configure royalty collection methods',
      component: PublisherPaymentStep,
      isCompleted: false,
      isRequired: true,
    },
  ];

  const handleComplete = () => {
    // Navigate to publisher dashboard
    window.location.href = '/dashboard';
  };

  return (
    <OnboardingWizard
      steps={steps}
      onComplete={handleComplete}
      title="Publisher Onboarding"
      subtitle="Complete your publisher setup for music rights management and royalty collection"
      initialStepId="welcome"
    />
  );
}
