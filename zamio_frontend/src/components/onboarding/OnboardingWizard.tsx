import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
  isCompleted: boolean;
  isRequired: boolean;
}

export interface OnboardingStepProps {
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isLastStep: boolean;
  currentStep: number;
  totalSteps: number;
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  title: string;
  subtitle?: string;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  steps,
  onComplete,
  title,
  subtitle,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const currentStep = steps[currentStepIndex];
  const CurrentStepComponent = currentStep?.component;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const calculateProgress = () => {
    const completedSteps = steps.filter(step => step.isCompleted).length;
    return (completedSteps / steps.length) * 100;
  };

  if (!currentStep) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      {/* Header with Progress */}
      <div className="sticky top-0 z-50" style={{ backgroundColor: theme.colors.surface, borderBottom: `1px solid ${theme.colors.border}` }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                  {subtitle}
                </p>
              )}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: theme.colors.primary,
                width: `${((currentStepIndex + 1) / steps.length) * 100}%`
              }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      index <= currentStepIndex
                        ? 'text-white'
                        : 'text-gray-400 border-2'
                    }`}
                    style={{
                      backgroundColor: index <= currentStepIndex ? theme.colors.primary : 'transparent',
                      borderColor: index <= currentStepIndex ? theme.colors.primary : theme.colors.border,
                    }}
                  >
                    {step.isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-2 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        index <= currentStepIndex ? '' : 'opacity-50'
                      }`}
                      style={{ color: theme.colors.text }}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRightIcon className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>
            {currentStep.title}
          </h2>
          <p style={{ color: theme.colors.textSecondary }}>
            {currentStep.description}
          </p>
        </div>

        <CurrentStepComponent
          onNext={handleNext}
          onSkip={!currentStep.isRequired ? handleSkip : undefined}
          onBack={currentStepIndex > 0 ? handleBack : undefined}
          isLastStep={currentStepIndex === steps.length - 1}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
        />
      </div>
    </div>
  );
};

export default OnboardingWizard;