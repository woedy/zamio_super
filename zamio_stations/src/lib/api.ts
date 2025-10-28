import {
  authApi,
  loginWithPassword,
  legacyRoleLogin,
  getStoredAuth,
  logout,
  resolveApiBaseUrl,
  type LegacyLoginResponse,
} from '@zamio/ui';

export {
  authApi,
  loginWithPassword,
  legacyRoleLogin,
  getStoredAuth,
  logout,
  resolveApiBaseUrl,
};

export default authApi;

export interface RegisterStationPayload {
  first_name: string;
  last_name: string;
  station_name: string;
  email: string;
  phone: string;
  country?: string;
  password: string;
  password2: string;
}

export interface VerifyStationEmailCodePayload {
  email: string;
  code: string;
}

export interface PasswordResetRequestPayload {
  email: string;
  method?: 'code' | 'link';
}

export interface PasswordResetVerificationPayload {
  email: string;
  code: string;
  new_password: string;
  new_password2: string;
}

export interface ApiErrorMap {
  [field: string]: string[] | string | undefined;
}

export type ApiEnvelope<T = Record<string, unknown>> = LegacyLoginResponse & {
  data?: T;
  errors?: ApiErrorMap;
  [key: string]: unknown;
};

export interface StationOnboardingProgress {
  profile_completed?: boolean;
  stream_setup_completed?: boolean;
  staff_completed?: boolean;
  compliance_completed?: boolean;
  payment_info_added?: boolean;
  [key: string]: unknown;
}

export interface StationProfileSnapshot {
  name?: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  coverage_area?: string;
  estimated_listeners?: number | string;
  license_number?: string;
  license_expiry_date?: string;
  website_url?: string;
  about?: string;
  station_type?: string;
  station_class?: string;
  station_category?: string;
  location_name?: string;
  [key: string]: unknown;
}

export interface StationStreamConfiguration {
  stream_url?: string;
  backup_stream_url?: string;
  stream_type?: string;
  stream_bitrate?: string;
  stream_format?: string;
  stream_mount_point?: string;
  stream_username?: string;
  monitoring_enabled?: boolean;
  monitoring_interval_seconds?: number;
  stream_auto_restart?: boolean;
  stream_quality_check_enabled?: boolean;
  [key: string]: unknown;
}

export interface StationComplianceSnapshot {
  license_number?: string;
  license_issuing_authority?: string;
  license_issue_date?: string;
  license_expiry_date?: string;
  broadcast_frequency?: string;
  transmission_power?: string;
  regulatory_body?: string;
  coverage_area?: string;
  estimated_listeners?: number | string;
  compliance_contact_name?: string;
  compliance_contact_email?: string;
  compliance_contact_phone?: string;
  emergency_contact_phone?: string;
  [key: string]: unknown;
}

export interface StationPaymentPreferences {
  preferred_payout_method?: string;
  preferred_currency?: string;
  payout_frequency?: string;
  minimum_payout_amount?: number | string;
  tax_identification_number?: string;
  business_registration_number?: string;
  momo_account?: string;
  momo_provider?: string;
  momo_account_name?: string;
  bank_account?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  bank_branch_code?: string;
  bank_swift_code?: string;
  [key: string]: unknown;
}

export interface StationOnboardingStatus {
  station_id?: string;
  station_name?: string;
  onboarding_step?: string;
  next_step?: string;
  progress?: StationOnboardingProgress;
  profile?: StationProfileSnapshot;
  stream_configuration?: StationStreamConfiguration;
  compliance?: StationComplianceSnapshot;
  payment_preferences?: StationPaymentPreferences;
  stream_status?: string;
  stream_validation_errors?: string | null;
  [key: string]: unknown;
}

export const fetchStationOnboardingStatus = async (stationId: string) => {
  const { data } = await authApi.get<ApiEnvelope<StationOnboardingStatus>>(
    `/api/accounts/enhanced-station-onboarding-status/${stationId}/`,
  );
  return data;
};

export const registerStation = async <T = Record<string, unknown>>(
  payload: RegisterStationPayload,
) => {
  const { data } = await authApi.post<ApiEnvelope<T>>('/api/accounts/register-station/', payload);
  return data;
};

export const verifyStationEmailCode = async <T = Record<string, unknown>>(
  payload: VerifyStationEmailCodePayload,
) => {
  const { data } = await authApi.post<ApiEnvelope<T>>('/api/accounts/verify-station-email-code/', payload);
  return data;
};

export const resendStationVerification = async (
  payload: { email: string; method?: 'code' | 'link' },
) => {
  const { data } = await authApi.post<ApiEnvelope>(
    '/api/accounts/email/resend-verification-by-email/',
    payload,
  );
  return data;
};

export const requestPasswordReset = async (
  payload: PasswordResetRequestPayload,
) => {
  const { data } = await authApi.post<ApiEnvelope>(
    '/api/accounts/email/request-password-reset/',
    payload,
  );
  return data;
};

export const resendPasswordResetRequest = async (
  payload: PasswordResetRequestPayload,
) => {
  const { data } = await authApi.post<ApiEnvelope>(
    '/api/accounts/email/resend-password-reset/',
    payload,
  );
  return data;
};

export const verifyPasswordResetCode = async (
  payload: PasswordResetVerificationPayload,
) => {
  const { data } = await authApi.post<ApiEnvelope>(
    '/api/accounts/verify-password-reset-code/',
    payload,
  );
  return data;
};

export const completeStationProfile = async (formData: FormData) => {
  const { data } = await authApi.post<ApiEnvelope<StationOnboardingStatus>>(
    '/api/accounts/complete-station-profile/',
    formData,
  );
  return data;
};

export const completeStationStreamSetup = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<StationOnboardingStatus>>(
    '/api/accounts/complete-station-stream/',
    payload,
  );
  return data;
};

export const completeStationStaff = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<StationOnboardingStatus>>(
    '/api/accounts/complete-add-staff/',
    payload,
  );
  return data;
};

export const completeStationCompliance = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<StationOnboardingStatus>>(
    '/api/accounts/update-station-compliance-setup/',
    payload,
  );
  return data;
};

export const completeStationPayment = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<StationOnboardingStatus>>(
    '/api/accounts/complete-station-payment/',
    payload,
  );
  return data;
};

export const completeStationOnboarding = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<StationOnboardingStatus>>(
    '/api/accounts/complete-station-onboarding/',
    payload,
  );
  return data;
};

export const skipStationOnboardingStep = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<StationOnboardingStatus>>(
    '/api/accounts/skip-station-onboarding/',
    payload,
  );
  return data;
};

