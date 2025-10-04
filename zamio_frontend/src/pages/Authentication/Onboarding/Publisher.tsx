import React, { useEffect, useState } from 'react';
import { Building2, Info } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';
import api from '../../../lib/api';
import { getArtistId } from '../../../lib/auth';
import ButtonLoader from '../../../common/button_loader';

interface PublisherOption {
  publisher_id: string;
  company_name: string;
}

interface PublisherProps extends OnboardingStepProps {}

const Publisher: React.FC<PublisherProps> = ({ onNext, onSkip, onBack }) => {
  const { theme } = useTheme();
  const [publisherId, setPublisherId] = useState('');
  const [publishers, setPublishers] = useState<PublisherOption[]>([]);
  const [isSelfPublished, setIsSelfPublished] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPublishers = async () => {
      try {
        const response = await api.get('api/accounts/list-publishers/');
        const list = response?.data?.data?.publishers || [];
        setPublishers(list);
      } catch (error) {
        // Non blocking - we still allow manual selection/self publish
        console.warn('Failed to load publishers list:', error);
      }
    };

    loadPublishers();
  }, []);

  const handleSubmit = async () => {
    setInputError(null);

    if (!isSelfPublished && !publisherId) {
      setInputError('Select a publisher or mark yourself as self-published.');
      return;
    }

    const payload = new FormData();
    payload.append('artist_id', getArtistId());
    payload.append('self_publish', isSelfPublished ? 'true' : 'false');
    if (!isSelfPublished) {
      payload.append('publisher_id', publisherId);
    }

    try {
      setLoading(true);
      const response = await api.post('api/accounts/complete-artist-publisher/', payload);

      if (response.status >= 200 && response.status < 300) {
        await onNext();
      }
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.errors) {
        const messages = Object.values(data.errors).flat() as string[];
        setInputError(messages.join('\n'));
      } else {
        setInputError(data?.message || 'Failed to save publisher preference.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (onSkip) {
      await onSkip();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.colors.primary + '20' }}
        >
          <Building2 className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Publishing Preferences
        </h2>
        <p style={{ color: theme.colors.textSecondary }}>
          Tell us if you are partnering with a publisher or handling your catalog independently.
        </p>
      </div>

      {inputError && (
        <div
          className="mb-6 p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: theme.colors.error + '10',
            borderLeftColor: theme.colors.error,
          }}
        >
          <p className="text-sm" style={{ color: theme.colors.error }}>
            {inputError}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelfPublished}
              onChange={(e) => {
                setIsSelfPublished(e.target.checked);
                if (e.target.checked) {
                  setPublisherId('');
                }
              }}
              className="h-5 w-5 rounded border"
              style={{ borderColor: theme.colors.border }}
              disabled={loading}
            />
            <span className="text-sm font-medium" style={{ color: theme.colors.text }}>
              I distribute as a self-published artist
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
            Select Publisher
          </label>
          <select
            value={publisherId}
            onChange={(e) => setPublisherId(e.target.value)}
            disabled={isSelfPublished || loading}
            className="w-full px-4 py-3 rounded-lg border transition-colors"
            style={{
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
            }}
          >
            <option value="">Choose a publisher</option>
            {publishers.map((publisher) => (
              <option key={publisher.publisher_id} value={publisher.publisher_id}>
                {publisher.company_name}
              </option>
            ))}
          </select>
        </div>

        <div
          className="p-4 rounded-lg border-l-4"
          style={{
            backgroundColor: theme.colors.info + '10',
            borderLeftColor: theme.colors.info,
          }}
        >
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 mt-0.5" style={{ color: theme.colors.info }} />
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                Need a publisher?
              </h4>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                ZamIO has trusted publishing partners ready to help with global collections. Select one from the list or continue as self-published and update later.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mt-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg font-medium border transition-colors"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
              backgroundColor: 'transparent',
            }}
            disabled={loading}
          >
            Back
          </button>
        )}

        {onSkip && (
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-6 rounded-lg font-medium border transition-colors"
            style={{
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
              backgroundColor: 'transparent',
            }}
            disabled={loading}
          >
            Skip for Now
          </button>
        )}

        {loading ? (
          <div className="flex-1">
            <ButtonLoader />
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: theme.colors.primary }}
            disabled={loading}
          >
            Save & Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default Publisher;
