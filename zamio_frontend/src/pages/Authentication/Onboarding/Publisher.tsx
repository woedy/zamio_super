import { useState } from 'react';

import type { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';
import {
  completeArtistPublisher,
  type ApiErrorMap,
} from '../../../lib/api';
import { useArtistOnboarding } from './ArtistOnboardingContext';

const Publisher = ({ onNext }: OnboardingStepProps) => {
  const { artistId, applyEnvelope } = useArtistOnboarding();
  const [selfPublish, setSelfPublish] = useState(true);
  const [publisherId, setPublisherId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ApiErrorMap | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors(null);

    const payload: Record<string, unknown> = {
      artist_id: artistId,
      self_publish: selfPublish,
    };

    if (!selfPublish && publisherId.trim()) {
      payload.publisher_id = publisherId.trim();
    }

    try {
      const response = await completeArtistPublisher(payload);
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
        Let us know if you manage royalties independently or work with a publisher. This determines how we coordinate payouts
        and reciprocal reporting.
      </p>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
        <label className="flex items-center space-x-3 text-slate-200">
          <input
            type="radio"
            name="publishing"
            value="self"
            checked={selfPublish}
            onChange={() => setSelfPublish(true)}
            className="h-4 w-4 text-indigo-500"
          />
          <span>I'm self-published and manage my own rights</span>
        </label>

        <label className="flex items-center space-x-3 text-slate-200">
          <input
            type="radio"
            name="publishing"
            value="partner"
            checked={!selfPublish}
            onChange={() => setSelfPublish(false)}
            className="h-4 w-4 text-indigo-500"
          />
          <span>I work with a publisher or PRO partner</span>
        </label>

        {!selfPublish && (
          <div className="pt-4">
            <label className="flex flex-col space-y-2 text-slate-200">
              <span className="text-sm font-medium">Publisher ID</span>
              <input
                value={publisherId}
                onChange={event => setPublisherId(event.target.value)}
                className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
                placeholder="Enter the publisher ID assigned in Zamio"
              />
            </label>
          </div>
        )}
      </div>

      {errors && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <p className="font-medium">We couldn't update your publishing preferences:</p>
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

export default Publisher;
