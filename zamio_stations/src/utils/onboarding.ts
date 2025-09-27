import type { StationOnboardingStep } from '../contexts/StationOnboardingContext';

export const onboardingStepRouteMap: Record<StationOnboardingStep, string> = {
  profile: '/onboarding/profile',
  staff: '/onboarding/staff',
  report: '/onboarding/payment',
  payment: '/onboarding/payment',
  done: '/dashboard',
};

export const getOnboardingRoute = (step?: StationOnboardingStep | null): string => {
  if (!step) {
    return onboardingStepRouteMap.profile;
  }
  return onboardingStepRouteMap[step] ?? onboardingStepRouteMap.profile;
};

export const isOnboardingRoute = (path: string): boolean => {
  return Object.values(onboardingStepRouteMap).includes(path);
};
