import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Save,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Monitor,
  Sun,
  Moon,
  Users,
  FileText,
  DollarSign,
  Building,
  Edit,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { publisherSettingsService } from '../../services/publisherSettingsService';
import toast from 'react-hot-toast';

interface PublisherPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  artist_activity_alerts: boolean;
  contract_notifications: boolean;
  royalty_alerts: boolean;
  payment_notifications: boolean;
  dispute_notifications: boolean;
  compliance_alerts: boolean;
  sound_notifications: boolean;
  theme_preference: 'light' | 'dark';
  language: string;
  timezone: string;
  auto_refresh_dashboard: boolean;
  session_timeout: number;
}

interface ArtistManagementSettings {
  auto_approve_artists: boolean;
  require_contract_approval: boolean;
  artist_onboarding_notifications: boolean;
  track_upload_notifications: boolean;
  artist_verification_required: boolean;
  allow_artist_self_registration: boolean;
  artist_data_sharing_consent: boolean;
  artist_communication_preferences: 'email' | 'sms' | 'both';
}

interface ContractRoyaltySettings {
  default_royalty_split: number;
  auto_calculate_splits: boolean;
  contract_template_enabled: boolean;
  require_digital_signatures: boolean;
  contract_expiry_notifications: boolean;
  royalty_calculation_method: 'gross' | 'net';
  minimum_payout_threshold: number;
  payout_frequency: 'weekly' | 'monthly' | 'quarterly';
  currency_preference: string;
  tax_withholding_enabled: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    'account' | 'notifications' | 'artists' | 'contracts' | 'appearance'
  >('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Account form state
  const [accountData, setAccountData] = useState({
    email: '',
    phone: '',
    company_name: '',
    first_name: '',
    last_name: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Publisher preferences state
  const [preferences, setPreferences] = useState<PublisherPreferences>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    artist_activity_alerts: true,
    contract_notifications: true,
    royalty_alerts: true,
    payment_notifications: true,
    dispute_notifications: true,
    compliance_alerts: true,
    sound_notifications: true,
    theme_preference: 'light',
    language: 'en',
    timezone: 'UTC',
    auto_refresh_dashboard: true,
    session_timeout: 30,
  });

  // Artist management settings state
  const [artistSettings, setArtistSettings] =
    useState<ArtistManagementSettings>({
      auto_approve_artists: false,
      require_contract_approval: true,
      artist_onboarding_notifications: true,
      track_upload_notifications: true,
      artist_verification_required: true,
      allow_artist_self_registration: false,
      artist_data_sharing_consent: true,
      artist_communication_preferences: 'email',
    });

  // Contract and royalty settings state
  const [contractSettings, setContractSettings] =
    useState<ContractRoyaltySettings>({
      default_royalty_split: 50,
      auto_calculate_splits: true,
      contract_template_enabled: true,
      require_digital_signatures: true,
      contract_expiry_notifications: true,
      royalty_calculation_method: 'net',
      minimum_payout_threshold: 100,
      payout_frequency: 'monthly',
      currency_preference: 'USD',
      tax_withholding_enabled: false,
    });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Load profile data
      try {
        const profileData = await publisherSettingsService.getProfile();
        setAccountData((prev) => ({
          ...prev,
          email: profileData.email || '',
          phone: profileData.phone || '',
          company_name: profileData.company_name || '',
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
        }));
      } catch (error) {
        console.warn('Failed to load profile:', error);
      }

      // Load preferences
      try {
        const prefsData = await publisherSettingsService.getPreferences();
        setPreferences((prev) => ({ ...prev, ...prefsData }));
        if (prefsData.theme_preference) {
          setTheme(prefsData.theme_preference);
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error);
      }

      // Load artist management settings
      try {
        const artistData = await publisherSettingsService.getArtistSettings();
        setArtistSettings((prev) => ({ ...prev, ...artistData }));
      } catch (error) {
        console.warn('Failed to load artist settings:', error);
      }

      // Load contract and royalty settings
      try {
        const contractData =
          await publisherSettingsService.getContractSettings();
        setContractSettings((prev) => ({ ...prev, ...contractData }));
      } catch (error) {
        console.warn('Failed to load contract settings:', error);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async () => {
    try {
      setSaving(true);

      if (
        accountData.new_password &&
        accountData.new_password !== accountData.confirm_password
      ) {
        throw new Error('Passwords do not match');
      }

      const payload: any = {
        email: accountData.email,
        phone: accountData.phone,
        company_name: accountData.company_name,
        first_name: accountData.first_name,
        last_name: accountData.last_name,
      };

      if (accountData.new_password) {
        payload.current_password = accountData.current_password;
        payload.new_password = accountData.new_password;
      }

      await publisherSettingsService.updateProfile(payload);

      // Clear password fields
      setAccountData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));

      toast.success('Account settings updated successfully');
    } catch (error: any) {
      console.error('Failed to update account:', error);
      toast.error(error.message || 'Failed to update account settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<PublisherPreferences>,
  ) => {
    try {
      setSaving(true);
      const updatedPrefs = { ...preferences, ...newPreferences };
      setPreferences(updatedPrefs);

      if (newPreferences.theme_preference) {
        setTheme(newPreferences.theme_preference);
      }

      await publisherSettingsService.updatePreferences(newPreferences);
      toast.success('Preferences updated successfully');
    } catch (error: any) {
      setPreferences(preferences);
      console.error('Failed to update preferences:', error);
      toast.error(error.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateArtistSettings = async (
    newSettings: Partial<ArtistManagementSettings>,
  ) => {
    try {
      setSaving(true);
      const updatedSettings = { ...artistSettings, ...newSettings };
      setArtistSettings(updatedSettings);

      await publisherSettingsService.updateArtistSettings(newSettings);
      toast.success('Artist management settings updated successfully');
    } catch (error: any) {
      setArtistSettings(artistSettings);
      console.error('Failed to update artist settings:', error);
      toast.error(error.message || 'Failed to update artist settings');
    } finally {
      setSaving(false);
    }
  };

  const updateContractSettings = async (
    newSettings: Partial<ContractRoyaltySettings>,
  ) => {
    try {
      setSaving(true);
      const updatedSettings = { ...contractSettings, ...newSettings };
      setContractSettings(updatedSettings);

      await publisherSettingsService.updateContractSettings(newSettings);
      toast.success('Contract and royalty settings updated successfully');
    } catch (error: any) {
      setContractSettings(contractSettings);
      console.error('Failed to update contract settings:', error);
      toast.error(error.message || 'Failed to update contract settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'artists', label: 'Artist Management', icon: Users },
    { id: 'contracts', label: 'Contracts & Royalties', icon: FileText },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
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
          Publisher Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your publisher account, artist preferences, and contract
          settings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
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
                    Publisher Account Information
                  </h2>
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Building className="w-4 h-4 inline mr-2" />
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={accountData.company_name}
                        onChange={(e) =>
                          setAccountData((prev) => ({
                            ...prev,
                            company_name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        placeholder="Your Publishing Company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={accountData.email}
                        onChange={(e) =>
                          setAccountData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        placeholder="publisher@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={accountData.first_name}
                        onChange={(e) =>
                          setAccountData((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        placeholder="First name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={accountData.last_name}
                        onChange={(e) =>
                          setAccountData((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={accountData.phone}
                      onChange={(e) =>
                        setAccountData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      placeholder="+1 (555) 123-4567"
                    />
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
                            value={accountData.current_password}
                            onChange={(e) =>
                              setAccountData((prev) => ({
                                ...prev,
                                current_password: e.target.value,
                              }))
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
                              value={accountData.new_password}
                              onChange={(e) =>
                                setAccountData((prev) => ({
                                  ...prev,
                                  new_password: e.target.value,
                                }))
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
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={accountData.confirm_password}
                              onChange={(e) =>
                                setAccountData((prev) => ({
                                  ...prev,
                                  confirm_password: e.target.value,
                                }))
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
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={updateAccount}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Publisher Notification Preferences
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure how you want to receive notifications about artist
                  activities, contracts, and royalties.
                </p>

                <div className="space-y-6">
                  {/* Artist & Contract Notifications */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Artist & Contract Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'artist_activity_alerts',
                          label: 'Artist activity alerts',
                          description:
                            'Notifications about artist uploads, profile changes, and activities',
                        },
                        {
                          key: 'contract_notifications',
                          label: 'Contract notifications',
                          description:
                            'Alerts about contract signings, renewals, and expirations',
                        },
                        {
                          key: 'dispute_notifications',
                          label: 'Dispute notifications',
                          description:
                            'Notifications about disputes involving your artists',
                        },
                        {
                          key: 'compliance_alerts',
                          label: 'Compliance alerts',
                          description:
                            'Alerts about licensing and regulatory compliance issues',
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
                                    item.key as keyof PublisherPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[
                                  item.key as keyof PublisherPreferences
                                ]
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
                                    item.key as keyof PublisherPreferences
                                  ]
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

                  {/* Financial Notifications */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Financial Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'royalty_alerts',
                          label: 'Royalty alerts',
                          description:
                            'Notifications about new royalty calculations and distributions',
                        },
                        {
                          key: 'payment_notifications',
                          label: 'Payment notifications',
                          description:
                            'Alerts about payment processing and payout status',
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
                                    item.key as keyof PublisherPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[
                                  item.key as keyof PublisherPreferences
                                ]
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
                                    item.key as keyof PublisherPreferences
                                  ]
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

                  {/* Communication Preferences */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Communication Preferences
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'email_notifications',
                          label: 'Email notifications',
                          description: 'Receive notifications via email',
                        },
                        {
                          key: 'sms_notifications',
                          label: 'SMS notifications',
                          description: 'Receive critical alerts via SMS',
                        },
                        {
                          key: 'push_notifications',
                          label: 'Push notifications',
                          description: 'Browser push notifications',
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
                                    item.key as keyof PublisherPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[
                                  item.key as keyof PublisherPreferences
                                ]
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
                                    item.key as keyof PublisherPreferences
                                  ]
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
                </div>
              </div>
            </div>
          )}

          {activeTab === 'artists' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Artist Management Preferences
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure how you want to manage your artists, onboarding
                  processes, and data sharing.
                </p>

                <div className="space-y-6">
                  {/* Artist Onboarding */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Artist Onboarding & Approval
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'auto_approve_artists',
                          label: 'Auto-approve new artists',
                          description:
                            'Automatically approve artist applications without manual review',
                        },
                        {
                          key: 'require_contract_approval',
                          label: 'Require contract approval',
                          description:
                            'Artists must have signed contracts before accessing features',
                        },
                        {
                          key: 'artist_verification_required',
                          label: 'Artist verification required',
                          description:
                            'Require identity verification for all new artists',
                        },
                        {
                          key: 'allow_artist_self_registration',
                          label: 'Allow artist self-registration',
                          description:
                            'Artists can register themselves without invitation',
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
                              updateArtistSettings({
                                [item.key]:
                                  !artistSettings[
                                    item.key as keyof ArtistManagementSettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                artistSettings[
                                  item.key as keyof ArtistManagementSettings
                                ]
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
                                  artistSettings[
                                    item.key as keyof ArtistManagementSettings
                                  ]
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

                  {/* Artist Activity Monitoring */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Activity Monitoring
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'artist_onboarding_notifications',
                          label: 'Artist onboarding notifications',
                          description:
                            'Get notified when artists complete onboarding steps',
                        },
                        {
                          key: 'track_upload_notifications',
                          label: 'Track upload notifications',
                          description:
                            'Receive alerts when artists upload new tracks',
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
                              updateArtistSettings({
                                [item.key]:
                                  !artistSettings[
                                    item.key as keyof ArtistManagementSettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                artistSettings[
                                  item.key as keyof ArtistManagementSettings
                                ]
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
                                  artistSettings[
                                    item.key as keyof ArtistManagementSettings
                                  ]
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

                  {/* Data Sharing & Communication */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Data Sharing & Communication
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Artist data sharing consent
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Require explicit consent before sharing artist data
                            with third parties
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateArtistSettings({
                              artist_data_sharing_consent:
                                !artistSettings.artist_data_sharing_consent,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              artistSettings.artist_data_sharing_consent
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
                                artistSettings.artist_data_sharing_consent
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Artist communication preferences
                        </label>
                        <select
                          value={
                            artistSettings.artist_communication_preferences
                          }
                          onChange={(e) =>
                            updateArtistSettings({
                              artist_communication_preferences: e.target
                                .value as 'email' | 'sms' | 'both',
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="email">Email only</option>
                          <option value="sms">SMS only</option>
                          <option value="both">Both email and SMS</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Default communication method for artist notifications
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Contract & Royalty Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure default contract terms, royalty calculations, and
                  payout preferences.
                </p>

                <div className="space-y-6">
                  {/* Contract Management */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Contract Management
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: 'contract_template_enabled',
                          label: 'Use contract templates',
                          description:
                            'Enable standardized contract templates for new agreements',
                        },
                        {
                          key: 'require_digital_signatures',
                          label: 'Require digital signatures',
                          description:
                            'All contracts must be digitally signed to be valid',
                        },
                        {
                          key: 'contract_expiry_notifications',
                          label: 'Contract expiry notifications',
                          description: 'Get notified before contracts expire',
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
                              updateContractSettings({
                                [item.key]:
                                  !contractSettings[
                                    item.key as keyof ContractRoyaltySettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                contractSettings[
                                  item.key as keyof ContractRoyaltySettings
                                ]
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
                                  contractSettings[
                                    item.key as keyof ContractRoyaltySettings
                                  ]
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

                  {/* Royalty Calculation */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Royalty Calculation
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Default royalty split (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={contractSettings.default_royalty_split}
                            onChange={(e) =>
                              updateContractSettings({
                                default_royalty_split:
                                  parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder="50"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Default publisher share percentage for new contracts
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Royalty calculation method
                          </label>
                          <select
                            value={contractSettings.royalty_calculation_method}
                            onChange={(e) =>
                              updateContractSettings({
                                royalty_calculation_method: e.target.value as
                                  | 'gross'
                                  | 'net',
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          >
                            <option value="gross">Gross revenue</option>
                            <option value="net">
                              Net revenue (after expenses)
                            </option>
                          </select>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            How royalties are calculated from revenue
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Auto-calculate splits
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically calculate royalty splits based on
                            contract terms
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateContractSettings({
                              auto_calculate_splits:
                                !contractSettings.auto_calculate_splits,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              contractSettings.auto_calculate_splits
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
                                contractSettings.auto_calculate_splits
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payout Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Payout Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum payout threshold
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={contractSettings.minimum_payout_threshold}
                            onChange={(e) =>
                              updateContractSettings({
                                minimum_payout_threshold:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            placeholder="100"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Minimum amount before payout is processed
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Payout frequency
                          </label>
                          <select
                            value={contractSettings.payout_frequency}
                            onChange={(e) =>
                              updateContractSettings({
                                payout_frequency: e.target.value as
                                  | 'weekly'
                                  | 'monthly'
                                  | 'quarterly',
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                          </select>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            How often payouts are processed
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Currency preference
                          </label>
                          <select
                            value={contractSettings.currency_preference}
                            onChange={(e) =>
                              updateContractSettings({
                                currency_preference: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="CAD">CAD - Canadian Dollar</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                          </select>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Default currency for payouts
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Tax withholding enabled
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically withhold taxes from royalty payments
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateContractSettings({
                              tax_withholding_enabled:
                                !contractSettings.tax_withholding_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              contractSettings.tax_withholding_enabled
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
                                contractSettings.tax_withholding_enabled
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

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Appearance Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Customize the look and feel of your publisher dashboard.
                </p>

                <div className="space-y-6">
                  {/* Theme Selection */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Theme Preference
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          updatePreferences({ theme_preference: 'light' })
                        }
                        className={`
                          p-4 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center space-x-2
                          ${
                            preferences.theme_preference === 'light'
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <Sun className="w-5 h-5" />
                        <span className="font-medium">Light Mode</span>
                      </button>
                      <button
                        onClick={() =>
                          updatePreferences({ theme_preference: 'dark' })
                        }
                        className={`
                          p-4 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center space-x-2
                          ${
                            preferences.theme_preference === 'dark'
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <Moon className="w-5 h-5" />
                        <span className="font-medium">Dark Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Dashboard Preferences */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Dashboard Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Auto-refresh dashboard
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically refresh dashboard data every few
                            minutes
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updatePreferences({
                              auto_refresh_dashboard:
                                !preferences.auto_refresh_dashboard,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              preferences.auto_refresh_dashboard
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
                                preferences.auto_refresh_dashboard
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

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
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
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
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">
                              Eastern Time
                            </option>
                            <option value="America/Chicago">
                              Central Time
                            </option>
                            <option value="America/Denver">
                              Mountain Time
                            </option>
                            <option value="America/Los_Angeles">
                              Pacific Time
                            </option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Paris">Paris</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Session timeout (minutes)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="480"
                          value={preferences.session_timeout}
                          onChange={(e) =>
                            updatePreferences({
                              session_timeout: parseInt(e.target.value) || 30,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          placeholder="30"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Automatically log out after this many minutes of
                          inactivity
                        </p>
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
