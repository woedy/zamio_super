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
  kyc_submitted?: boolean;
  kyc_verified?: boolean;
  [key: string]: unknown;
}

export interface ArtistProfileDetails {
  stage_name?: string;
  bio?: string | null;
  country?: string | null;
  region?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  photo?: string | null;
}

export interface ArtistSocialLinks {
  website?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  spotify?: string | null;
  [key: string]: string | null | undefined;
}

export interface ArtistPaymentPreferences {
  momo?: string | null;
  bank_account?: string | null;
  [key: string]: unknown;
}

export interface ArtistPublisherPreferences {
  is_self_published?: boolean;
  publisher_id?: string | null;
  publisher_name?: string | null;
  [key: string]: unknown;
}

export interface ArtistKycDocumentSummary {
  id?: number;
  document_type?: string;
  document_type_display?: string;
  status?: string;
  status_display?: string;
  original_filename?: string;
  file_size?: number;
  uploaded_at?: string | null;
  [key: string]: unknown;
}

export interface ArtistKycSummary {
  status?: string;
  verification_status?: string;
  documents?: ArtistKycDocumentSummary[];
  can_skip?: boolean;
  verification_required_for_features?: string[];
  [key: string]: unknown;
}

export interface ArtistOnboardingStatus {
  artist_id?: string;
  onboarding_step?: string;
  next_step?: string;
  next_recommended_step?: string;
  progress?: ArtistOnboardingProgress;
  onboarding_progress?: ArtistOnboardingProgress;
  completion_percentage?: number;
  required_fields?: Record<string, unknown>;
  verification_required_for_features?: string[];
  profile?: ArtistProfileDetails | null;
  social_links?: ArtistSocialLinks | null;
  payment_preferences?: ArtistPaymentPreferences | null;
  publisher_preferences?: ArtistPublisherPreferences | null;
  kyc?: ArtistKycSummary | null;
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
    { headers: { 'Content-Type': 'multipart/form-data' } },
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

export interface KycDocumentsEnvelope {
  message?: string;
  data?: {
    documents?: ArtistKycDocumentSummary[];
    kyc_status?: string;
    [key: string]: unknown;
  };
}

export const fetchKycDocuments = async () => {
  const { data } = await authApi.get<KycDocumentsEnvelope>('/api/accounts/get-kyc-documents/');
  return data;
};

export interface UploadKycDocumentResponse extends ApiEnvelope<ArtistKycDocumentSummary> {}

export const uploadKycDocument = async (formData: FormData) => {
  const { data } = await authApi.post<UploadKycDocumentResponse>(
    '/api/accounts/upload-kyc-documents/',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
};

export const deleteKycDocument = async (documentId: number) => {
  const { data } = await authApi.delete<ApiEnvelope<unknown>>(
    `/api/accounts/delete-kyc-document/${documentId}/`,
  );
  return data;
};

export const deriveNextArtistOnboardingStep = (
  payload?: {
    next_step?: string | null;
    onboarding_step?: string | null;
    next_recommended_step?: string | null;
  } | null,
) => {
  if (!payload) {
    return null;
  }
  const pointer = typeof payload.next_step === 'string' && payload.next_step.length > 0
    ? payload.next_step
    : typeof payload.onboarding_step === 'string'
      ? payload.onboarding_step
      : null;
  const recommended = typeof payload.next_recommended_step === 'string'
    ? payload.next_recommended_step
    : null;

  let effective = pointer;
  if (effective === 'done' && recommended && recommended !== 'done') {
    effective = recommended;
  }

  if (effective === 'track') {
    effective = recommended && recommended !== 'track' ? recommended : null;
  }

  if (effective === 'done' || !effective) {
    return null;
  }

  return effective;
};
