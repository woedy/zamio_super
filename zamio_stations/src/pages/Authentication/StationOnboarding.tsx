import React from 'react';
import OnboardingWizard, { OnboardingStep } from '../../components/onboarding/OnboardingWizard';
import WelcomeStep from './Onboarding/steps/WelcomeStep';
import ProfileStep from './Onboarding/steps/ProfileStep';
import StreamSetupStep from './Onboarding/steps/StreamSetupStep';
import StaffStep from './Onboarding/steps/StaffStep';
import ComplianceStep from './Onboarding/steps/ComplianceStep';
import PaymentStep from './Onboarding/steps/PaymentStep';

export default function StationOnboarding() {
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome',
      description: 'Introduction to Zamio Stations platform',
      component: WelcomeStep,
      isCompleted: true,
      isRequired: true,
    },
    {
      id: 'profile',
      title: 'Station Profile',
      description: 'Set up your station details and licensing',
      component: ProfileStep,
      isCompleted: false,
      isRequired: true,
    },
    {
      id: 'stream-setup',
      title: 'Stream Configuration',
      description: 'Configure audio streams for monitoring',
      component: StreamSetupStep,
      isCompleted: false,
      isRequired: true,
    },
    {
      id: 'staff',
      title: 'Staff Management',
      description: 'Add team members and assign roles',
      component: StaffStep,
      isCompleted: false,
      isRequired: false,
    },
    {
      id: 'compliance',
      title: 'Compliance Setup',
      description: 'Configure regulatory compliance',
      component: ComplianceStep,
      isCompleted: false,
      isRequired: false,
    },
    {
      id: 'payment',
      title: 'Payment Setup',
      description: 'Configure revenue collection methods',
      component: PaymentStep,
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
      title="Station Onboarding"
      subtitle="Complete your station setup for music monitoring and royalty management"
      initialStepId="welcome"
    />
  );
}
