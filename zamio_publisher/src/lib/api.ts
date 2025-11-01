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
  authApi as default,
  authApi,
  loginWithPassword,
  legacyRoleLogin,
  getStoredAuth,
  logout,
  resolveApiBaseUrl,
};

export type { LegacyLoginResponse };

export interface RegisterPublisherPayload {
  first_name: string;
  last_name: string;
  publisher_name: string;
  email: string;
  phone: string;
  country?: string;
  password: string;
  password2: string;
}

export interface VerifyPublisherEmailCodePayload {
  email: string;
  code: string;
}

export interface ApiErrorMap {
  [field: string]: string[] | string | undefined;
}

export type ApiEnvelope<T = Record<string, unknown>> = LegacyLoginResponse & {
  data?: T;
  errors?: ApiErrorMap;
  message?: string;
  [key: string]: unknown;
};

export interface PublisherOnboardingProgress {
  profile_completed?: boolean;
  revenue_split_completed?: boolean;
  link_artist_completed?: boolean;
  payment_info_added?: boolean;
  [key: string]: unknown;
}

export interface PublisherCompanyProfile {
  company_name?: string | null;
  company_type?: string | null;
  industry?: string | null;
  founded_year?: number | null;
  employee_count?: number | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;
  postal_code?: string | null;
  location_name?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  website_url?: string | null;
  description?: string | null;
  business_registration_number?: string | null;
  license_number?: string | null;
  tax_id?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  compliance_officer_name?: string | null;
  compliance_officer_email?: string | null;
  compliance_officer_phone?: string | null;
  compliance_officer_title?: string | null;
  logo_url?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  [key: string]: unknown;
}

