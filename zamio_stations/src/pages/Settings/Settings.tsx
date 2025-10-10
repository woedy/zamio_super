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
  Globe,
  Lock,
  Monitor,
  Sun,
  Moon,
  Radio,
  Users,
  FileText,
  AlertTriangle,
  Volume2,
  Activity,
  Database,
  Edit,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { settingsService } from '../../services/settingsService';
import toast from 'react-hot-toast';

interface StationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  stream_alerts: boolean;
  compliance_alerts: boolean;
  staff_notifications: boolean;
  report_notifications: boolean;
  sound_notifications: boolean;
  theme_preference: 'light' | 'dark';
  language: string;
  timezone: string;
  auto_refresh_dashboard: boolean;
  session_timeout: number;
}

interface StreamMonitoringSettings {
  monitoring_enabled: boolean;
  stream_quality_alerts: boolean;
  silence_detection: boolean;
  silence_threshold_seconds: number;
  volume_monitoring: boolean;
  volume_threshold_db: number;
  metadata_extraction: boolean;
  fingerprinting_enabled: boolean;
  alert_frequency: 'immediate' | 'hourly' | 'daily';
  monitoring_schedule: string;
}

interface StaffManagementSettings {
  staff_access_logging: boolean;
  role_change_notifications: boolean;
  staff_activity_monitoring: boolean;
  permission_change_alerts: boolean;
  staff_login_notifications: boolean;
  inactive_staff_alerts: boolean;
  staff_report_access: boolean;
}

