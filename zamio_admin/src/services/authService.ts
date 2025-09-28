import api from '../lib/api';

export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[] | string>;
}

export interface AdminAuthPayload {
  email: string;
  password: string;
  fcm_token: string;
}

export interface AdminRegistrationPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password2: string;
}

export interface AdminAuthResponse {
  user_id: string;
  admin_id?: string | number;
  email: string;
  first_name: string;
  last_name: string;
  photo?: string | null;
  token: string;
  country?: string | null;
  phone?: string | null;
  next_step?: string;
  profile?: AdminProfile;
}

export interface AdminProfile {
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  active?: boolean;
}

export interface AdminOnboardingStatus {
  user_id: string;
  admin_id?: string | number;
  next_step: string;
  profile?: AdminProfile;
}

export interface AdminProfilePayload {
  address?: string;
  city: string;
  postal_code: string;
}

export const registerAdmin = (payload: AdminRegistrationPayload) =>
  api.post<{ message: string; data: AdminAuthResponse }>('api/accounts/register-admin/', payload);

export const loginAdmin = (payload: AdminAuthPayload) =>
  api.post<{ message: string; data: AdminAuthResponse }>('api/accounts/login-admin/', payload);

export const fetchAdminOnboardingStatus = () =>
  api.get<{ message: string; data: AdminOnboardingStatus }>('api/accounts/admin-onboarding-status/');

export const completeAdminProfile = (payload: AdminProfilePayload) =>
  api.post<{ message: string; data: AdminOnboardingStatus }>('api/accounts/complete-admin-profile/', payload);
