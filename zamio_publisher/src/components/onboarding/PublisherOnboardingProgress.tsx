import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  UserIcon,
  CreditCardIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { getPublisherId } from '../../constants';
import api from '../../lib/api';
import { extractApiErrorMessage, navigateToOnboardingStep } from '../../utils/onboarding';

interface PublisherOnboardingProgressProps {
  className?: string;
  showActions?: boolean;
}

interface OnboardingStatus {
  profile_completed: boolean;
  revenue_split_completed: boolean;
  link_artist_completed: boolean;
  payment_info_added: boolean;
  kyc_status: string;
  profile_complete_percentage: number;
  next_recommended_step: string;
  admin_approval_required: boolean;
}

const PublisherOnboardingProgress: React.FC<PublisherOnboardingProgressProps> = ({ 
  className = "", 
  showActions = true 
}) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      setError('');
      setLoading(true);
      const publisherId = getPublisherId();
      if (!publisherId) {
        setStatus(null);
        setError('Missing publisher session. Please sign in again.');
        return;
      }

      const response = await api.get(
        `api/accounts/publisher-onboarding-status/${publisherId}/`
      );
      setStatus(response.data?.data ?? null);
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
      setError(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (stepKey: string) => {
    const icons = {
      profile: BuildingOfficeIcon,
      'revenue-split': ChartBarIcon,
      'link-artist': UsersIcon,
      payment: CreditCardIcon
    };
    return icons[stepKey as keyof typeof icons] || UserIcon;
  };

  const getStepStatus = (stepKey: string) => {
    if (!status) return 'pending';
    
    switch (stepKey) {
      case 'profile':
        return status.profile_completed ? 'completed' : 'pending';
      case 'revenue-split':
        return status.revenue_split_completed ? 'completed' : 'pending';
      case 'link-artist':
        return status.link_artist_completed ? 'completed' : 'pending';
      case 'payment':
        return status.payment_info_added ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return '#10B981'; // green
      case 'in_progress':
        return '#F59E0B'; // yellow
      case 'pending':
        return '#6B7280'; // gray
      default:
        return '#6B7280';
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
      title: 'Company Profile',
      description: 'Complete your publisher profile and company information',
      isRequired: true
    },
    {
      key: 'revenue-split',
      title: 'Revenue Split',
      description: 'Configure writer and publisher revenue splits',
      isRequired: true
    },
    {
      key: 'link-artist',
      title: 'Link Artists',
      description: 'Connect with artists and manage relationships',
      isRequired: false
    },
    {
      key: 'payment',
      title: 'Payment Setup',
      description: 'Add payment details for royalty collection',
      isRequired: true
    }
  ];

  const handleContinueOnboarding = () => {
    const next = status?.next_recommended_step || status?.onboarding_step || 'profile';
    navigateToOnboardingStep(navigate, next, { reloadOnDone: false });
  };

  const handleCompleteStep = (stepKey: string) => {
    navigateToOnboardingStep(navigate, stepKey, { reloadOnDone: false });
  };

  if (loading) {
    return (
      <div className={`p-6 rounded-lg border bg-white ${className}`}>
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
    return error ? (
      <div className={`p-6 rounded-lg border bg-white ${className}`}>
        <div className="text-sm text-red-600">{error}</div>
      </div>
    ) : null;
  }

  const completedSteps = steps.filter(step => getStepStatus(step.key) === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className={`p-6 rounded-lg border bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Publisher Setup
          </h3>
          <p className="text-sm text-gray-600">
            {completedSteps}/{steps.length} steps completed ({Math.round(progressPercentage)}%)
          </p>
        </div>
        
        {showActions && progressPercentage < 100 && (
          <button
            onClick={handleContinueOnboarding}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <span>Continue Setup</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="h-2 bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
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
                      stepStatus === 'completed' ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.isRequired && stepStatus !== 'completed' && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {step.description}
                </p>
              </div>

              {showActions && stepStatus !== 'completed' && (
                <button
                  onClick={() => handleCompleteStep(step.key)}
                  className="text-xs px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                >
                  Complete
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Approval Notice */}
      {status.admin_approval_required && progressPercentage === 100 && (
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">
                Pending Admin Approval
              </p>
              <p className="text-sm text-yellow-700">
                Your publisher profile is complete and awaiting admin approval. 
                You'll be notified once your account is activated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {progressPercentage === 100 && !status.admin_approval_required && (
        <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-medium text-green-800">
                Publisher Setup Complete!
              </p>
              <p className="text-sm text-green-700">
                You're all set to start managing artists and collecting royalties.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublisherOnboardingProgress;