import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  onNext: (options?: { markComplete?: boolean }) => Promise<void> | void;
  onSkip?: () => Promise<void> | void;
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
  initialStepId?: string;
  currentStepId?: string;
  onStepComplete?: (stepId: string) => Promise<void> | void;
  onStepSkip?: (stepId: string) => Promise<void> | void;
  onStepChange?: (stepId: string) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  steps,
  onComplete,
  title,
  subtitle,
  initialStepId,
  currentStepId,
  onStepComplete,
  onStepSkip,
  onStepChange,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { theme } = useTheme();
  const hasInitializedRef = useRef(false);

  const currentStep = steps[currentStepIndex];
  const CurrentStepComponent = currentStep?.component;

  const goToStep = (index: number) => {
    if (index === currentStepIndex) return; // Prevent unnecessary updates
    setCurrentStepIndex(index);
    const step = steps[index];
    if (step && onStepChange) {
      onStepChange(step.id);
    }
  };

  const handleAdvance = async (
    action: 'complete' | 'skip',
    options?: { markComplete?: boolean }
  ) => {
    const step = steps[currentStepIndex];
    if (!step) return;

    if (action === 'complete' && (options?.markComplete ?? true)) {
      if (onStepComplete) {
        await onStepComplete(step.id);
      }
    }

    if (action === 'skip') {
      if (onStepSkip) {
        await onStepSkip(step.id);
      }
    }

    if (currentStepIndex < steps.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      await onComplete();
    }
  };

  const handleNext = async (options?: { markComplete?: boolean }) => {
    await handleAdvance('complete', options);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  };

  const handleSkip = async () => {
    await handleAdvance('skip');
  };

  if (!currentStep) {
    return null;
  }

  const stepIds = useMemo(() => steps.map(step => step.id), [steps]);

  useEffect(() => {
    if (!steps.length) {
      return;
    }

    let desiredStepId: string | undefined;

    if (currentStepId && stepIds.includes(currentStepId)) {
      desiredStepId = currentStepId;
    } else if (!hasInitializedRef.current) {
      if (initialStepId && stepIds.includes(initialStepId)) {
        desiredStepId = initialStepId;
      } else {
        const firstIncomplete = steps.find(step => !step.isCompleted);
        desiredStepId = firstIncomplete ? firstIncomplete.id : steps[0].id;
      }
      hasInitializedRef.current = true;
    }

    if (desiredStepId) {
      const targetIndex = steps.findIndex(step => step.id === desiredStepId);
      if (targetIndex !== -1 && targetIndex !== currentStepIndex) {
        goToStep(targetIndex);
        return;
      }
    }

    if (currentStepIndex >= steps.length) {
      goToStep(Math.max(steps.length - 1, 0));
    }
  }, [currentStepId, initialStepId, stepIds, steps, currentStepIndex]);

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