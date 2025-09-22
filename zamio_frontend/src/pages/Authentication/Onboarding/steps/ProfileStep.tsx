import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PhotoIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../../contexts/ThemeContext';
import { OnboardingStepProps } from '../../../../components/onboarding/OnboardingWizard';
import api from '../../../../lib/api';
import { getArtistId } from '../../../../lib/auth';

interface ProfileData {
  bio: string;
  country: string;
  region: string;
  photo: File | null;
}

const ProfileStep: React.FC<OnboardingStepProps> = ({ onNext, onBack }) => {
  const { theme } = useTheme();
  const [profileData, setProfileData] = useState<ProfileData>({
    bio: '',
    country: '',
    region: '',
    photo: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Load existing profile data if available
    loadExistingProfile();
  }, []);

  useEffect(() => {
    // Real-time validation
    validateFields();
  }, [profileData]);

  const loadExistingProfile = async () => {
    try {
      const response = await api.get(`api/accounts/artist-onboarding-status/${getArtistId()}/`);
      const data = response.data.data;
      
      // Pre-populate fields if they exist
      if (data.required_fields?.profile_details) {
        // You would load actual profile data here
        // For now, we'll start with empty fields
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const validateFields = () => {
    const newValidation: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};

    // Bio validation
    if (profileData.bio.trim().length >= 50) {
      newValidation.bio = true;
    } else if (profileData.bio.trim().length > 0) {
      newErrors.bio = 'Bio should be at least 50 characters long';
    }

    // Country validation
    if (profileData.country.trim().length > 0) {
      newValidation.country = true;
    }

    // Region validation
    if (profileData.region.trim().length > 0) {
      newValidation.region = true;
    }

    // Photo validation
    if (profileData.photo) {
      newValidation.photo = true;
    }

    setValidationStatus(newValidation);
    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Image size should be less than 5MB' }));
        return;
      }

      setProfileData(prev => ({ ...prev, photo: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setErrors(prev => ({ ...prev, photo: '' }));
    } else {
      setErrors(prev => ({ ...prev, photo: 'Please select a valid image file' }));
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['bio', 'country', 'region', 'photo'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'photo') return !profileData.photo;
      return !profileData[field as keyof ProfileData];
    });

    if (missingFields.length > 0) {
      const newErrors: Record<string, string> = {};
      missingFields.forEach(field => {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('artist_id', getArtistId());
      formData.append('bio', profileData.bio);
      formData.append('country', profileData.country);
      formData.append('region', profileData.region);
      if (profileData.photo) {
        formData.append('photo', profileData.photo);
      }

      await api.post('api/accounts/complete-artist-profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update onboarding status
      await api.post('api/accounts/update-onboarding-status/', {
        artist_id: getArtistId(),
        step: 'profile',
        completed: true,
      });

      onNext();
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorData = error?.response?.data;
      if (errorData?.errors) {
        setErrors(errorData.errors);
      } else {
        setErrors({ general: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return validationStatus.bio && validationStatus.country && 
           validationStatus.region && validationStatus.photo;
  };

  const getFieldIcon = (field: string) => {
    if (validationStatus[field]) {
      return <CheckCircleIcon className="w-5 h-5" style={{ color: theme.colors.success }} />;
    } else if (errors[field]) {
      return <ExclamationTriangleIcon className="w-5 h-5" style={{ color: theme.colors.error }} />;
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
             style={{ backgroundColor: theme.colors.primary + '20' }}>
          <UserIcon className="w-8 h-8" style={{ color: theme.colors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
          Complete Your Profile
        </h2>
        <p style={{ color: theme.colors.textSecondary }}>
          Tell us about yourself to create a compelling artist profile
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Bio Field */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
            Artist Bio *
            {getFieldIcon('bio')}
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell your story... What makes you unique as an artist? What's your musical journey?"
            rows={4}
            className="w-full px-4 py-3 rounded-lg border transition-colors"
            style={{ 
              backgroundColor: theme.colors.surface,
              borderColor: errors.bio ? theme.colors.error : theme.colors.border,
              color: theme.colors.text
            }}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
              {profileData.bio.length}/500 characters (minimum 50)
            </span>
            {errors.bio && (
              <span className="text-xs" style={{ color: theme.colors.error }}>
                {errors.bio}
              </span>
            )}
          </div>
        </div>

        {/* Country and Region */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Country *
              {getFieldIcon('country')}
            </label>
            <input
              type="text"
              value={profileData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="e.g., Ghana"
              className="w-full px-4 py-3 rounded-lg border transition-colors"
              style={{ 
                backgroundColor: theme.colors.surface,
                borderColor: errors.country ? theme.colors.error : theme.colors.border,
                color: theme.colors.text
              }}
            />
            {errors.country && (
              <span className="text-xs mt-1" style={{ color: theme.colors.error }}>
                {errors.country}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
              Region/City *
              {getFieldIcon('region')}
            </label>
            <input
              type="text"
              value={profileData.region}
              onChange={(e) => handleInputChange('region', e.target.value)}
              placeholder="e.g., Greater Accra"
              className="w-full px-4 py-3 rounded-lg border transition-colors"
              style={{ 
                backgroundColor: theme.colors.surface,
                borderColor: errors.region ? theme.colors.error : theme.colors.border,
                color: theme.colors.text
              }}
            />
            {errors.region && (
              <span className="text-xs mt-1" style={{ color: theme.colors.error }}>
                {errors.region}
              </span>
            )}
          </div>
        </div>

        {/* Profile Photo */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
            Profile Photo *
            {getFieldIcon('photo')}
          </label>
          
          <div className="flex items-start space-x-4">
            {/* Photo Preview */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed overflow-hidden"
                   style={{ borderColor: theme.colors.border }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                       style={{ backgroundColor: theme.colors.surface }}>
                    <PhotoIcon className="w-8 h-8" style={{ color: theme.colors.textSecondary }} />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Area */}
            <div className="flex-1">
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed rounded-lg p-4 text-center transition-colors hover:bg-opacity-50"
                     style={{ 
                       borderColor: theme.colors.border,
                       backgroundColor: theme.colors.surface + '50'
                     }}>
                  <PhotoIcon className="w-8 h-8 mx-auto mb-2" style={{ color: theme.colors.textSecondary }} />
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                    JPG, PNG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {errors.photo && (
                <p className="text-xs mt-1" style={{ color: theme.colors.error }}>
                  {errors.photo}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="p-4 rounded-lg border-l-4"
               style={{ 
                 backgroundColor: theme.colors.error + '10',
                 borderLeftColor: theme.colors.error
               }}>
            <p className="text-sm" style={{ color: theme.colors.error }}>
              {errors.general}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg border font-medium transition-colors"
            style={{ 
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary
            }}
          >
            Back
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!isFormValid() || loading}
          className="px-8 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
          style={{ 
            backgroundColor: isFormValid() ? theme.colors.primary : theme.colors.textSecondary
          }}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default ProfileStep;