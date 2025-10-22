import { FormEvent, useState } from 'react';

import {
  completeArtistProfile,
  type ApiErrorMap,
} from '../../../../lib/api';
import { useArtistOnboarding } from '../ArtistOnboardingContext';
import type { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';

const defaultForm = {
  bio: '',
  country: '',
  region: '',
  location: '',
};

const ProfileStep = ({ onNext }: OnboardingStepProps) => {
  const { artistId, applyEnvelope } = useArtistOnboarding();
  const [formState, setFormState] = useState(defaultForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ApiErrorMap | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhoto(file ?? null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors(null);
    setFeedback(null);

    const payload = new FormData();
    payload.append('artist_id', artistId);
    Object.entries(formState).forEach(([key, value]) => {
      if (value) {
        payload.append(key, value);
      }
    });
    if (photo) {
      payload.append('photo', photo);
    }

    try {
      const response = await completeArtistProfile(payload);
      applyEnvelope(response);
      setFeedback('Profile saved successfully.');
      onNext?.();
    } catch (err) {
      const apiErrors = (err as { response?: { data?: { errors?: ApiErrorMap; message?: string } } }).response?.data;
      setErrors(apiErrors?.errors ?? null);
      setFeedback(apiErrors?.message ?? 'Unable to save your profile. Please review the fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-slate-300">
        Provide a short bio and location so we can tailor royalty insights and communications for you. You can update this
        information later in your profile settings.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-slate-200">Country</span>
          <input
            name="country"
            value={formState.country}
            onChange={handleChange}
            className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
            placeholder="e.g. Ghana"
          />
        </label>
        <label className="flex flex-col space-y-2">
          <span className="text-sm font-medium text-slate-200">Region</span>
          <input
            name="region"
            value={formState.region}
            onChange={handleChange}
            className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
            placeholder="e.g. Greater Accra"
          />
        </label>
      </div>

      <label className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-slate-200">City / Location</span>
        <input
          name="location"
          value={formState.location}
          onChange={handleChange}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
          placeholder="Where are you based?"
        />
      </label>

      <label className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-slate-200">Artist Bio</span>
        <textarea
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          rows={4}
          className="rounded-lg border border-white/20 bg-slate-900/60 px-4 py-2 text-white focus:border-indigo-400 focus:outline-none"
          placeholder="Tell us about your music story..."
        />
      </label>

      <label className="flex flex-col space-y-2">
        <span className="text-sm font-medium text-slate-200">Profile Photo (optional)</span>
        <input
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="text-sm text-slate-300"
        />
      </label>

      {errors && (
        <div className="rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <p className="font-medium">Please fix the issues below:</p>
          <ul className="mt-2 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>{Array.isArray(message) ? message.join(', ') : message}</li>
            ))}
          </ul>
        </div>
      )}

      {feedback && !errors && (
        <div className="rounded border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {feedback}
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

export default ProfileStep;
