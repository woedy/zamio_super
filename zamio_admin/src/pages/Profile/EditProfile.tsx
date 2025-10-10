import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Upload,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
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
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const EditProfile: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { handleApiError, showSuccessMessage } = useApiErrorHandler();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
    location: '',
    photo: null,
    currentPhotoUrl: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/api/accounts/profile/');
      if (response.data.success) {
        const userData = response.data.data;
        setProfileData(prev => ({
          ...prev,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.country || '',
          location: userData.location || '',
          currentPhotoUrl: userData.photo || '',
        }));
        
        if (userData.photo) {
          setImagePreview(userData.photo);
        }
      }
    } catch (error) {
      handleApiError(error, 'Failed to load profile data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!profileData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!profileData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (profileData.new_password) {
      if (!profileData.current_password) {
        newErrors.current_password = 'Current password is required to change password';
      }
      if (profileData.new_password.length < 8) {
        newErrors.new_password = 'New password must be at least 8 characters long';
      }
      if (profileData.new_password !== profileData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      
      if (profileData.new_password) {
        formData.append('current_password', profileData.current_password);
        formData.append('new_password', profileData.new_password);
      }

      const response = await api.patch('/api/accounts/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        showSuccessMessage('Profile updated successfully!');
        
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: '',
          photo: null,
        }));
        
        // Update photo URL if new photo was uploaded
        if (response.data.data?.photo) {
          setProfileData(prev => ({
            ...prev,
            currentPhotoUrl: response.data.data.photo,
          }));
        }
      }
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        handleApiError(error, 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Admin Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your personal information and account settings
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Profile Photo */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Profile Photo
            </label>
            
            <div className="flex items-start space-x-6">
              {/* Photo Preview */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Area */}
              <div className="flex-1">
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
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
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {errors.photo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.first_name 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                required
              />
              {errors.first_name && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.first_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.last_name 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                required
              />
              {errors.last_name && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.last_name}
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                required
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <input
                type="text"
                value={profileData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="e.g., United States"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="City, State"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Change Password
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Leave blank if you don't want to change your password
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={profileData.current_password}
                    onChange={(e) => handleInputChange('current_password', e.target.value)}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      errors.current_password 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {errors.current_password}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={profileData.new_password}
                      onChange={(e) => handleInputChange('new_password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                        errors.new_password 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.new_password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={profileData.confirm_password}
                      onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                        errors.confirm_password 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:border-primary'
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {errors.confirm_password}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;