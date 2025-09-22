import React from 'react';
import { 
  CheckCircleIcon, 
  MusicalNoteIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../../contexts/ThemeContext';
import { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';

const WelcomeStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  const { theme } = useTheme();

  const benefits = [
    {
      icon: MusicalNoteIcon,
      title: 'Self-Published Artist',
      description: 'You are automatically set up as a self-published artist with full control over your music catalog.'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Direct Royalty Collection',
      description: 'Receive royalty payments directly to your account without needing a publisher intermediary.'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Track your music performance across Ghana radio stations with detailed analytics.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Industry Standards',
      description: 'ZamIO follows ASCAP, BMI, and international PRO standards for professional royalty management.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
             style={{ backgroundColor: theme.colors.primary + '20' }}>
          <MusicalNoteIcon className="w-10 h-10" style={{ color: theme.colors.primary }} />
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: theme.colors.text }}>
          Welcome to ZamIO!
        </h1>
        <p className="text-lg" style={{ color: theme.colors.textSecondary }}>
          Ghana's premier music royalty management platform. Let's get you set up to start earning from your music.
        </p>
      </div>

      {/* Self-Published Status Highlight */}
      <div className="mb-8 p-6 rounded-lg border-l-4"
           style={{ 
             backgroundColor: theme.colors.success + '10',
             borderLeftColor: theme.colors.success
           }}>
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-6 h-6 mt-0.5" style={{ color: theme.colors.success }} />
          <div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
              You're Set as Self-Published
            </h3>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              Since you registered directly with ZamIO, you're automatically configured as a self-published artist. 
              This means you have full control over your music and will receive royalty payments directly.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {benefits.map((benefit, index) => (
          <div key={index} 
               className="p-6 rounded-lg border"
               style={{ 
                 backgroundColor: theme.colors.surface,
                 borderColor: theme.colors.border
               }}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <benefit.icon className="w-8 h-8" style={{ color: theme.colors.primary }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>
                  {benefit.title}
                </h3>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What's Next */}
      <div className="mb-8 p-6 rounded-lg"
           style={{ backgroundColor: theme.colors.surface }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
          What's Next?
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium text-white"
                 style={{ backgroundColor: theme.colors.primary }}>
              1
            </div>
            <span style={{ color: theme.colors.textSecondary }}>
              Complete your artist profile with bio and contact information
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium text-white"
                 style={{ backgroundColor: theme.colors.primary }}>
              2
            </div>
            <span style={{ color: theme.colors.textSecondary }}>
              Upload KYC documents for account verification (recommended)
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium text-white"
                 style={{ backgroundColor: theme.colors.primary }}>
              3
            </div>
            <span style={{ color: theme.colors.textSecondary }}>
              Add payment information for royalty collection
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium text-white"
                 style={{ backgroundColor: theme.colors.primary }}>
              4
            </div>
            <span style={{ color: theme.colors.textSecondary }}>
              Upload your first track to start earning royalties
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-colors"
          style={{ backgroundColor: theme.colors.primary }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;