import api from '../lib/api';

interface ProfileData {
  email: string;
  phone: string;
  company_name: string;
  first_name: string;
  last_name: string;
}

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

class PublisherSettingsService {
  // Profile management
  async getProfile(): Promise<ProfileData> {
    try {
      const response = await api.get('/api/publishers/profile/');
      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error('Failed to get profile:', error);
      // Return default values if API fails
      return {
        email: '',
        phone: '',
        company_name: '',
        first_name: '',
        last_name: '',
      };
    }
  }

  async updateProfile(data: Partial<ProfileData & { current_password?: string; new_password?: string }>): Promise<void> {
    try {
      const response = await api.patch('/api/publishers/profile/', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // Publisher preferences
  async getPreferences(): Promise<Partial<PublisherPreferences>> {
    try {
      const response = await api.get('/api/publishers/preferences/');
      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return {};
    }
  }

  async updatePreferences(preferences: Partial<PublisherPreferences>): Promise<void> {
    try {
      const response = await api.patch('/api/publishers/preferences/', preferences);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update preferences');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // Artist management settings
  async getArtistSettings(): Promise<Partial<ArtistManagementSettings>> {
    try {
      const response = await api.get('/api/publishers/artist-settings/');
      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error('Failed to get artist settings:', error);
      return {};
    }
  }

  async updateArtistSettings(settings: Partial<ArtistManagementSettings>): Promise<void> {
    try {
      const response = await api.patch('/api/publishers/artist-settings/', settings);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update artist settings');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  // Contract and royalty settings
  async getContractSettings(): Promise<Partial<ContractRoyaltySettings>> {
    try {
      const response = await api.get('/api/publishers/contract-settings/');
      return response.data.success ? response.data.data : {};
    } catch (error) {
      console.error('Failed to get contract settings:', error);
      return {};
    }
  }

  async updateContractSettings(settings: Partial<ContractRoyaltySettings>): Promise<void> {
    try {
      const response = await api.patch('/api/publishers/contract-settings/', settings);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update contract settings');
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }
}

export const publisherSettingsService = new PublisherSettingsService();