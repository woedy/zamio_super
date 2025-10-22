import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import type { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';
import {
  completeArtistPayment,
  type ApiErrorMap,
} from '../../../lib/api';
import { useArtistOnboarding } from './ArtistOnboardingContext';

const PaymentInfo = ({ onNext }: OnboardingStepProps) => {
  const { artistId, applyEnvelope, status } = useArtistOnboarding();
  const [formState, setFormState] = useState({ momo: '', bankAccount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ApiErrorMap | null>(null);

  useEffect(() => {
    const payment = status?.payment_preferences;
    if (!payment) return;
    setFormState(prev => {
      const next = {
        momo: payment.momo ? String(payment.momo) : '',
        bankAccount: payment.bank_account ? String(payment.bank_account) : '',
      };
      const hasChanged = Object.entries(next).some(([key, value]) => value !== (prev as typeof next)[key as keyof typeof next]);
      return hasChanged ? next : prev;
    });
  }, [status?.payment_preferences?.momo, status?.payment_preferences?.bank_account]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors(null);

    const payload: Record<string, string> = { artist_id: artistId };
    if (formState.momo) {
      payload.momo = formState.momo;
    }
    if (formState.bankAccount) {
      payload.bankAccount = formState.bankAccount;
    }

    try {
      const response = await completeArtistPayment(payload);
      applyEnvelope(response);
      onNext?.();
    } catch (err) {
      const apiErrors = (err as { response?: { data?: { errors?: ApiErrorMap } } }).response?.data;
      setErrors(apiErrors?.errors ?? null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-slate-300">
        Add at least one payout method so we can distribute royalties as soon as your catalog earns revenue. You can update or
        add more accounts later in settings.
      </p>

      <label className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-slate-200">Mobile Money Number</span>
        <input
          name="momo"
          value={formState.momo}
          onChange={handleChange}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
          placeholder="e.g. +23355XXXXXXX"
        />
      </label>

      <label className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-slate-200">Bank Account Details</span>
        <input
          name="bankAccount"
          value={formState.bankAccount}
          onChange={handleChange}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
          placeholder="Account number or IBAN"
        />
      </label>

      {errors && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <p className="font-medium">We couldn't save your payout details:</p>
          <ul className="mt-2 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{Array.isArray(message) ? message.join(', ') : message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Save and continue'}
        </button>
      </div>
    </form>
  );
};

export default PaymentInfo;
