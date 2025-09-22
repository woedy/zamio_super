import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UserIcon,
  CreditCardIcon,
  MusicalNoteIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { getArtistId } from '../../lib/auth';

interface OnboardingProgressProps {
  className?: string;
  showActions?: boolean;
}

interface OnboardingStatus {
  profile_completed: boolean;
  social_media_added: boolean;
  payment_info_added: boolean;
  publisher_added: boolean;
  track_uploaded: boolean;
  kyc_status: string;
  self_published: boolean;
  profile_complete_percentage: number;
  next_recommended_step: string;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  className = "", 
  showActions = true 
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      const response = await api.get(`api/accounts/artist-onboarding-status/${getArtistId()}/`);
      setStatus(response.data.data);
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (stepKey: string) => {
    const icons = {
      profile: UserIcon,
      kyc: ShieldCheckIcon,
      social: MusicalNoteIcon,
      payment: CreditCardIcon,
      publisher: BuildingOfficeIcon,
      track: MusicalNoteIcon
    };
    return icons[stepKey as keyof typeof icons] || UserIcon;
  };

  const getStepStatus = (stepKey: string) => {
    if (!status) return 'pending';
    
    switch (stepKey) {
      case 'profile':
        return status.profile_completed ? 'completed' : 'pending';
      case 'kyc':
        return status.kyc_status === 'verified' ? 'completed' : 
               status.kyc_status === 'incomplete' ? 'in_progress' : 'pending';
      case 'social':
        return status.social_media_added ? 'completed' : 'pending';
      case 'payment':
        return status.payment_info_added ? 'completed' : 'pending';
      case 'publisher':
        return status.publisher_added || status.self_published ? 'completed' : 'pending';
      case 'track':
        return status.track_uploaded ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return theme.colors.success;
      case 'in_progress':
        return theme.colors.warning;
      case 'pending':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return CheckCircleIcon;
      case 'in_progress':
        return ExclamationTriangleIcon;
      default:
        return null;
    }
  };

  const steps = [
    {
      key: 'profile',
      title: 'Complete Profile',
      description: 'Add bio, location, and profile photo',
      isRequired: true
    },
    {
      key: 'kyc',
      title: 'Identity Verification',
      description: 'Upload KYC documents (recommended)',
      isRequired: false
    },
    {
      key: 'social',
      title: 'Social Media',
      description: 'Connect your social media accounts',
      isRequired: false
    },
    {
      key: 'payment',
      title: 'Payment Info',
      description: 'Add payment details for royalties',
      isRequired: false
    },
    {
      key: 'publisher',
      title: 'Publisher Setup',
      description: 'Configure publishing preferences',
      isRequired: false
    },
    {
      key: 'track',
      title: 'Upload Music',
      description: 'Upload your first track',
      isRequired: false
    }
  ];

  const handleContinueOnboarding = () => {
    navigate('/onboarding');
  };

  const handleCompleteStep = (stepKey: string) => {
    // Navigate to specific step in onboarding
    navigate(`/onboarding?step=${stepKey}`);
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg border ${className}`}
           style={{ 
             backgroundColor: theme.colors.surface,
             borderColor: theme.colors.border
           }}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const completedSteps = steps.filter(step => getStepStatus(step.key) === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className={`p-6 rounded-lg border ${className}`}
         style={{ 
           backgroundColor: theme.colors.surface,
           borderColor: theme.colors.border
         }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
            Profile Setup
          </h3>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
            {completedSteps}/{steps.length} steps completed ({Math.round(progressPercentage)}%)
          </p>
        </div>
        
        {showActions && progressPercentage < 100 && (
          <button
            onClick={handleContinueOnboarding}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: theme.colors.primary,
              color: 'white'
            }}
          >
            <span>Continue Setup</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            backgroundColor: theme.colors.primary,
            width: `${progressPercentage}%`
          }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step) => {
          const stepStatus = getStepStatus(step.key);
          const StepIcon = getStepIcon(step.key);
          const StatusIcon = getStatusIcon(stepStatus);
          const statusColor = getStatusColor(stepStatus);

          return (
            <div key={step.key} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: stepStatus === 'completed' ? statusColor : 'transparent',
                    border: stepStatus !== 'completed' ? `2px solid ${statusColor}` : 'none'
                  }}
                >
                  {StatusIcon ? (
                    <StatusIcon className="w-5 h-5 text-white" />
                  ) : (
                    <StepIcon 
                      className="w-4 h-4" 
                      style={{ color: stepStatus === 'completed' ? 'white' : statusColor }} 
                    />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p
                    className={`text-sm font-medium ${
                      stepStatus === 'completed' ? '' : 'opacity-70'
                    }`}
                    style={{ color: theme.colors.text }}
                  >
                    {step.title}
                  </p>
                  {step.isRequired && stepStatus !== 'completed' && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: theme.colors.error + '20',
                        color: theme.colors.error 
                      }}
                    >
                      Required
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {step.description}
                </p>
              </div>

              {showActions && stepStatus !== 'completed' && (
                <button
                  onClick={() => handleCompleteStep(step.key)}
                  className="text-xs px-3 py-1 rounded border transition-colors"
                  style={{ 
                    borderColor: theme.colors.primary,
                    color: theme.colors.primary
                  }}
                >
                  Complete
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <div
          className="mt-6 p-4 rounded-lg flex items-center space-x-3"
          style={{ backgroundColor: theme.colors.success + '20' }}
        >
          <CheckCircleIcon className="w-6 h-6" style={{ color: theme.colors.success }} />
          <div>
            <p className="font-medium" style={{ color: theme.colors.success }}>
              Profile Setup Complete!
            </p>
            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
              You're all set to start earning royalties from your music.
            </p>
          </div>
        </div>
      )}

      {/* Self-Published Status */}
      {status.self_published && (
        <div
          className="mt-4 p-3 rounded-lg border-l-4"
          style={{ 
            backgroundColor: theme.colors.info + '10',
            borderLeftColor: theme.colors.info
          }}
        >
          <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
            Self-Published Artist
          </p>
          <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
            You receive royalty payments directly without a publisher intermediary.
          </p>
        </div>
      )}
    </div>
  );
};

export default OnboardingProgress;