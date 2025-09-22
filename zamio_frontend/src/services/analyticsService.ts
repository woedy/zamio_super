import { baseUrl, userToken } from '../constants';

export interface DateRange {
  start: string;
  end: string;
}

export interface AnalyticsParams {
  dateRange?: DateRange;
  range?: '7d' | '30d' | '90d' | '1y' | 'custom';
}

export interface ArtistAnalytics {
  artist_info: {
    artist_id: string;
    stage_name: string;
    total_tracks: number;
    verified: boolean;
  };
  summary: {
    total_plays: number;
    total_revenue: number;
    avg_confidence_score: number;
    unique_stations: number;
    plays_trend: {
      percentage: number;
      direction: 'up' | 'down' | 'neutral';
      status: 'positive' | 'negative' | 'neutral';
    };
    revenue_trend: {
      percentage: number;
      direction: 'up' | 'down' | 'neutral';
      status: 'positive' | 'negative' | 'neutral';
    };
  };
  top_tracks: Array<{
    track__title: string;
    track__track_id: string;
    play_count: number;
    revenue: number;
  }>;
  geographic_distribution: Array<{
    station__region: string;
    station__city: string;
    play_count: number;
    revenue: number;
  }>;
  daily_trends: Array<{
    date: string;
    plays: number;
    revenue: number;
  }>;
  station_performance: Array<{
    station__name: string;
    station__station_id: string;
    station__station_class: string;
    play_count: number;
    revenue: number;
    avg_confidence: number;
  }>;
  date_range: {
    start: string;
    end: string;
  };
  generated_at: string;
}

export interface PublisherAnalytics {
  publisher_info: {
    publisher_id: number;
    company_name: string;
    total_artists: number;
    total_tracks: number;
  };
  portfolio_summary: {
    total_plays: number;
    total_revenue: number;
    unique_stations: number;
    unique_tracks: number;
    avg_revenue_per_play: number;
  };
  artist_performance: Array<{
    artist_id: string;
    stage_name: string;
    plays: number;
    revenue: number;
    tracks_count: number;
    avg_revenue_per_track: number;
  }>;
  revenue_distribution: Array<{
    track__artist__stage_name: string;
    track__artist__artist_id: string;
    revenue: number;
    plays: number;
  }>;
  monthly_trends: Array<{
    month: string;
    plays: number;
    revenue: number;
    unique_artists: number;
  }>;
  date_range: {
    start: string;
    end: string;
  };
  generated_at: string;
}

export interface StationAnalytics {
  station_info: {
    station_id: string;
    name: string;
    station_class: string;
    station_type: string;
    region: string;
    city: string;
  };
  summary: {
    total_plays: number;
    total_revenue_generated: number;
    avg_confidence_score: number;
    unique_tracks: number;
    unique_artists: number;
    detection_accuracy_rate: number;
  };
  detection_metrics: {
    total_detections: number;
    high_confidence_detections: number;
    avg_detection_confidence: number;
    detection_source_breakdown: {
      local: number;
      acrcloud: number;
      total: number;
    };
  };
  top_tracks: Array<{
    track__title: string;
    track__artist__stage_name: string;
    track__track_id: string;
    play_count: number;
    avg_confidence: number;
  }>;
  hourly_distribution: Array<{
    hour: number;
    plays: number;
  }>;
  daily_compliance: Array<{
    date: string;
    submitted_plays: number;
    detected_plays: number;
    compliance_rate: number;
  }>;
  date_range: {
    start: string;
    end: string;
  };
  generated_at: string;
}

export interface AdminAnalytics {
  platform_overview: {
    total_users: number;
    total_artists: number;
    total_stations: number;
    total_publishers: number;
    total_tracks: number;
  };
  period_summary: {
    total_plays: number;
    total_revenue: number;
    unique_tracks_played: number;
    active_stations: number;
    processing_success_rate: number;
  };
  detection_health: {
    total_detections: number;
    successful_detections: number;
    failed_detections: number;
    avg_confidence_score: number;
  };
  regional_performance: Array<{
    station__region: string;
    plays: number;
    revenue: number;
    unique_stations: number;
  }>;
  revenue_distribution: Array<{
    recipient_type: string;
    total_amount: number;
    count: number;
  }>;
  daily_activity: Array<{
    date: string;
    plays: number;
    detections: number;
    new_users: number;
    new_tracks: number;
  }>;
  date_range: {
    start: string;
    end: string;
  };
  generated_at: string;
}

