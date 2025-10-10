import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  PhotoIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import LocationSearch from '../../components/LocationSearch';
import api from '../../lib/api';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  location: string;
  photo: File | null;
  currentPhotoUrl: string;
}

const EditProfile: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    location: '',
    photo: null,
    currentPhotoUrl: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    // Real-time validation
    validateFields();
  }, [profileData]);

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/api/accounts/user-profile/');
      if (response.data.success) {
        const userData = response.data.data;
        setProfileData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.country || '',
          location: userData.location || '',
          photo: null,
          currentPhotoUrl: userData.photo || ''
        });
        
        if (userData.photo) {
          setImagePreview(userData.photo);
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setErrors({ general: 'Failed to load profile data' });
    } finally {
      setInitialLoading(false);
    }
  };

  const validateFields = () => {
    const newValidation: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};

    // First name validation
    if (profileData.first_name.trim().length > 0) {
      newValidation.first_name = true;
    }

    // Last name validation
    if (profileData.last_name.trim().length > 0) {
      newValidation.last_name = true;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(profileData.email)) {
      newValidation.email = true;
    } else if (profileData.email.length > 0) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional)
    if (profileData.phone.trim().length > 0) {
      newValidation.phone = true;
    }

    // Country validation (optional)
    if (profileData.country.trim().length > 0) {
      newValidation.country = true;
    }

    // Location validation (optional)
    if (profileData.location.trim().length > 0) {
      newValidation.location = true;
    }

    setValidationStatus(newValidation);
    setErrors(newErrors);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    setSuccessMessage(''); // Clear success message when user makes changes
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email'];
    const missingFields = requiredFields.filter(field => 
      !profileData[field as keyof ProfileData] || 
      String(profileData[field as keyof ProfileData]).trim() === ''
    );

    if (missingFields.length > 0) {
      const newErrors: Record<string, string> = {};
      missingFields.forEach(field => {
        newErrors[field] = `${field.replace('_', ' ').charAt(0).toUpperCase() + field.replace('_', ' ').slice(1)} is required`;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('email', profileData.email);
      formData.append('phone', profileData.phone);
      formData.append('country', profileData.country);
      formData.append('location', profileData.location);
      
      if (profileData.photo) {
        formData.append('photo', profileData.photo);
      }

      const response = await api.put('/api/accounts/user-profile/', formData);

      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        
        // Update local storage if photo was uploaded
        if (profileData.photo && response.data.data?.photo) {
          localStorage.setItem('photo', response.data.data.photo);
          // Dispatch custom event to notify other components of the update
          window.dispatchEvent(new CustomEvent('userDataUpdated'));
        }
        
        // Clear the photo file from state but keep the preview
        setProfileData(prev => ({ ...prev, photo: null }));
      }
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

  const getFieldIcon = (field: string) => {
    if (validationStatus[field]) {
      return <CheckCircleIcon className="w-5 h-5" style={{ color: theme.colors.success }} />;
    } else if (errors[field]) {
      return <ExclamationTriangleIcon className="w-5 h-5" style={{ color: theme.colors.error }} />;
    }
    return null;
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg border transition-colors"
            style={{ 
              borderColor: theme.colors.border,
              color: theme.colors.textSecondary
            }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: theme.colors.text }}>
              Edit Profile
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              Update your personal information and preferences
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg border-l-4"
               style={{ 
                 backgroundColor: theme.colors.success + '10',
                 borderLeftColor: theme.colors.success
               }}>
            <p className="text-sm" style={{ color: theme.colors.success }}>
              {successMessage}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border p-6" style={{ 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border
          }}>
            {/* Profile Photo */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-4" style={{ color: theme.colors.text }}>
                Profile Photo
                {getFieldIcon('photo')}
              </label>
              
              <div className="flex items-start space-x-6">
                {/* Photo Preview */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed overflow-hidden"
                       style={{ borderColor: theme.colors.border }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                           style={{ backgroundColor: theme.colors.surface }}>
                        <PhotoIcon className="w-12 h-12" style={{ color: theme.colors.textSecondary }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Area */}
                <div className="flex-1">
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors hover:bg-opacity-50"
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
                    <p className="text-xs mt-2" style={{ color: theme.colors.error }}>
                      {errors.photo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  First Name *
                  {getFieldIcon('first_name')}
                </label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.first_name ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text
                  }}
                  required
                />
                {errors.first_name && (
                  <span className="text-xs mt-1" style={{ color: theme.colors.error }}>
                    {errors.first_name}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Last Name *
                  {getFieldIcon('last_name')}
                </label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.last_name ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text
                  }}
                  required
                />
                {errors.last_name && (
                  <span className="text-xs mt-1" style={{ color: theme.colors.error }}>
                    {errors.last_name}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Email *
                  {getFieldIcon('email')}
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.email ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text
                  }}
                  required
                />
                {errors.email && (
                  <span className="text-xs mt-1" style={{ color: theme.colors.error }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Phone
                  {getFieldIcon('phone')}
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border transition-colors"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    borderColor: errors.phone ? theme.colors.error : theme.colors.border,
                    color: theme.colors.text
                  }}
                />
                {errors.phone && (
                  <span className="text-xs mt-1" style={{ color: theme.colors.error }}>
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                    Country
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
                    Location
                    {getFieldIcon('location')}
                  </label>
                  <LocationSearch
                    value={profileData.location}
                    onChange={(value) => handleInputChange('location', value)}
                    placeholder="Search for your location..."
                    error={errors.location}
                  />
                  <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                    This helps us provide location-relevant features
                  </p>
                </div>
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mt-6 p-4 rounded-lg border-l-4"
                   style={{ 
                     backgroundColor: theme.colors.error + '10',
                     borderLeftColor: theme.colors.error
                   }}>
                <p className="text-sm" style={{ color: theme.colors.error }}>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: theme.colors.primary
                }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;