import { useState } from 'react';

import type { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';
import {
  completeArtistSocial,
  type ApiErrorMap,
} from '../../../lib/api';
import { useArtistOnboarding } from './ArtistOnboardingContext';

const SocialMediaInfo = ({ onNext }: OnboardingStepProps) => {
  const { artistId, applyEnvelope } = useArtistOnboarding();
  const [formState, setFormState] = useState({
    instagram: '',
    twitter: '',
    facebook: '',
    youtube: '',
    website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ApiErrorMap | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors(null);

    const payload: Record<string, string> = { artist_id: artistId };
    Object.entries(formState).forEach(([key, value]) => {
      if (value) {
        payload[key] = value;
      }
    });

    try {
      const response = await completeArtistSocial(payload);
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
        Share the social profiles that best represent your artist brand. These links help Zamio enrich your analytics and keep
        supporters updated on your releases.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-slate-200">Instagram</span>
          <input
            name="instagram"
            value={formState.instagram}
            onChange={handleChange}
            className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
            placeholder="https://instagram.com/yourhandle"
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-slate-200">Twitter / X</span>
          <input
            name="twitter"
            value={formState.twitter}
            onChange={handleChange}
            className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
            placeholder="https://twitter.com/yourhandle"
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-slate-200">Facebook Page</span>
          <input
            name="facebook"
            value={formState.facebook}
            onChange={handleChange}
            className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
            placeholder="https://facebook.com/yourpage"
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-slate-200">YouTube Channel</span>
          <input
            name="youtube"
            value={formState.youtube}
            onChange={handleChange}
            className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
            placeholder="https://youtube.com/@channel"
          />
        </label>
      </div>

      <label className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-slate-200">Website (optional)</span>
        <input
          name="website"
          value={formState.website}
          onChange={handleChange}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
          placeholder="https://yourwebsite.com"
        />
      </label>

      {errors && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <p className="font-medium">We couldn't save those links yet:</p>
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

export default SocialMediaInfo;
