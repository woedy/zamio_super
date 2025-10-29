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

export interface IdentityProfileSnapshot {
  full_name: string;
  date_of_birth: string;
  nationality: string;
  id_type: string;
  id_number: string;
  residential_address: string;
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
  identity_profile?: IdentityProfileSnapshot;
  [key: string]: unknown;
}

export interface IdentityProfilePayload extends Partial<IdentityProfileSnapshot> {
  artist_id: string;
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

export const updateIdentityProfile = async (payload: IdentityProfilePayload) => {
  const { data } = await authApi.post<ApiEnvelope<ArtistOnboardingStatus>>(
    '/api/accounts/update-identity-profile/',
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

export interface ArtistDashboardStatsSummary {
  totalPlays: number;
  totalStations: number;
  totalEarnings: number;
  avgConfidence: number;
  growthRate: number;
  activeTracks: number;
}

export type ArtistDashboardTrend = 'up' | 'down' | 'stable';

export interface ArtistDashboardTopSong {
  title: string;
  plays: number;
  earnings: number;
  confidence: number;
  stations: number;
  trend?: ArtistDashboardTrend;
}

export interface ArtistDashboardSeriesPoint {
  date: string;
  airplay: number;
  earnings?: number;
}

export interface ArtistDashboardRegionStat {
  region: string;
  plays: number;
  earnings: number;
  stations: number;
  growth: number;
  trend?: ArtistDashboardTrend;
}

export interface ArtistDashboardStationBreakdown {
  station: string;
  plays: number;
  percentage: number;
  region: string;
  type?: string;
}

export interface ArtistDashboardPerformanceScore {
  overall: number;
  airplayGrowth: number;
  regionalReach: number;
  fanEngagement: number;
  trackQuality: number;
}

export type ArtistFanDemographicCategory = 'region' | 'country' | 'age_range';

export interface ArtistFanDemographicStat {
  category: ArtistFanDemographicCategory;
  label: string;
  fans: number;
  percentage: number;
}

export interface ArtistDashboardTargets {
  airplayTarget: number;
  earningsTarget: number;
  stationsTarget: number;
  confidenceTarget: number;
}

export interface ArtistDashboardPayload {
  period?: string;
  start_date?: string | null;
  end_date?: string | null;
  artistName?: string;
  stats?: ArtistDashboardStatsSummary;
  confidenceScore?: number;
  activeRegions?: number;
  topSongs?: ArtistDashboardTopSong[];
  playsOverTime?: ArtistDashboardSeriesPoint[];
  ghanaRegions?: ArtistDashboardRegionStat[];
  stationBreakdown?: ArtistDashboardStationBreakdown[];
  fanDemographics?: ArtistFanDemographicStat[];
  performanceScore?: ArtistDashboardPerformanceScore;
  targets?: ArtistDashboardTargets;
}

export interface ArtistDashboardParams {
  period?: string;
  start_date?: string;
  end_date?: string;
}

export interface ArtistLogPagination {
  count: number;
  page_number: number;
  page_size: number;
  total_pages: number;
  next: number | null;
  previous: number | null;
  has_next: boolean;
  has_previous: boolean;
}

export interface ArtistPlayLogRecord {
  id: number;
  track_title: string;
  artist: string | null;
  station_name: string;
  matched_at: string | null;
  stop_time: string | null;
  duration: string | null;
  royalty_amount: number;
  status: string;
  attribution_source: string;
  partner_name?: string | null;
  plays: number;
  source?: string | null;
  confidence?: number | null;
}

export interface ArtistMatchLogRecord {
  id: number;
  song: string;
  artist: string | null;
  station: string;
  matched_at: string | null;
  confidence?: number | null;
  source?: string | null;
  match_type?: string | null;
  status?: string | null;
}

export interface ArtistLogsCollection<T> {
  results: T[];
  pagination: ArtistLogPagination;
}

export interface ArtistLogsPayload {
  playLogs?: ArtistLogsCollection<ArtistPlayLogRecord>;
  matchLogs?: ArtistLogsCollection<ArtistMatchLogRecord>;
}

export interface ArtistLogsParams {
  artistId: string;
  search?: string;
  playPage?: number;
  matchPage?: number;
  playPageSize?: number;
  matchPageSize?: number;
  playSortBy?: string;
  playSortOrder?: 'asc' | 'desc';
  matchSortBy?: string;
  matchSortOrder?: 'asc' | 'desc';
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

export const fetchArtistDashboard = async (
  artistId: string,
  params: ArtistDashboardParams = {},
) => {
  const query = {
    artist_id: artistId,
    ...params,
  };

  const { data } = await authApi.get<ApiEnvelope<ArtistDashboardPayload>>(
    '/api/artists/dashboard/',
    { params: query },
  );

  return data;
};

export const fetchArtistLogs = async ({
  artistId,
  search,
  playPage,
  matchPage,
  playPageSize,
  matchPageSize,
  playSortBy,
  playSortOrder,
  matchSortBy,
  matchSortOrder,
}: ArtistLogsParams) => {
  const query: Record<string, string | number> = {
    artist_id: artistId,
  };

  if (search) {
    query.search = search;
  }
  if (typeof playPage === 'number') {
    query.play_page = playPage;
  }
  if (typeof matchPage === 'number') {
    query.match_page = matchPage;
  }
  if (typeof playPageSize === 'number') {
    query.play_page_size = playPageSize;
  }
  if (typeof matchPageSize === 'number') {
    query.match_page_size = matchPageSize;
  }
  if (playSortBy) {
    query.play_sort_by = playSortBy;
  }
  if (playSortOrder) {
    query.play_sort_order = playSortOrder;
  }
  if (matchSortBy) {
    query.match_sort_by = matchSortBy;
  }
  if (matchSortOrder) {
    query.match_sort_order = matchSortOrder;
  }

  const { data } = await authApi.get<ApiEnvelope<ArtistLogsPayload>>(
    '/api/artists/playlogs/',
    { params: query },
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

export type UploadLifecycleStatus = 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'pending';

export interface UploadManagementRecord {
  id: string;
  upload_id: string;
  status: UploadLifecycleStatus;
  raw_status?: string;
  progress: number;
  upload_type?: string;
  filename: string;
  file_size: number;
  file_type?: string | null;
  upload_date: string;
  error?: string | null;
  retry_count?: number;
  duration?: string | null;
  artist?: string | null;
  album?: string | null;
  title?: string | null;
  station?: string | null;
  entity_id?: number | null;
  metadata?: Record<string, unknown>;
}

export interface UploadManagementPagination {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface UploadManagementStats {
  total: number;
  uploading: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface UploadManagementFilters {
  albums: string[];
  status_counts?: Record<string, number>;
  frontend_status_counts?: Record<string, number>;
}

export interface UploadManagementPayload {
  uploads?: UploadManagementRecord[];
  pagination?: UploadManagementPagination;
  stats?: UploadManagementStats;
  filters?: UploadManagementFilters;
}

export interface UploadManagementParams {
  page?: number;
  page_size?: number;
  status?: string;
  upload_type?: string;
  search?: string;
  album?: string;
  sort_by?: string;
  sort_order?: string;
}

export const fetchUploadManagement = async (params: UploadManagementParams = {}) => {
  const { data } = await authApi.get<ApiEnvelope<UploadManagementPayload>>(
    '/api/artists/api/uploads/',
    { params },
  );
  return data;
};

export const initiateUpload = async (formData: FormData) => {
  const { data } = await authApi.post<ApiEnvelope<Record<string, unknown>>>(
    '/api/artists/api/upload/initiate/',
    formData,
  );
  return data;
};

export const fetchUploadStatusById = async (uploadId: string) => {
  const { data } = await authApi.get<ApiEnvelope<Record<string, any>>>(
    `/api/artists/api/upload-status/${uploadId}/`,
  );
  return data;
};

export const cancelUploadRequest = async (uploadId: string) => {
  const { data } = await authApi.delete<ApiEnvelope<Record<string, unknown>>>(
    `/api/artists/api/upload/${uploadId}/cancel/`,
  );
  return data;
};

export const deleteUploadRequest = async (uploadId: string) => {
  const { data } = await authApi.delete<ApiEnvelope<Record<string, unknown>>>(
    `/api/artists/api/upload/${uploadId}/delete/`,
  );
  return data;
};

export interface CreateAlbumPayload {
  title: string;
  release_date?: string;
  genre?: string;
}

export const createAlbumForUploads = async (payload: CreateAlbumPayload) => {
  const { data } = await authApi.post<ApiEnvelope<Record<string, unknown>>>(
    '/api/artists/api/albums/create/',
    payload,
  );
  return data;
};

export interface AlbumSummary {
  id: number;
  album_id?: string | null;
  title: string;
  artist: string;
  artist_id?: string;
  genre?: string | null;
  release_date?: string | null;
  track_count: number;
  total_plays: number;
  total_revenue: number;
  cover_art_url?: string | null;
  status: 'active' | 'inactive' | 'draft';
  raw_status?: string | null;
  is_archived: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlbumListStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
}

export interface AlbumListPagination {
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AlbumListPayload {
  albums: AlbumSummary[];
  pagination: AlbumListPagination;
  stats: AlbumListStats;
}

export interface AlbumListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export const fetchArtistAlbums = async (params: AlbumListParams = {}) => {
  const { data } = await authApi.get<ApiEnvelope<AlbumListPayload>>(
    '/api/artists/api/albums/',
    { params },
  );
  return data;
};

export interface CreateArtistAlbumPayload {
  title: string;
  release_date?: string;
  genre_id?: number;
  genre?: string;
}

export const createArtistAlbum = async (payload: CreateArtistAlbumPayload) => {
  const { data } = await authApi.post<ApiEnvelope<{ album: AlbumSummary }>>(
    '/api/artists/api/albums/manage/',
    payload,
  );
  return data;
};

export interface UpdateArtistAlbumPayload {
  title?: string;
  release_date?: string;
  genre_id?: number;
  genre?: string;
  status?: string;
  active?: boolean;
}

export const updateArtistAlbum = async (
  albumId: number,
  payload: UpdateArtistAlbumPayload,
) => {
  const { data } = await authApi.patch<ApiEnvelope<{ album: AlbumSummary }>>(
    `/api/artists/api/albums/${albumId}/`,
    payload,
  );
  return data;
};

export const deleteArtistAlbum = async (albumId: number) => {
  const { data } = await authApi.delete<ApiEnvelope<Record<string, unknown>>>(
    `/api/artists/api/albums/${albumId}/delete/`,
  );
  return data;
};
