import { AxiosError } from 'axios';
import type { NavigateFunction } from 'react-router-dom';
import api from '../lib/api';

export type SkipOnboardingResponse = {
  publisher_id: string;
  next_step: string;
  redirect_step?: string;
  skipped_step?: string;
};

export const navigateToOnboardingStep = (
  navigate: NavigateFunction,
  nextStep?: string | null,
  options: { reloadOnDone?: boolean } = {},
) => {
  const { reloadOnDone = true } = options;
  const reloadIfNeeded = () => {
    if (reloadOnDone && typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  switch (nextStep) {
    case 'profile':
      navigate('/onboarding/profile');
      break;
    case 'revenue-split':
      navigate('/onboarding/revenue-split');
      break;
    case 'link-artist':
      navigate('/onboarding/link-artist');
      break;
    case 'payment':
      navigate('/onboarding/payment');
      break;
    case 'done':
      navigate('/dashboard');
      reloadIfNeeded();
      break;
    default:
      navigate('/dashboard');
      reloadIfNeeded();
      break;
  }
};

export const skipPublisherOnboarding = async (
  publisherId: string,
  step: string,
): Promise<SkipOnboardingResponse> => {
  const response = await api.post('api/accounts/skip-publisher-onboarding/', {
    publisher_id: publisherId,
    step,
  });
  const data = response.data?.data as SkipOnboardingResponse | undefined;
  return {
    publisher_id: publisherId,
    next_step: data?.next_step ?? step,
    redirect_step: data?.redirect_step ?? step,
    skipped_step: data?.skipped_step,
  };
};

export const extractApiErrorMessage = (error: unknown, fallback = 'An unexpected error occurred.') => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as any;
    if (data?.errors && typeof data.errors === 'object') {
      const entries = Object.values(data.errors)
        .flat()
        .map((msg) => String(msg).trim())
        .filter(Boolean);
      if (entries.length) {
        return entries.join('\n');
      }
    }
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
