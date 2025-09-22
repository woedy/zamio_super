import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShareIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../contexts/ThemeContext';
import { OnboardingStepProps } from '../../../components/onboarding/OnboardingWizard';
import { getArtistId } from '../../../lib/auth';
import api from '../../../lib/api';
import ButtonLoader from '../../../common/button_loader';

interface SocialMediaInfoProps extends OnboardingStepProps {}

const SocialMediaInfo: React.FC<SocialMediaInfoProps> = ({ onNext, onSkip }) => {
  const { theme } = useTheme();
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [spotify, setSpotify] = useState('');
  const [website, setWebsite] = useState('');

  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateUrl = (url: string) => {
    if (!url) return true; // Empty URLs are allowed
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setInputError('');
    
    // Validate URLs if provided
    const urlFields = [
      { name: 'Facebook', value: facebook },
      { name: 'Twitter', value: twitter },
      { name: 'Instagram', value: instagram },
      { name: 'YouTube', value: youtube },
      { name: 'Spotify', value: spotify },
      { name: 'Website', value: website },
    ];

    for (const field of urlFields) {
      if (field.value && !validateUrl(field.value)) {
        setInputError(`Please enter a valid ${field.name} URL`);
        return;
      }
    }

    const formData = new FormData();
    formData.append('artist_id', getArtistId());
    if (facebook) formData.append('facebook', facebook);
    if (twitter) formData.append('twitter', twitter);
    if (instagram) formData.append('instagram', instagram);
    if (youtube) formData.append('youtube', youtube);
    if (spotify) formData.append('spotify_url', spotify);
    if (website) formData.append('website', website);

    try {
      setLoading(true);
      const response = await api.post('api/accounts/complete-artist-social/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status >= 200 && response.status < 300) {
        onNext();
      }
    } catch (error: any) {
      const data = error?.response?.data;
      if (data?.errors) {
        const errorMessages = Object.values(data.errors).flat() as string[];
        setInputError(errorMessages.join('\n'));
      } else {
        setInputError(data?.message || 'Failed to update social media information');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (onSkip) {
      try {
        await api.post('api/accounts/skip-artist-onboarding/', {
          artist_id: getArtistId(),
          step: 'social-media',
        });
      } catch (err) {
        // Non-blocking error
      } finally {
        onSkip();
      }
    }
  };





  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
             style={{ backgroundColor: theme.colors.primary + '20' }}>
          <ShareIcon className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Connect Your Social Media
        </h2>
        <p style={{ color: theme.colors.textSecondary }}>
          Help fans discover your music by connecting your social media accounts and streaming platforms.
        </p>
      </div>

      {inputError && (
        <div
          className="mb-6 p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: theme.colors.error + '10',
            borderLeftColor: theme.colors.error
          }}
        >
          <p className="text-sm" style={{ color: theme.colors.error }}>
            {inputError}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Social Media Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Facebook Profile/Page
            </label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/yourprofile"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Twitter/X Profile
            </label>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Instagram Profile
            </label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              YouTube Channel
            </label>
            <input
              type="url"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="https://youtube.com/c/yourchannel"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Spotify Artist Profile
            </label>
            <input
              type="url"
              value={spotify}
              onChange={(e) => setSpotify(e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Official Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{ 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text
              }}
              disabled={loading}
            />
          </div>
        </div>

        {/* Info Box */}
        <div
          className="p-4 rounded-lg border-l-4"
          style={{ 
            backgroundColor: theme.colors.info + '10',
            borderLeftColor: theme.colors.info
          }}
        >
          <div className="flex items-start space-x-2">
            <InformationCircleIcon className="w-5 h-5 mt-0.5" style={{ color: theme.colors.info }} />
            <div>
              <h4 className="text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                Why connect social media?
              </h4>
              <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                Connected social media accounts help fans discover your music and provide additional 
                verification for your artist profile. All fields are optional and can be updated later.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mt-8">
        {onSkip && (
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-6 rounded-lg font-medium border transition-colors"
            style={{ 
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary,
              backgroundColor: 'transparent'
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
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialMediaInfo;