interface ComplianceSettings {
  automated_reporting: boolean;
  report_frequency: 'daily' | 'weekly' | 'monthly';
  compliance_monitoring: boolean;
  license_expiry_alerts: boolean;
  content_filtering: boolean;
  audit_trail_enabled: boolean;
  data_retention_days: number;
  export_format: 'csv' | 'json' | 'xml';
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<
    'account' | 'notifications' | 'stream' | 'staff' | 'compliance' | 'appearance'
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
    station_name: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Station preferences state
  const [preferences, setPreferences] = useState<StationPreferences>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    stream_alerts: true,
    compliance_alerts: true,
    staff_notifications: true,
    report_notifications: true,
    sound_notifications: true,
    theme_preference: 'light',
    language: 'en',
    timezone: 'UTC',
    auto_refresh_dashboard: true,
    session_timeout: 30,
  });

  // Stream monitoring settings state
  const [streamSettings, setStreamSettings] = useState<StreamMonitoringSettings>({
    monitoring_enabled: true,
    stream_quality_alerts: true,
    silence_detection: true,
    silence_threshold_seconds: 30,
    volume_monitoring: true,
    volume_threshold_db: -40,
    metadata_extraction: true,
    fingerprinting_enabled: true,
    alert_frequency: 'immediate',
    monitoring_schedule: '24/7',
  });

  // Staff management settings state
  const [staffSettings, setStaffSettings] = useState<StaffManagementSettings>({
    staff_access_logging: true,
    role_change_notifications: true,
    staff_activity_monitoring: true,
    permission_change_alerts: true,
    staff_login_notifications: false,
    inactive_staff_alerts: true,
    staff_report_access: true,
  });

  // Compliance settings state
  const [complianceSettings, setComplianceSettings] = useState<ComplianceSettings>({
    automated_reporting: true,
    report_frequency: 'weekly',
    compliance_monitoring: true,
    license_expiry_alerts: true,
    content_filtering: false,
    audit_trail_enabled: true,
    data_retention_days: 365,
    export_format: 'csv',
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
        const profileData = await settingsService.getProfile();
        setAccountData((prev) => ({
          ...prev,
          email: profileData.email || '',
          phone: profileData.phone || '',
          station_name: profileData.station_name || '',
        }));
      } catch (error) {
        console.warn('Failed to load profile:', error);
      }

      // Load preferences
      try {
        const prefsData = await settingsService.getPreferences();
        setPreferences((prev) => ({ ...prev, ...prefsData }));
        if (prefsData.theme_preference) {
          setTheme(prefsData.theme_preference);
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error);
      }

      // Load stream monitoring settings
      try {
        const streamData = await settingsService.getStreamSettings();
        setStreamSettings((prev) => ({ ...prev, ...streamData }));
      } catch (error) {
        console.warn('Failed to load stream settings:', error);
      }

      // Load staff management settings
      try {
        const staffData = await settingsService.getStaffSettings();
        setStaffSettings((prev) => ({ ...prev, ...staffData }));
      } catch (error) {
        console.warn('Failed to load staff settings:', error);
      }

      // Load compliance settings
      try {
        const complianceData = await settingsService.getComplianceSettings();
        setComplianceSettings((prev) => ({ ...prev, ...complianceData }));
      } catch (error) {
        console.warn('Failed to load compliance settings:', error);
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
        station_name: accountData.station_name,
      };

      if (accountData.new_password) {
        payload.current_password = accountData.current_password;
        payload.new_password = accountData.new_password;
      }

      await settingsService.updateProfile(payload);
      
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

  const updatePreferences = async (newPreferences: Partial<StationPreferences>) => {
    try {
      setSaving(true);
      const updatedPrefs = { ...preferences, ...newPreferences };
      setPreferences(updatedPrefs);

      if (newPreferences.theme_preference) {
        setTheme(newPreferences.theme_preference);
      }

      await settingsService.updatePreferences(newPreferences);
      toast.success('Preferences updated successfully');
    } catch (error: any) {
      setPreferences(preferences);
      console.error('Failed to update preferences:', error);
      toast.error(error.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateStreamSettings = async (newSettings: Partial<StreamMonitoringSettings>) => {
    try {
      setSaving(true);
      const updatedSettings = { ...streamSettings, ...newSettings };
      setStreamSettings(updatedSettings);

      await settingsService.updateStreamSettings(newSettings);
      toast.success('Stream monitoring settings updated successfully');
    } catch (error: any) {
      setStreamSettings(streamSettings);
      console.error('Failed to update stream settings:', error);
      toast.error(error.message || 'Failed to update stream settings');
    } finally {
      setSaving(false);
    }
  };

  const updateStaffSettings = async (newSettings: Partial<StaffManagementSettings>) => {
    try {
      setSaving(true);
      const updatedSettings = { ...staffSettings, ...newSettings };
      setStaffSettings(updatedSettings);

      await settingsService.updateStaffSettings(newSettings);
      toast.success('Staff management settings updated successfully');
    } catch (error: any) {
      setStaffSettings(staffSettings);
      console.error('Failed to update staff settings:', error);
      toast.error(error.message || 'Failed to update staff settings');
    } finally {
      setSaving(false);
    }
  };

  const updateComplianceSettings = async (newSettings: Partial<ComplianceSettings>) => {
    try {
      setSaving(true);
      const updatedSettings = { ...complianceSettings, ...newSettings };
      setComplianceSettings(updatedSettings);

      await settingsService.updateComplianceSettings(newSettings);
      toast.success('Compliance settings updated successfully');
    } catch (error: any) {
      setComplianceSettings(complianceSettings);
      console.error('Failed to update compliance settings:', error);
      toast.error(error.message || 'Failed to update compliance settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'stream', label: 'Stream Monitoring', icon: Radio },
    { id: 'staff', label: 'Staff Management', icon: Users },
    { id: 'compliance', label: 'Compliance', icon: FileText },
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
          Station Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your station configuration, monitoring preferences, and compliance settings
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
                    Station Account Information
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
                        Station Name
                      </label>
                      <input
                        type="text"
                        value={accountData.station_name}
                        onChange={(e) =>
                          setAccountData((prev) => ({
                            ...prev,
                            station_name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        placeholder="Your Station Name"
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
                        placeholder="station@example.com"
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
                  Station Notification Preferences
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure how you want to receive notifications about station activities and alerts.
                </p>

                <div className="space-y-6">
                  {/* Stream Alerts */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Radio className="w-5 h-5 mr-2" />
                      Stream & Monitoring Alerts
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'stream_alerts',
                          label: 'Stream monitoring alerts',
                          description: 'Notifications about stream quality and issues',
                        },
                        {
                          key: 'compliance_alerts',
                          label: 'Compliance alerts',
                          description: 'Alerts about licensing and regulatory compliance',
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
                                    item.key as keyof StationPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof StationPreferences]
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
                                  preferences[item.key as keyof StationPreferences]
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

                  {/* Staff & Management Alerts */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Staff & Management Alerts
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'staff_notifications',
                          label: 'Staff activity notifications',
                          description: 'Alerts about staff login, role changes, and activities',
                        },
                        {
                          key: 'report_notifications',
                          label: 'Report notifications',
                          description: 'Notifications about generated reports and compliance updates',
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
                                    item.key as keyof StationPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof StationPreferences]
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
                                  preferences[item.key as keyof StationPreferences]
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
                                    item.key as keyof StationPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof StationPreferences]
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
                                  preferences[item.key as keyof StationPreferences]
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
      {activeTab === 'stream' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Stream Monitoring Preferences
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure how your station's stream is monitored and what alerts you receive.
                </p>

                <div className="space-y-6">
                  {/* Basic Monitoring Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Basic Monitoring
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Enable stream monitoring
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Monitor your stream for audio quality and content detection
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateStreamSettings({
                              monitoring_enabled: !streamSettings.monitoring_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              streamSettings.monitoring_enabled
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
                                streamSettings.monitoring_enabled
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Audio fingerprinting
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable music detection and matching for royalty tracking
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateStreamSettings({
                              fingerprinting_enabled: !streamSettings.fingerprinting_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              streamSettings.fingerprinting_enabled
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
                                streamSettings.fingerprinting_enabled
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Metadata extraction
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Extract song titles and artist information from stream metadata
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateStreamSettings({
                              metadata_extraction: !streamSettings.metadata_extraction,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              streamSettings.metadata_extraction
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
                                streamSettings.metadata_extraction
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quality Monitoring */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Volume2 className="w-5 h-5 mr-2" />
                      Quality Monitoring
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Stream quality alerts
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Get notified about audio quality issues and stream interruptions
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateStreamSettings({
                              stream_quality_alerts: !streamSettings.stream_quality_alerts,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              streamSettings.stream_quality_alerts
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
                                streamSettings.stream_quality_alerts
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Silence detection
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Detect periods of silence in your stream
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateStreamSettings({
                              silence_detection: !streamSettings.silence_detection,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              streamSettings.silence_detection
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
                                streamSettings.silence_detection
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      {streamSettings.silence_detection && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Silence threshold (seconds)
                          </label>
                          <input
                            type="number"
                            min="5"
                            max="300"
                            value={streamSettings.silence_threshold_seconds}
                            onChange={(e) =>
                              updateStreamSettings({
                                silence_threshold_seconds: parseInt(e.target.value) || 30,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Volume monitoring
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Monitor audio levels and detect volume issues
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateStreamSettings({
                              volume_monitoring: !streamSettings.volume_monitoring,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              streamSettings.volume_monitoring
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
                                streamSettings.volume_monitoring
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      {streamSettings.volume_monitoring && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Volume threshold (dB)
                          </label>
                          <input
                            type="number"
                            min="-60"
                            max="0"
                            value={streamSettings.volume_threshold_db}
                            onChange={(e) =>
                              updateStreamSettings({
                                volume_threshold_db: parseInt(e.target.value) || -40,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Alert Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Alert Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Alert frequency
                        </label>
                        <select
                          value={streamSettings.alert_frequency}
                          onChange={(e) =>
                            updateStreamSettings({
                              alert_frequency: e.target.value as 'immediate' | 'hourly' | 'daily',
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="hourly">Hourly digest</option>
                          <option value="daily">Daily digest</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Monitoring schedule
                        </label>
                        <select
                          value={streamSettings.monitoring_schedule}
                          onChange={(e) =>
                            updateStreamSettings({
                              monitoring_schedule: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="24/7">24/7 monitoring</option>
                          <option value="business_hours">Business hours only</option>
                          <option value="custom">Custom schedule</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )} 
         {activeTab === 'staff' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Staff Management Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure staff access controls, activity monitoring, and notification preferences.
                </p>

                <div className="space-y-6">
                  {/* Access Control */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Access Control & Logging
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'staff_access_logging',
                          label: 'Staff access logging',
                          description: 'Log all staff login and access activities',
                        },
                        {
                          key: 'staff_activity_monitoring',
                          label: 'Activity monitoring',
                          description: 'Monitor staff actions and system usage',
                        },
                        {
                          key: 'staff_report_access',
                          label: 'Report access control',
                          description: 'Control staff access to reports and analytics',
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
                              updateStaffSettings({
                                [item.key]:
                                  !staffSettings[
                                    item.key as keyof StaffManagementSettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                staffSettings[item.key as keyof StaffManagementSettings]
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
                                  staffSettings[item.key as keyof StaffManagementSettings]
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

                  {/* Role & Permission Management */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Role & Permission Management
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'role_change_notifications',
                          label: 'Role change notifications',
                          description: 'Get notified when staff roles are modified',
                        },
                        {
                          key: 'permission_change_alerts',
                          label: 'Permission change alerts',
                          description: 'Alerts when staff permissions are updated',
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
                              updateStaffSettings({
                                [item.key]:
                                  !staffSettings[
                                    item.key as keyof StaffManagementSettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                staffSettings[item.key as keyof StaffManagementSettings]
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
                                  staffSettings[item.key as keyof StaffManagementSettings]
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

                  {/* Activity Notifications */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Activity Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'staff_login_notifications',
                          label: 'Login notifications',
                          description: 'Get notified when staff members log in',
                        },
                        {
                          key: 'inactive_staff_alerts',
                          label: 'Inactive staff alerts',
                          description: 'Alerts about staff members who haven\'t been active',
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
                              updateStaffSettings({
                                [item.key]:
                                  !staffSettings[
                                    item.key as keyof StaffManagementSettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                staffSettings[item.key as keyof StaffManagementSettings]
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
                                  staffSettings[item.key as keyof StaffManagementSettings]
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

          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Compliance & Reporting Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure automated reporting, compliance monitoring, and data retention policies.
                </p>

                <div className="space-y-6">
                  {/* Automated Reporting */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Automated Reporting
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Enable automated reporting
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically generate and submit compliance reports
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateComplianceSettings({
                              automated_reporting: !complianceSettings.automated_reporting,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              complianceSettings.automated_reporting
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
                                complianceSettings.automated_reporting
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      {complianceSettings.automated_reporting && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Report frequency
                          </label>
                          <select
                            value={complianceSettings.report_frequency}
                            onChange={(e) =>
                              updateComplianceSettings({
                                report_frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Export format
                        </label>
                        <select
                          value={complianceSettings.export_format}
                          onChange={(e) =>
                            updateComplianceSettings({
                              export_format: e.target.value as 'csv' | 'json' | 'xml',
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="csv">CSV</option>
                          <option value="json">JSON</option>
                          <option value="xml">XML</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Monitoring */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Compliance Monitoring
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'compliance_monitoring',
                          label: 'Compliance monitoring',
                          description: 'Monitor station compliance with licensing requirements',
                        },
                        {
                          key: 'license_expiry_alerts',
                          label: 'License expiry alerts',
                          description: 'Get notified before licenses expire',
                        },
                        {
                          key: 'content_filtering',
                          label: 'Content filtering',
                          description: 'Filter content based on compliance rules',
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
                              updateComplianceSettings({
                                [item.key]:
                                  !complianceSettings[
                                    item.key as keyof ComplianceSettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                complianceSettings[item.key as keyof ComplianceSettings]
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
                                  complianceSettings[item.key as keyof ComplianceSettings]
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

                  {/* Data Management */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      Data Management
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Audit trail
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Maintain detailed audit logs for compliance
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateComplianceSettings({
                              audit_trail_enabled: !complianceSettings.audit_trail_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              complianceSettings.audit_trail_enabled
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
                                complianceSettings.audit_trail_enabled
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Data retention period (days)
                        </label>
                        <input
                          type="number"
                          min="30"
                          max="2555"
                          value={complianceSettings.data_retention_days}
                          onChange={(e) =>
                            updateComplianceSettings({
                              data_retention_days: parseInt(e.target.value) || 365,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          How long to retain compliance and audit data
                        </p>
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
                  Customize the look and feel of your station dashboard.
                </p>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Theme Preference
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() =>
                            updatePreferences({
                              theme_preference: 'light',
                            })
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
                            updatePreferences({
                              theme_preference: 'dark',
                            })
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
                  </div>

                  {/* Dashboard Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Dashboard Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Auto-refresh dashboard
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically refresh dashboard data every few minutes
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updatePreferences({
                              auto_refresh_dashboard: !preferences.auto_refresh_dashboard,
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Session timeout (minutes)
                        </label>
                        <select
                          value={preferences.session_timeout}
                          onChange={(e) =>
                            updatePreferences({
                              session_timeout: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={120}>2 hours</option>
                          <option value={240}>4 hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Localization */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Localization
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) =>
                            updatePreferences({
                              language: e.target.value,
                            })
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
                            updatePreferences({
                              timezone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Europe/Berlin">Berlin</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                          <option value="Australia/Sydney">Sydney</option>
                        </select>
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