export interface PublisherRevenueSplit {
  writer_split?: number | string | null;
  publisher_split?: number | string | null;
  mechanical_share?: number | string | null;
  performance_share?: number | string | null;
  sync_share?: number | string | null;
  administrative_fee_percentage?: number | string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface PublisherPaymentPreferences {
  preferred_method?: string | null;
  payout_currency?: string | null;
  payout_frequency?: string | null;
  minimum_payout_amount?: number | string | null;
  withholding_tax_rate?: number | string | null;
  vat_registration_number?: string | null;
  tax_id?: string | null;
  business_registration_number?: string | null;
  momo_provider?: string | null;
  momo_account?: string | null;
  momo_account_name?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  bank_branch_code?: string | null;
  bank_swift_code?: string | null;
  [key: string]: unknown;
}

export interface LinkedArtistSummary {
  artist_id?: string | null;
  stage_name?: string | null;
  legal_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  relationship_type?: string | null;
  relationship_id?: number | null;
  linked_date?: string | null;
  catalog_size?: number | null;
  last_activity?: string | null;
  [key: string]: unknown;
}

export interface PublisherOnboardingStatus {
  publisher_id?: string;
  onboarding_step?: string;
  next_step?: string;
  progress?: PublisherOnboardingProgress;
  company_profile?: PublisherCompanyProfile;
  revenue_split?: PublisherRevenueSplit;
  payment_preferences?: PublisherPaymentPreferences;
  linked_artists?: LinkedArtistSummary[];
  kyc_status?: string | null;
  kyc_documents?: unknown;
  profile_complete_percentage?: number;
  next_recommended_step?: string;
  required_fields?: Record<string, unknown>;
  admin_approval_required?: boolean;
  [key: string]: unknown;
}

export interface PublisherArtistSearchResult {
  artist_id?: string | null;
  stage_name?: string | null;
  legal_name?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  relationship_type?: string | null;
  relationship_id?: number | null;
  linked_date?: string | null;
  catalog_size?: number | null;
  last_activity?: string | null;
  [key: string]: unknown;
}

export interface PublisherDashboardStat {
  value?: number;
  change?: number;
  target?: number;
  targetLabel?: string | null;
}

export interface PublisherDashboardStatsBlock {
  totalPerformances?: PublisherDashboardStat;
  totalEarnings?: PublisherDashboardStat;
  worksInCatalog?: PublisherDashboardStat;
  activeStations?: PublisherDashboardStat;
  [key: string]: PublisherDashboardStat | undefined;
}

export interface PublisherDashboardTrendPoint {
  period?: string | null;
  label?: string | null;
  airplay?: number;
  streaming?: number;
  total?: number;
}

export interface PublisherDashboardTopSong {
  trackId?: number | string | null;
  title?: string | null;
  artist?: string | null;
  plays?: number;
  earnings?: number;
  stations?: number;
  [key: string]: unknown;
}

export interface PublisherDashboardRegionPerformance {
  region?: string | null;
  plays?: number;
  earnings?: number;
  stations?: number;
  growth?: number;
  [key: string]: unknown;
}

export interface PublisherDashboardStationBreakdown {
  stationId?: number | string | null;
  name?: string | null;
  region?: string | null;
  plays?: number;
  percentage?: number;
  [key: string]: unknown;
}

export interface PublisherDashboardActivityItem {
  id?: string | number;
  type?: string | null;
  title?: string | null;
  description?: string | null;
  timestamp?: string | null;
  time?: string | null;
  [key: string]: unknown;
}

export interface PublisherDashboardRosterSummary {
  writerCount?: number;
  agreementCount?: number;
  publisherSplit?: number;
  writerSplit?: number;
  unclaimedLogs?: number;
  disputes?: number;
  [key: string]: unknown;
}

export interface PublisherDashboardTopArtist {
  artistId?: number | string | null;
  name?: string | null;
  plays?: number;
  revenue?: number;
  trend?: number;
  [key: string]: unknown;
}

export interface PublisherDashboardPerformanceScore {
  overall?: number;
  publishingGrowth?: number;
  revenueGrowth?: number;
  catalogQuality?: number;
  [key: string]: unknown;
}

export interface PublisherDashboardTargets {
  performancesTarget?: number;
  earningsTarget?: number;
  catalogTarget?: number;
  stationTarget?: number;
  [key: string]: unknown;
}

export interface PublisherDashboardMetadata {
  period?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  [key: string]: unknown;
}

export interface PublisherDashboardPayload {
  stats?: PublisherDashboardStatsBlock;
  playsOverTime?: PublisherDashboardTrendPoint[];
  topSongs?: PublisherDashboardTopSong[];
  regionPerformance?: PublisherDashboardRegionPerformance[];
  topStations?: PublisherDashboardStationBreakdown[];
  recentActivity?: PublisherDashboardActivityItem[];
  roster?: PublisherDashboardRosterSummary;
  topArtists?: PublisherDashboardTopArtist[];
  performanceScore?: PublisherDashboardPerformanceScore;
  targets?: PublisherDashboardTargets;
  metadata?: PublisherDashboardMetadata;
  [key: string]: unknown;
}

export interface PublisherDashboardParams {
  period?: string;
  start_date?: string;
  end_date?: string;
}

export const registerPublisher = async <T = Record<string, unknown>>(
  payload: RegisterPublisherPayload,
) => {
  const { data } = await authApi.post<ApiEnvelope<T>>('/api/accounts/register-publisher/', payload);
  return data;
};

export const verifyPublisherEmailCode = async <T = Record<string, unknown>>(
  payload: VerifyPublisherEmailCodePayload,
) => {
  const { data } = await authApi.post<ApiEnvelope<T>>('/api/accounts/verify-publisher-email-code/', payload);
  return data;
};

export const fetchPublisherOnboardingStatus = async (publisherId: string) => {
  const { data } = await authApi.get<ApiEnvelope<PublisherOnboardingStatus>>(
    `/api/accounts/publisher-onboarding-status/${publisherId}/`,
  );
  return data;
};

export const fetchPublisherDashboard = async (
  publisherId: string,
  params: PublisherDashboardParams = {},
) => {
  const query: Record<string, string> = {
    publisher_id: publisherId,
  };

  if (params.period) {
    query.period = params.period;
  }
  if (params.start_date) {
    query.start_date = params.start_date;
  }
  if (params.end_date) {
    query.end_date = params.end_date;
  }

  const { data } = await authApi.get<ApiEnvelope<PublisherDashboardPayload>>(
    '/api/publishers/dashboard/',
    { params: query },
  );

  return data;
};

export const completePublisherProfile = async (formData: FormData) => {
  const { data } = await authApi.post<ApiEnvelope<PublisherOnboardingStatus>>(
    '/api/accounts/complete-publisher-profile/',
    formData,
  );
  return data;
};

export const completePublisherRevenueSplit = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<PublisherOnboardingStatus>>(
    '/api/accounts/complete-revenue-split/',
    payload,
  );
  return data;
};

export const completePublisherArtistLink = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<PublisherOnboardingStatus>>(
    '/api/accounts/complete-link-artist/',
    payload,
  );
  return data;
};

export const completePublisherPayment = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<PublisherOnboardingStatus>>(
    '/api/accounts/complete-publisher-payment/',
    payload,
  );
  return data;
};

export const skipPublisherOnboardingStep = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<PublisherOnboardingStatus>>(
    '/api/accounts/skip-publisher-onboarding/',
    payload,
  );
  return data;
};

export const completePublisherOnboarding = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope<PublisherOnboardingStatus>>(
    '/api/accounts/complete-publisher-onboarding/',
    payload,
  );
  return data;
};

export const createArtistRelationship = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope>(
    '/api/accounts/create-artist-relationship/',
    payload,
  );
  return data;
};

export const inviteArtist = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope>('/api/accounts/invite-artist/', payload);
  return data;
};

export const searchPublisherArtists = async (
  publisherId: string,
  query: string,
) => {
  const { data } = await authApi.get<ApiEnvelope<{ results?: PublisherArtistSearchResult[] }>>(
    '/api/accounts/search-publisher-artists/',
    {
      params: {
        publisher_id: publisherId,
        query,
      },
    },
  );
  return data;
};

export const logoutPublisher = async (payload: Record<string, unknown>) => {
  const { data } = await authApi.post<ApiEnvelope>('/api/accounts/logout-publisher/', payload);
  return data;
};
