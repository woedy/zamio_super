import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Globe,
  Lock,
  Monitor,
  Sun,
  Moon,
  Smartphone,
  Volume2,
  CheckCircle,
  Edit,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFormWithValidation } from '../../hooks/useFormWithValidation';
import api from '../../lib/api';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';

interface UserPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  royalty_alerts: boolean;
  match_notifications: boolean;
  weekly_reports: boolean;
  privacy_profile_public: boolean;
  privacy_show_earnings: boolean;
  privacy_show_plays: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  sound_notifications: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { setPreference } = useTheme();
  const { handleApiError, showSuccessMessage } = useApiErrorHandler();
  const [activeTab, setActiveTab] = useState<
    'account' | 'notifications' | 'privacy' | 'theme'
  >('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form for account settings
  const accountForm = useFormWithValidation({
    initialValues: {
      email: '',
      phone: '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationRules: {
      email: { required: true, email: true },
      phone: { phone: true },
      new_password: {
        minLength: 8,
        custom: (value, allValues) => {
          if (value && !allValues.current_password) {
            return 'Current password is required to change password';
          }
          return null;
        },
      },
      confirm_password: {
        custom: (value, allValues) => {
          if (allValues.new_password && value !== allValues.new_password) {
            return 'Passwords do not match';
          }
          return null;
        },
      },
    },
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const payload: any = {
          email: values.email,
          phone: values.phone,
        };

        if (values.new_password) {
          payload.current_password = values.current_password;
          payload.new_password = values.new_password;
        }

        await api.patch('/api/accounts/profile/', payload);
        showSuccessMessage('Account settings updated successfully');

        // Clear password fields after successful update
        accountForm.setValue('current_password', '');
        accountForm.setValue('new_password', '');
        accountForm.setValue('confirm_password', '');
      } catch (error) {
        handleApiError(error, 'Failed to update account settings');
      } finally {
        setSaving(false);
      }
    },
  });

  // State for preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false,
    royalty_alerts: true,
    match_notifications: true,
    weekly_reports: true,
    privacy_profile_public: false,
    privacy_show_earnings: false,
    privacy_show_plays: true,
    theme_preference: 'system',
    language: 'en',
    timezone: 'UTC',
    sound_notifications: true,
  });

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      const [profileResponse, preferencesResponse] = await Promise.all([
        api.get('/api/accounts/profile/'),
        api
          .get('/api/accounts/user-preferences/')
          .catch(() => ({ data: { success: true, data: preferences } })),
      ]);

      if (profileResponse.data.success) {
        const userData = profileResponse.data.data;
        accountForm.setValue('email', userData.email || '');
        accountForm.setValue('phone', userData.phone || '');
      }

      if (preferencesResponse.data.success) {
        const userPrefs = preferencesResponse.data.data;
        setPreferences((prev) => ({ ...prev, ...userPrefs }));

        // Update theme preference
        if (userPrefs.theme_preference) {
          setPreference(userPrefs.theme_preference as 'light' | 'dark' | 'system');
        }
      }
    } catch (error) {
      handleApiError(error, 'Failed to load user settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>,
  ) => {
    try {
      setSaving(true);
      const updatedPrefs = { ...preferences, ...newPreferences };
      setPreferences(updatedPrefs);

      // Update theme preference immediately
      if (newPreferences.theme_preference) {
        setPreference(newPreferences.theme_preference as 'light' | 'dark' | 'system');
      }

      await api.patch('/api/accounts/user-preferences/', updatedPrefs);
      showSuccessMessage('Preferences updated successfully');
    } catch (error) {
      // Revert changes on error
      setPreferences(preferences);
      handleApiError(error, 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'theme', label: 'Appearance', icon: Palette },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and privacy settings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Account Information
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate('/edit-profile')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
                <form onSubmit={accountForm.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={accountForm.values.email}
                        onChange={(e) =>
                          accountForm.setValue('email', e.target.value)
                        }
                        onBlur={() => accountForm.setFieldTouched('email')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        placeholder="your.email@example.com"
                      />
                      {accountForm.hasFieldErrors('email') && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {accountForm.getFieldErrors('email')[0]?.message}
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
                        value={accountForm.values.phone}
                        onChange={(e) =>
                          accountForm.setValue('phone', e.target.value)
                        }
                        onBlur={() => accountForm.setFieldTouched('phone')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        placeholder="+1 (555) 123-4567"
                      />
                      {accountForm.hasFieldErrors('phone') && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {accountForm.getFieldErrors('phone')[0]?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={accountForm.values.current_password}
                            onChange={(e) =>
                              accountForm.setValue(
                                'current_password',
                                e.target.value,
                              )
                            }
                            onBlur={() =>
                              accountForm.setFieldTouched('current_password')
                            }
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={accountForm.values.new_password}
                              onChange={(e) =>
                                accountForm.setValue(
                                  'new_password',
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                accountForm.setFieldTouched('new_password')
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {accountForm.hasFieldErrors('new_password') && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {
                                accountForm.getFieldErrors('new_password')[0]
                                  ?.message
                              }
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={accountForm.values.confirm_password}
                              onChange={(e) =>
                                accountForm.setValue(
                                  'confirm_password',
                                  e.target.value,
                                )
                              }
                              onBlur={() =>
                                accountForm.setFieldTouched('confirm_password')
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {accountForm.hasFieldErrors('confirm_password') && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {
                                accountForm.getFieldErrors(
                                  'confirm_password',
                                )[0]?.message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving || accountForm.isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving || accountForm.isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Notification Preferences
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose how you want to be notified about important updates and
                  activities.
                </p>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'email_notifications',
                          label: 'General email notifications',
                          description: 'Receive important updates via email',
                        },
                        {
                          key: 'royalty_alerts',
                          label: 'Royalty alerts',
                          description:
                            'Get notified when new royalties are available',
                        },
                        {
                          key: 'match_notifications',
                          label: 'Match notifications',
                          description:
                            'Alerts when your music is detected on radio',
                        },
                        {
                          key: 'weekly_reports',
                          label: 'Weekly reports',
                          description:
                            'Summary of your music activity and earnings',
                        },
                        {
                          key: 'marketing_emails',
                          label: 'Marketing emails',
                          description:
                            'Updates about new features and promotions',
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              updatePreferences({
                                [item.key]:
                                  !preferences[
                                    item.key as keyof UserPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof UserPreferences]
                                  ? 'bg-primary'
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                                transition duration-200 ease-in-out
                                ${
                                  preferences[item.key as keyof UserPreferences]
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }
                              `}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Smartphone className="w-5 h-5 mr-2" />
                      Push Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'push_notifications',
                          label: 'Push notifications',
                          description: 'Receive notifications on your device',
                        },
                        {
                          key: 'sound_notifications',
                          label: 'Sound notifications',
                          description: 'Play sound with notifications',
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.label}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              updatePreferences({
                                [item.key]:
                                  !preferences[
                                    item.key as keyof UserPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof UserPreferences]
                                  ? 'bg-primary'
                                  : 'bg-gray-200 dark:bg-gray-600'
                              }
                            `}
                          >
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                                transition duration-200 ease-in-out
                                ${
                                  preferences[item.key as keyof UserPreferences]
                                    ? 'translate-x-5'
                                    : 'translate-x-0'
                                }
                              `}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Phone className="w-5 h-5 mr-2" />
                      SMS Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            SMS notifications
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Receive important alerts via text message
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updatePreferences({
                              sms_notifications: !preferences.sms_notifications,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              preferences.sms_notifications
                                ? 'bg-primary'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }
                          `}
                        >
                          <span
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                              transition duration-200 ease-in-out
                              ${
                                preferences.sms_notifications
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Privacy Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Control what information is visible to other users and how
                  your data is used.
                </p>

                <div className="space-y-6">
                  {/* Profile Privacy */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Profile Privacy
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'privacy_profile_public',
                          label: 'Public profile',
                          description:
                            'Make your profile visible to other users and search engines',
                          icon: Globe,
                        },
                        {
                          key: 'privacy_show_earnings',
                          label: 'Show earnings',
                          description:
                            'Display your royalty earnings on your public profile',
                          icon: Lock,
                        },
                        {
                          key: 'privacy_show_plays',
                          label: 'Show play counts',
                          description:
                            'Display how many times your tracks have been played',
                          icon: Volume2,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.key}
                            className="flex items-start justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start space-x-3">
                              <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <label className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.label}
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                updatePreferences({
                                  [item.key]:
                                    !preferences[
                                      item.key as keyof UserPreferences
                                    ],
                                })
                              }
                              className={`
                                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                ${
                                  preferences[item.key as keyof UserPreferences]
                                    ? 'bg-primary'
                                    : 'bg-gray-200 dark:bg-gray-600'
                                }
                              `}
                            >
                              <span
                                className={`
                                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                                  transition duration-200 ease-in-out
                                  ${
                                    preferences[
                                      item.key as keyof UserPreferences
                                    ]
                                      ? 'translate-x-5'
                                      : 'translate-x-0'
                                  }
                                `}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Data Usage */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Data & Analytics
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Analytics Collection
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Help us improve ZamIO by sharing anonymous usage
                              data
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Enabled
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              Data Retention
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Your data is retained according to our privacy
                              policy
                            </p>
                          </div>
                          <button className="text-xs text-primary hover:text-primary-dark">
                            View Policy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Appearance Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Customize how ZamIO looks and feels across all your devices.
                </p>

                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Theme Preference
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          value: 'light',
                          label: 'Light',
                          description: 'Clean and bright interface',
                          icon: Sun,
                          preview: 'bg-white border-gray-200',
                        },
                        {
                          value: 'dark',
                          label: 'Dark',
                          description: 'Easy on the eyes in low light',
                          icon: Moon,
                          preview: 'bg-gray-900 border-gray-700',
                        },
                        {
                          value: 'system',
                          label: 'System',
                          description: 'Matches your device settings',
                          icon: Monitor,
                          preview:
                            'bg-gradient-to-r from-white to-gray-900 border-gray-400',
                        },
                      ].map((themeOption) => {
                        const Icon = themeOption.icon;
                        const isSelected =
                          preferences.theme_preference === themeOption.value;

                        return (
                          <button
                            key={themeOption.value}
                            onClick={() =>
                              updatePreferences({
                                theme_preference: themeOption.value as
                                  | 'light'
                                  | 'dark'
                                  | 'system',
                              })
                            }
                            className={`
                              relative p-4 rounded-lg border-2 text-left transition-all duration-200
                              ${
                                isSelected
                                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div
                                className={`w-8 h-8 rounded-lg border-2 ${themeOption.preview}`}
                              ></div>
                              <Icon
                                className={`w-5 h-5 ${
                                  isSelected ? 'text-primary' : 'text-gray-400'
                                }`}
                              />
                            </div>
                            <h4
                              className={`font-medium ${
                                isSelected
                                  ? 'text-primary'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {themeOption.label}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {themeOption.description}
                            </p>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="w-5 h-5 text-primary" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language & Region */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Language & Region
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) =>
                            updatePreferences({ language: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="pt">Português</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Timezone
                        </label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) =>
                            updatePreferences({ timezone: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="UTC">
                            UTC (Coordinated Universal Time)
                          </option>
                          <option value="America/New_York">
                            Eastern Time (ET)
                          </option>
                          <option value="America/Chicago">
                            Central Time (CT)
                          </option>
                          <option value="America/Denver">
                            Mountain Time (MT)
                          </option>
                          <option value="America/Los_Angeles">
                            Pacific Time (PT)
                          </option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="Australia/Sydney">
                            Sydney (AEST)
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Current Theme Preview */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Current Theme Preview
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Sample Dashboard
                        </h4>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-3">
                          <div className="text-primary text-2xl font-bold">
                            1,234
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total Plays
                          </div>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                          <div className="text-green-600 dark:text-green-400 text-2xl font-bold">
                            $567
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Earnings
                          </div>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                          <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                            89
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Tracks
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
