import { baseUrl, userToken } from '../constants';

export interface PublisherMetrics {
  publishers: Array<{
    publisher_id: string;
    company_name: string;
    verified: boolean;
    artist_count: number;
    agreement_count: number;
    total_tracks: number;
    total_earnings: number;
    total_plays: number;
    recent_plays: number;
    region?: string;
    country?: string;
    created_at: string;
    user: {
      name: string;
      email: string;
      photo?: string;
    };
  }>;
  total_publishers: number;
  total_verified: number;
  total_artists_managed: number;
  total_agreements: number;
}

export interface PublisherAnalytics {
  top_publishers: Array<{
    publisher_id: string;
    company_name: string;
    total_earnings: number;
    region?: string;
  }>;
  monthly_registrations: Array<{
    month: string;
    registrations: number;
  }>;
  regional_distribution: Array<{
    region: string;
    count: number;
  }>;
}

export interface PublisherDetail {
  publisher: {
    publisher_id: string;
    company_name: string;
    verified: boolean;
    region?: string;
    city?: string;
    country?: string;
    writer_split: number;
    publisher_split: number;
    total_earnings: number;
    total_tracks: number;
    total_plays: number;
    created_at: string;
    user: {
      name: string;
      email: string;
      photo?: string;
    };
  };
  artists: Array<{
    artist_id: string;
    stage_name: string;
    name: string;
    track_count: number;
    earnings: number;
    relationship_type: string;
    royalty_split: number;
    start_date: string;
  }>;
  agreements: Array<{
    id: number;
    track_title: string;
    artist_name: string;
    writer_share: number;
    publisher_share: number;
    status: string;
    agreement_date: string;
    verified: boolean;
  }>;
}

class PublisherService {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${userToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getPublisherMetrics(): Promise<PublisherMetrics> {
    return this.makeRequest<PublisherMetrics>('api/publishers/metrics/');
  }

  async getPublisherAnalytics(): Promise<PublisherAnalytics> {
    return this.makeRequest<PublisherAnalytics>('api/publishers/analytics/');
  }

  async getPublisherDetail(publisherId: string): Promise<PublisherDetail> {
    return this.makeRequest<PublisherDetail>(`api/publishers/detail/?publisher_id=${publisherId}`);
  }
}

export const publisherService = new PublisherService();