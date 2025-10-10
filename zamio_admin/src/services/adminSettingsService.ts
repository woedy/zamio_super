import api from '../lib/api';

export interface AdminProfile {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export interface AdminPreferences {
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

export interface SystemConfiguration {
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

export interface AuditLogSettings {
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

export interface UpdateAccountPayload {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  current_password?: string;
  new_password?: string;
}

class AdminSettingsService {
  private baseURL = '/api/accounts/admin/';

  // Profile management
  async getProfile(): Promise<AdminProfile> {
    const response = await api.get(`${this.baseURL}profile/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch profile');
  }

  async updateProfile(data: UpdateAccountPayload): Promise<AdminProfile> {
    const response = await api.patch(`${this.baseURL}profile/`, data);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update profile');
  }

  // Preferences management
  async getPreferences(): Promise<AdminPreferences> {
    const response = await api.get(`${this.baseURL}preferences/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch preferences');
  }

  async updatePreferences(preferences: Partial<AdminPreferences>): Promise<AdminPreferences> {
    const response = await api.patch(`${this.baseURL}preferences/`, preferences);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update preferences');
  }

  // System configuration management
  async getSystemConfiguration(): Promise<SystemConfiguration> {
    const response = await api.get(`${this.baseURL}system-config/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch system configuration');
  }

  async updateSystemConfiguration(config: Partial<SystemConfiguration>): Promise<SystemConfiguration> {
    const response = await api.patch(`${this.baseURL}system-config/`, config);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update system configuration');
  }

  // Audit log settings management
  async getAuditLogSettings(): Promise<AuditLogSettings> {
    const response = await api.get(`${this.baseURL}audit-settings/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch audit log settings');
  }

  async updateAuditLogSettings(settings: Partial<AuditLogSettings>): Promise<AuditLogSettings> {
    const response = await api.patch(`${this.baseURL}audit-settings/`, settings);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update audit log settings');
  }

  // Two-factor authentication
  async enableTwoFactor(): Promise<{ qr_code: string; backup_codes: string[] }> {
    const response = await api.post(`${this.baseURL}enable-2fa/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to enable two-factor authentication');
  }

  async disableTwoFactor(password: string): Promise<void> {
    const response = await api.post(`${this.baseURL}disable-2fa/`, { password });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to disable two-factor authentication');
    }
  }

  async verifyTwoFactor(token: string): Promise<void> {
    const response = await api.post(`${this.baseURL}verify-2fa/`, { token });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to verify two-factor authentication');
    }
  }

  // System health check
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      timestamp: string;
    }>;
  }> {
    const response = await api.get(`${this.baseURL}system-health/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch system health');
  }

  // Backup management
  async createBackup(): Promise<{ backup_id: string; status: string }> {
    const response = await api.post(`${this.baseURL}create-backup/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create backup');
  }

  async getBackupHistory(): Promise<Array<{
    id: string;
    created_at: string;
    size: number;
    status: 'completed' | 'failed' | 'in_progress';
    type: 'manual' | 'automatic';
  }>> {
    const response = await api.get(`${this.baseURL}backup-history/`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch backup history');
  }

  // Maintenance mode
  async enableMaintenanceMode(message?: string): Promise<void> {
    const response = await api.post(`${this.baseURL}maintenance-mode/enable/`, { message });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to enable maintenance mode');
    }
  }

  async disableMaintenanceMode(): Promise<void> {
    const response = await api.post(`${this.baseURL}maintenance-mode/disable/`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to disable maintenance mode');
    }
  }
}

export const adminSettingsService = new AdminSettingsService();