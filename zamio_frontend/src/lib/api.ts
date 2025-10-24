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

export interface RegisterArtistPayload {
  first_name: string;
  last_name: string;
  stage_name: string;
  email: string;
  phone: string;
  country?: string;
  location?: string;
  password: string;
  password2: string;
}

export interface VerifyArtistEmailCodePayload {
  email: string;
  code: string;
}

export interface ApiErrorMap {
  [field: string]: string[] | string | undefined;
}

export type ApiEnvelope<T = Record<string, unknown>> = LegacyLoginResponse & {
  data?: T;
  errors?: ApiErrorMap;
  [key: string]: unknown;
};

export interface ArtistOnboardingProgress {
  profile_completed?: boolean;
  social_media_added?: boolean;
  payment_info_added?: boolean;
  publisher_added?: boolean;
  track_uploaded?: boolean;
  [key: string]: unknown;
}

export interface ArtistOnboardingStatus {
  artist_id?: string;
  onboarding_step?: string;
  next_step?: string;
  progress?: ArtistOnboardingProgress;
  completion_percentage?: number;
  required_fields?: Record<string, unknown>;
  verification_status?: string;
  kyc_status?: string;
  can_resume_verification?: boolean;
  can_skip_verification?: boolean;
  [key: string]: unknown;
}

export const registerArtist = async <T = Record<string, unknown>>(
  payload: RegisterArtistPayload,
) => {
  const { data } = await authApi.post<ApiEnvelope<T>>('/api/accounts/register-artist/', payload);
  return data;
};

export const verifyArtistEmailCode = async <T = Record<string, unknown>>(
  payload: VerifyArtistEmailCodePayload,
) => {
  const { data } = await authApi.post<ApiEnvelope<T>>(
    '/api/accounts/verify-artist-email-code/',
    payload,
  );
  return data;
};

export const fetchArtistOnboardingStatus = async (artistId: string) => {
  const { data } = await authApi.get<ApiEnvelope<ArtistOnboardingStatus>>(
    `/api/accounts/artist-onboarding-status/${artistId}/`,
  );
  return data;
};

export const completeArtistProfile = async (formData: FormData) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus>>(
    '/api/accounts/complete-artist-profile/',
    formData,
  );
  return data;
};

export const completeArtistSocial = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus>>(
    '/api/accounts/complete-artist-social/',
    payload,
  );
  return data;
};

export const completeArtistPayment = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus>>(
    '/api/accounts/complete-artist-payment/',
    payload,
  );
  return data;
};

export const completeArtistPublisher = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus>>(
    '/api/accounts/complete-artist-publisher/',
    payload,
  );
  return data;
};

export const completeArtistOnboarding = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus>>(
    '/api/accounts/complete-artist-onboarding/',
    payload,
  );
  return data;
};

export const skipArtistOnboardingStep = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus>>(
    '/api/accounts/skip-artist-onboarding/',
    payload,
  );
  return data;
};

export interface KycDocumentSummary {
  id: number;
  document_type: string;
  document_type_display?: string;
  status?: string;
  status_display?: string;
  original_filename?: string;
  file_size?: number;
  uploaded_at?: string;
}

export const uploadKycDocument = async (formData: FormData) => {
  const { data } = await authApi.post<ApiEnvelope<{ document_id: number }>>(
    '/api/accounts/upload-kyc-documents/',
    formData,
  );
  return data;
};

export const fetchKycDocuments = async () => {
  const { data } = await authApi.get<ApiEnvelope<{ documents?: KycDocumentSummary[] }>>(
    '/api/accounts/get-kyc-documents/',
  );
  return data;
};

export const skipArtistVerification = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus | Record<string, unknown>>>(
    '/api/accounts/skip-verification/',
    payload,
  );
  return data;
};

export const resumeArtistVerification = async () => {
  const { data } = await authApi.post<ApiEnvelope<Record<string, unknown>>>(
    '/api/accounts/resume-verification/',
    {},
  );
  return data;
};
