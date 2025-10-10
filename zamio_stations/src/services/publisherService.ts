const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9001/';

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

class PublisherService {
  private async makeRequest<T>(endpoint: string): Promise<T> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
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
}

export const publisherService = new PublisherService();