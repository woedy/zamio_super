import api from '../lib/api';

export interface StationProfile {
  email: string;
  phone: string;
  station_name: string;
}

export interface StationPreferences {
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

export interface StreamMonitoringSettings {
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

export interface StaffManagementSettings {
  staff_access_logging: boolean;
  role_change_notifications: boolean;
  staff_activity_monitoring: boolean;
  permission_change_alerts: boolean;
  staff_login_notifications: boolean;
  inactive_staff_alerts: boolean;
  staff_report_access: boolean;
}

export interface ComplianceSettings {
  automated_reporting: boolean;
  report_frequency: 'daily' | 'weekly' | 'monthly';
  compliance_monitoring: boolean;
  license_expiry_alerts: boolean;
  content_filtering: boolean;
  audit_trail_enabled: boolean;
  data_retention_days: number;
  export_format: 'csv' | 'json' | 'xml';
}

export const settingsService = {
  // Profile management
  async getProfile(): Promise<StationProfile> {
    const response = await api.get('/api/stations/profile/');
    return response.data.data;
  },

  async updateProfile(data: Partial<StationProfile & { current_password?: string; new_password?: string }>): Promise<void> {
    await api.patch('/api/stations/profile/', data);
  },

  // Preferences management
  async getPreferences(): Promise<StationPreferences> {
    const response = await api.get('/api/stations/preferences/');
    return response.data.data;
  },

  async updatePreferences(data: Partial<StationPreferences>): Promise<void> {
    await api.patch('/api/stations/preferences/', data);
  },

  // Stream monitoring settings
  async getStreamSettings(): Promise<StreamMonitoringSettings> {
    const response = await api.get('/api/stations/stream-settings/');
    return response.data.data;
  },

  async updateStreamSettings(data: Partial<StreamMonitoringSettings>): Promise<void> {
    await api.patch('/api/stations/stream-settings/', data);
  },

  // Staff management settings
  async getStaffSettings(): Promise<StaffManagementSettings> {
    const response = await api.get('/api/stations/staff-settings/');
    return response.data.data;
  },

  async updateStaffSettings(data: Partial<StaffManagementSettings>): Promise<void> {
    await api.patch('/api/stations/staff-settings/', data);
  },

  // Compliance settings
  async getComplianceSettings(): Promise<ComplianceSettings> {
    const response = await api.get('/api/stations/compliance-settings/');
    return response.data.data;
  },

  async updateComplianceSettings(data: Partial<ComplianceSettings>): Promise<void> {
    await api.patch('/api/stations/compliance-settings/', data);
  },
};