export interface RealtimeMetrics {
  metrics: {
    [key: string]: {
      value: number;
      timestamp: string;
      metadata?: any;
    };
  };
  timestamp: string;
}

export interface ExportRequest {
  export_type: 'artist_analytics' | 'publisher_analytics' | 'station_analytics' | 'admin_analytics' | 'royalty_report' | 'detection_report';
  export_format: 'csv' | 'excel' | 'pdf' | 'json';
  parameters?: any;
}

export interface ExportStatus {
  export_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  file_size_bytes?: number;
  requested_at: string;
  completed_at?: string;
  expires_at?: string;
  error_message?: string;
}

class AnalyticsService {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = baseUrl;
    this.token = userToken;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}api/analytics/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private buildQueryParams(params: AnalyticsParams): string {
    const searchParams = new URLSearchParams();
    
    if (params.dateRange) {
      searchParams.append('start_date', params.dateRange.start);
      searchParams.append('end_date', params.dateRange.end);
    } else if (params.range) {
      searchParams.append('range', params.range);
    }
    
    return searchParams.toString();
  }

  // Artist Analytics
  async getArtistAnalytics(artistId?: string, params: AnalyticsParams = {}): Promise<ArtistAnalytics> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = artistId 
      ? `artist/${artistId}/?${queryParams}`
      : `artist/?${queryParams}`;
    
    return this.makeRequest<ArtistAnalytics>(endpoint);
  }

  // Publisher Analytics
  async getPublisherAnalytics(publisherId?: number, params: AnalyticsParams = {}): Promise<PublisherAnalytics> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = publisherId 
      ? `publisher/${publisherId}/?${queryParams}`
      : `publisher/?${queryParams}`;
    
    return this.makeRequest<PublisherAnalytics>(endpoint);
  }

  // Station Analytics
  async getStationAnalytics(stationId?: string, params: AnalyticsParams = {}): Promise<StationAnalytics> {
    const queryParams = this.buildQueryParams(params);
    const endpoint = stationId 
      ? `station/${stationId}/?${queryParams}`
      : `station/?${queryParams}`;
    
    return this.makeRequest<StationAnalytics>(endpoint);
  }

  // Admin Analytics
  async getAdminAnalytics(params: AnalyticsParams = {}): Promise<AdminAnalytics> {
    const queryParams = this.buildQueryParams(params);
    return this.makeRequest<AdminAnalytics>(`admin/?${queryParams}`);
  }

  // Real-time Metrics
  async getRealtimeMetrics(metrics: string[] = []): Promise<RealtimeMetrics> {
    const queryParams = metrics.length > 0 
      ? `?${metrics.map(m => `metrics=${m}`).join('&')}`
      : '';
    
    return this.makeRequest<RealtimeMetrics>(`realtime/${queryParams}`);
  }

  // Export Functionality
  async requestExport(request: ExportRequest): Promise<{ export_id: string; status: string; message: string }> {
    return this.makeRequest('export/request/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getExportStatus(exportId: string): Promise<ExportStatus> {
    return this.makeRequest<ExportStatus>(`export/${exportId}/status/`);
  }

  async downloadExport(exportId: string): Promise<{ download_url: string; file_size: number; expires_at: string }> {
    return this.makeRequest(`export/${exportId}/download/`);
  }

  // User Preferences
  async getUserPreferences(): Promise<any> {
    return this.makeRequest('preferences/');
  }

  async updateUserPreferences(preferences: any): Promise<{ message: string }> {
    return this.makeRequest('preferences/', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  // Comparative Analytics
  async getComparativeAnalytics(type: 'period' | 'peer' | 'regional', params: any = {}): Promise<any> {
    const queryParams = new URLSearchParams({ type, ...params }).toString();
    return this.makeRequest(`comparative/?${queryParams}`);
  }
}

export const analyticsService = new AnalyticsService();