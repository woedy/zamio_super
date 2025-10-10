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
  Database,
  Activity,
  AlertTriangle,
  FileText,
  Download,
  Filter,
  Edit,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useApiErrorHandler } from '../../hooks/useApiErrorHandler';
import { adminSettingsService } from '../../services/adminSettingsService';

interface AdminPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  system_alerts: boolean;
  security_alerts: boolean;
  user_activity_alerts: boolean;
  financial_alerts: boolean;
  dispute_notifications: boolean;
  audit_log_notifications: boolean;
  daily_reports: boolean;
  weekly_reports: boolean;
  monthly_reports: boolean;
  theme_preference: 'light' | 'dark';
  language: string;
  timezone: string;
  sound_notifications: boolean;
  auto_refresh_dashboard: boolean;
  session_timeout: number;
  two_factor_enabled: boolean;
}

interface SystemConfiguration {
  platform_maintenance_mode: boolean;
  user_registration_enabled: boolean;
  email_verification_required: boolean;
  max_file_upload_size: number;
  session_timeout_minutes: number;
  password_expiry_days: number;
  max_login_attempts: number;
  audit_log_retention_days: number;
  backup_frequency_hours: number;
  system_monitoring_enabled: boolean;
}

interface AuditLogSettings {
  log_level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  retention_period_days: number;
  auto_export_enabled: boolean;
  export_frequency: 'daily' | 'weekly' | 'monthly';
  include_request_data: boolean;
  include_response_data: boolean;
  log_failed_attempts: boolean;
  log_successful_logins: boolean;
  log_data_changes: boolean;
  log_admin_actions: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { handleApiError, showSuccessMessage } = useApiErrorHandler();
  const [activeTab, setActiveTab] = useState<
    'account' | 'notifications' | 'system' | 'audit' | 'appearance'
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
    first_name: '',
    last_name: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Admin preferences state
  const [preferences, setPreferences] = useState<AdminPreferences>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    system_alerts: true,
    security_alerts: true,
    user_activity_alerts: true,
    financial_alerts: true,
    dispute_notifications: true,
    audit_log_notifications: true,
    daily_reports: true,
    weekly_reports: true,
    monthly_reports: false,
    theme_preference: 'light',
    language: 'en',
    timezone: 'UTC',
    sound_notifications: true,
    auto_refresh_dashboard: true,
    session_timeout: 30,
    two_factor_enabled: false,
  });

  // System configuration state
  const [systemConfig, setSystemConfig] = useState<SystemConfiguration>({
    platform_maintenance_mode: false,
    user_registration_enabled: true,
    email_verification_required: true,
    max_file_upload_size: 50,
    session_timeout_minutes: 30,
    password_expiry_days: 90,
    max_login_attempts: 5,
    audit_log_retention_days: 365,
    backup_frequency_hours: 24,
    system_monitoring_enabled: true,
  });

  // Audit log settings state
  const [auditSettings, setAuditSettings] = useState<AuditLogSettings>({
    log_level: 'INFO',
    retention_period_days: 365,
    auto_export_enabled: false,
    export_frequency: 'monthly',
    include_request_data: true,
    include_response_data: false,
    log_failed_attempts: true,
    log_successful_logins: true,
    log_data_changes: true,
    log_admin_actions: true,
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
        const profileData = await adminSettingsService.getProfile();
        setAccountData((prev) => ({
          ...prev,
          email: profileData.email || '',
          phone: profileData.phone || '',
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
        }));
      } catch (error) {
        console.warn('Failed to load profile:', error);
      }

      // Load preferences
      try {
        const prefsData = await adminSettingsService.getPreferences();
        setPreferences((prev) => ({ ...prev, ...prefsData }));
        if (prefsData.theme_preference) {
          setTheme(prefsData.theme_preference);
        }
      } catch (error) {
        console.warn('Failed to load preferences:', error);
      }

      // Load system configuration
      try {
        const systemData = await adminSettingsService.getSystemConfiguration();
        setSystemConfig((prev) => ({ ...prev, ...systemData }));
      } catch (error) {
        console.warn('Failed to load system configuration:', error);
      }

      // Load audit settings
      try {
        const auditData = await adminSettingsService.getAuditLogSettings();
        setAuditSettings((prev) => ({ ...prev, ...auditData }));
      } catch (error) {
        console.warn('Failed to load audit settings:', error);
      }
    } catch (error) {
      handleApiError(error as any, 'Failed to load settings');
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
        first_name: accountData.first_name,
        last_name: accountData.last_name,
      };

      if (accountData.new_password) {
        payload.current_password = accountData.current_password;
        payload.new_password = accountData.new_password;
      }

      await adminSettingsService.updateProfile(payload);

      // Clear password fields
      setAccountData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));

      showSuccessMessage('Account settings updated successfully');
    } catch (error: any) {
      handleApiError(error, 'Failed to update account settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePreferences = async (
    newPreferences: Partial<AdminPreferences>,
  ) => {
    try {
      setSaving(true);
      const updatedPrefs = { ...preferences, ...newPreferences };
      setPreferences(updatedPrefs);

      if (newPreferences.theme_preference) {
        setTheme(newPreferences.theme_preference);
      }

      await adminSettingsService.updatePreferences(newPreferences);
      showSuccessMessage('Preferences updated successfully');
    } catch (error) {
      setPreferences(preferences);
      handleApiError(error as any, 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateSystemConfig = async (
    newConfig: Partial<SystemConfiguration>,
  ) => {
    try {
      setSaving(true);
      const updatedConfig = { ...systemConfig, ...newConfig };
      setSystemConfig(updatedConfig);

      await adminSettingsService.updateSystemConfiguration(newConfig);
      showSuccessMessage('System configuration updated successfully');
    } catch (error) {
      setSystemConfig(systemConfig);
      handleApiError(error as any, 'Failed to update system configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateAuditSettings = async (
    newSettings: Partial<AuditLogSettings>,
  ) => {
    try {
      setSaving(true);
      const updatedSettings = { ...auditSettings, ...newSettings };
      setAuditSettings(updatedSettings);

      await adminSettingsService.updateAuditLogSettings(newSettings);
      showSuccessMessage('Audit log settings updated successfully');
    } catch (error) {
      setAuditSettings(auditSettings);
      handleApiError(error as any, 'Failed to update audit log settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System Config', icon: SettingsIcon },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
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
          Admin Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage system configuration, preferences, and audit settings
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
                    Admin Account Information
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="admin@zamio.com"
                      />
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
                  Admin Notification Preferences
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure how you want to receive notifications about system
                  events and activities.
                </p>

                <div className="space-y-6">
                  {/* System Alerts */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      System Alerts
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'system_alerts',
                          label: 'System alerts',
                          description: 'Critical system events and errors',
                        },
                        {
                          key: 'security_alerts',
                          label: 'Security alerts',
                          description:
                            'Security breaches and suspicious activities',
                        },
                        {
                          key: 'user_activity_alerts',
                          label: 'User activity alerts',
                          description:
                            'Unusual user behavior and account activities',
                        },
                        {
                          key: 'financial_alerts',
                          label: 'Financial alerts',
                          description:
                            'Payment failures and financial anomalies',
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
                                    item.key as keyof AdminPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof AdminPreferences]
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
                                    item.key as keyof AdminPreferences
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
                                    item.key as keyof AdminPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof AdminPreferences]
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
                                    item.key as keyof AdminPreferences
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

                  {/* Reports */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Automated Reports
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'daily_reports',
                          label: 'Daily reports',
                          description: 'Daily system activity summary',
                        },
                        {
                          key: 'weekly_reports',
                          label: 'Weekly reports',
                          description: 'Weekly platform analytics',
                        },
                        {
                          key: 'monthly_reports',
                          label: 'Monthly reports',
                          description: 'Comprehensive monthly overview',
                        },
                        {
                          key: 'dispute_notifications',
                          label: 'Dispute notifications',
                          description: 'New disputes and resolution updates',
                        },
                        {
                          key: 'audit_log_notifications',
                          label: 'Audit log notifications',
                          description: 'Critical audit events and anomalies',
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
                                    item.key as keyof AdminPreferences
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                preferences[item.key as keyof AdminPreferences]
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
                                    item.key as keyof AdminPreferences
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

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  System Configuration
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure platform-wide settings and security parameters.
                </p>

                <div className="space-y-6">
                  {/* Platform Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Globe className="w-5 h-5 mr-2" />
                      Platform Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Maintenance Mode
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable maintenance mode to restrict platform access
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateSystemConfig({
                              platform_maintenance_mode:
                                !systemConfig.platform_maintenance_mode,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              systemConfig.platform_maintenance_mode
                                ? 'bg-red-500'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }
                          `}
                        >
                          <span
                            className={`
                              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                              transition duration-200 ease-in-out
                              ${
                                systemConfig.platform_maintenance_mode
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
                            User Registration
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Allow new users to register on the platform
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateSystemConfig({
                              user_registration_enabled:
                                !systemConfig.user_registration_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              systemConfig.user_registration_enabled
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
                                systemConfig.user_registration_enabled
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
                            Email Verification Required
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Require email verification for new accounts
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateSystemConfig({
                              email_verification_required:
                                !systemConfig.email_verification_required,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              systemConfig.email_verification_required
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
                                systemConfig.email_verification_required
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={systemConfig.session_timeout_minutes}
                          onChange={(e) =>
                            setSystemConfig((prev) => ({
                              ...prev,
                              session_timeout_minutes:
                                parseInt(e.target.value) || 30,
                            }))
                          }
                          onBlur={() =>
                            updateSystemConfig({
                              session_timeout_minutes:
                                systemConfig.session_timeout_minutes,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          min="5"
                          max="480"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={systemConfig.max_login_attempts}
                          onChange={(e) =>
                            setSystemConfig((prev) => ({
                              ...prev,
                              max_login_attempts: parseInt(e.target.value) || 5,
                            }))
                          }
                          onBlur={() =>
                            updateSystemConfig({
                              max_login_attempts:
                                systemConfig.max_login_attempts,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          min="3"
                          max="10"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Password Expiry (days)
                        </label>
                        <input
                          type="number"
                          value={systemConfig.password_expiry_days}
                          onChange={(e) =>
                            setSystemConfig((prev) => ({
                              ...prev,
                              password_expiry_days:
                                parseInt(e.target.value) || 90,
                            }))
                          }
                          onBlur={() =>
                            updateSystemConfig({
                              password_expiry_days:
                                systemConfig.password_expiry_days,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          min="30"
                          max="365"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Max File Upload Size (MB)
                        </label>
                        <input
                          type="number"
                          value={systemConfig.max_file_upload_size}
                          onChange={(e) =>
                            setSystemConfig((prev) => ({
                              ...prev,
                              max_file_upload_size:
                                parseInt(e.target.value) || 50,
                            }))
                          }
                          onBlur={() =>
                            updateSystemConfig({
                              max_file_upload_size:
                                systemConfig.max_file_upload_size,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          min="1"
                          max="500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* System Monitoring */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      System Monitoring
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            System Monitoring
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Enable real-time system health monitoring
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateSystemConfig({
                              system_monitoring_enabled:
                                !systemConfig.system_monitoring_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              systemConfig.system_monitoring_enabled
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
                                systemConfig.system_monitoring_enabled
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
                            Backup Frequency (hours)
                          </label>
                          <input
                            type="number"
                            value={systemConfig.backup_frequency_hours}
                            onChange={(e) =>
                              setSystemConfig((prev) => ({
                                ...prev,
                                backup_frequency_hours:
                                  parseInt(e.target.value) || 24,
                              }))
                            }
                            onBlur={() =>
                              updateSystemConfig({
                                backup_frequency_hours:
                                  systemConfig.backup_frequency_hours,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            min="1"
                            max="168"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Audit Log Retention (days)
                          </label>
                          <input
                            type="number"
                            value={systemConfig.audit_log_retention_days}
                            onChange={(e) =>
                              setSystemConfig((prev) => ({
                                ...prev,
                                audit_log_retention_days:
                                  parseInt(e.target.value) || 365,
                              }))
                            }
                            onBlur={() =>
                              updateSystemConfig({
                                audit_log_retention_days:
                                  systemConfig.audit_log_retention_days,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                            min="30"
                            max="2555"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Audit Log Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Configure audit logging preferences and data retention
                  policies.
                </p>

                <div className="space-y-6">
                  {/* Logging Configuration */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      Logging Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Log Level
                        </label>
                        <select
                          value={auditSettings.log_level}
                          onChange={(e) =>
                            updateAuditSettings({
                              log_level: e.target
                                .value as AuditLogSettings['log_level'],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                        >
                          <option value="DEBUG">Debug</option>
                          <option value="INFO">Info</option>
                          <option value="WARNING">Warning</option>
                          <option value="ERROR">Error</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Retention Period (days)
                        </label>
                        <input
                          type="number"
                          value={auditSettings.retention_period_days}
                          onChange={(e) =>
                            setAuditSettings((prev) => ({
                              ...prev,
                              retention_period_days:
                                parseInt(e.target.value) || 365,
                            }))
                          }
                          onBlur={() =>
                            updateAuditSettings({
                              retention_period_days:
                                auditSettings.retention_period_days,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          min="30"
                          max="2555"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Data Collection Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Data Collection Settings
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: 'include_request_data',
                          label: 'Include request data',
                          description: 'Log request payloads and parameters',
                        },
                        {
                          key: 'include_response_data',
                          label: 'Include response data',
                          description:
                            'Log response data (may contain sensitive info)',
                        },
                        {
                          key: 'log_failed_attempts',
                          label: 'Log failed attempts',
                          description:
                            'Record failed login and access attempts',
                        },
                        {
                          key: 'log_successful_logins',
                          label: 'Log successful logins',
                          description:
                            'Record successful authentication events',
                        },
                        {
                          key: 'log_data_changes',
                          label: 'Log data changes',
                          description: 'Track all data modifications',
                        },
                        {
                          key: 'log_admin_actions',
                          label: 'Log admin actions',
                          description: 'Record all administrative activities',
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
                              updateAuditSettings({
                                [item.key]:
                                  !auditSettings[
                                    item.key as keyof AuditLogSettings
                                  ],
                              })
                            }
                            className={`
                              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                              ${
                                auditSettings[
                                  item.key as keyof AuditLogSettings
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
                                  auditSettings[
                                    item.key as keyof AuditLogSettings
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

                  {/* Export Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Download className="w-5 h-5 mr-2" />
                      Export Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Auto Export
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically export audit logs at regular intervals
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updateAuditSettings({
                              auto_export_enabled:
                                !auditSettings.auto_export_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              auditSettings.auto_export_enabled
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
                                auditSettings.auto_export_enabled
                                  ? 'translate-x-5'
                                  : 'translate-x-0'
                              }
                            `}
                          />
                        </button>
                      </div>

                      {auditSettings.auto_export_enabled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Export Frequency
                          </label>
                          <select
                            value={auditSettings.export_frequency}
                            onChange={(e) =>
                              updateAuditSettings({
                                export_frequency: e.target
                                  .value as AuditLogSettings['export_frequency'],
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
                  Customize the look and feel of your admin interface.
                </p>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Theme Preference
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() =>
                          updatePreferences({ theme_preference: 'light' })
                        }
                        className={`
                          flex items-center justify-center p-4 border-2 rounded-lg transition-colors
                          ${
                            preferences.theme_preference === 'light'
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                          }
                        `}
                      >
                        <Sun className="w-8 h-8 mr-3 text-yellow-500" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            Light Mode
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Clean and bright interface
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() =>
                          updatePreferences({ theme_preference: 'dark' })
                        }
                        className={`
                          flex items-center justify-center p-4 border-2 rounded-lg transition-colors
                          ${
                            preferences.theme_preference === 'dark'
                              ? 'border-primary bg-primary/10'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                          }
                        `}
                      >
                        <Moon className="w-8 h-8 mr-3 text-blue-500" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            Dark Mode
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Easy on the eyes
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Interface Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Interface Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Auto-refresh Dashboard
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Automatically refresh dashboard data every 30
                            seconds
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
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={preferences.session_timeout}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              session_timeout: parseInt(e.target.value) || 30,
                            }))
                          }
                          onBlur={() =>
                            updatePreferences({
                              session_timeout: preferences.session_timeout,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                          min="5"
                          max="480"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security Preferences */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Security Preferences
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-900 dark:text-white">
                            Two-Factor Authentication
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            updatePreferences({
                              two_factor_enabled:
                                !preferences.two_factor_enabled,
                            })
                          }
                          className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                            ${
                              preferences.two_factor_enabled
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
                                preferences.two_factor_enabled
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
        </div>
      </div>
    </div>
  );
};

export default Settings;
