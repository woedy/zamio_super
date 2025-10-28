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

export type { LegacyLoginResponse };

export interface ApiErrorMap {
  [field: string]: string[] | string | undefined;
}

export type ApiEnvelope<T = Record<string, unknown>> = LegacyLoginResponse & {
  data?: T;
  errors?: ApiErrorMap;
  message?: string;
  [key: string]: unknown;
};

export interface RegisterAdminPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country?: string;
  password: string;
  password2: string;
  organization_name?: string;
  company?: string;
  role: string;
}

export interface VerifyAdminEmailCodePayload {
  email: string;
  code: string;
}

export interface AdminProfileSnapshot {
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  active?: boolean;
  organization_name?: string | null;
  role?: string | null;
  [key: string]: unknown;
}

export interface AdminOnboardingStatus {
  user_id?: string;
  admin_id?: string;
  next_step?: string;
  onboarding_step?: string;
  progress?: {
    profile_completed?: boolean;
    [key: string]: unknown;
  };
  profile?: AdminProfileSnapshot;
  organization_name?: string | null;
  role?: string | null;
  [key: string]: unknown;
}

export interface CompleteAdminProfilePayload {
  address?: string;
  city: string;
  postal_code: string;
}

export const registerAdmin = async <T = Record<string, unknown>>(
  payload: RegisterAdminPayload,
) => {
  const requestPayload: Record<string, unknown> = {
    ...payload,
    organization_name: payload.organization_name ?? payload.company,
  };

  delete requestPayload.company;

  const { data } = await authApi.post<ApiEnvelope<T>>('/api/accounts/register-admin/', requestPayload);
  return data;
};

export const verifyAdminEmailCode = async <T = Record<string, unknown>>(
  payload: VerifyAdminEmailCodePayload,
) => {
  const { data } = await authApi.post<ApiEnvelope<T>>('/api/accounts/verify-admin-email-code/', payload);
  return data;
};

export const fetchAdminOnboardingStatus = async () => {
  const { data } = await authApi.get<ApiEnvelope<AdminOnboardingStatus>>(
    '/api/accounts/admin-onboarding-status/',
  );
  return data;
};

export const completeAdminProfile = async (payload: CompleteAdminProfilePayload) => {
  const { data } = await authApi.post<ApiEnvelope<AdminOnboardingStatus>>(
    '/api/accounts/complete-admin-profile/',
    payload,
  );
  return data;
};
