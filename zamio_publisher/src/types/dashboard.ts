export interface TopSong {
  title: string;
  plays: number;
  earnings: number;
  confidence: number; // percentage 0-100
  stations: number;
}

export interface PlaysOverTimePoint {
  date: string; // YYYY-MM-DD
  airplay: number;
  streaming: number;
}

export interface GhanaRegionBreakdownItem {
  region: string;
  plays: number;
  earnings: number;
  stations: number;
  growth: number; // percentage
}

export interface StationBreakdownItem {
  station: string;
  plays: number;
  percentage: number; // percentage of total
  region: string;
}

export interface FanDemographicItem {
  ageGroup: string; // e.g., "18-24"
  percentage: number;
}

export interface PerformanceScore {
  overall: number; // 0-10
  airplayGrowth: number; // percentage
  RegionalReach: number; // regions count
  fanEngagement: number;
}

export interface PublisherDashboardData {
  period: string;
  start_date?: string | null;
  end_date?: string | null;
  publisherName: string;
  totalPlays: number;
  totalStations: number;
  totalEarnings: number;
  radioPlays: number;
  streamingPlays: number;
  radioEarnings: number;
  streamingEarnings: number;
  confidenceScore: number;
  activeRegions: number;
  worksCount: number;
  writersCount: number;
  agreementsCount: number;
  topSongs: TopSong[];
  playsOverTime: PlaysOverTimePoint[];
  ghanaRegions: GhanaRegionBreakdownItem[];
  stationBreakdown: StationBreakdownItem[];
  recentPlays: RecentPlay[];
  pipeline: Pipeline;
  splits: Splits;
}

export interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export interface RecentPlay {
  track: string;
  station: string;
  region: string;
  playedAt: string | null;
  source: 'Radio' | 'Streaming' | string;
  confidence: number;
  royalty: number;
}

export interface Pipeline {
  accrued: number;
  unclaimedCount: number;
  disputesCount: number;
}

export interface Splits {
  publisher: number;
  writers: number;
}
