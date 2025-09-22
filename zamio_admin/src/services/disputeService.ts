import { baseUrl, userToken } from '../constants';

export interface Dispute {
  dispute_id: string;
  title: string;
  description: string;
  dispute_type: string;
  status: string;
  priority: string;
  submitted_by: {
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
  assigned_to?: {
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  evidence_count: number;
  comments_count: number;
  days_open: number;
  available_transitions?: string[];
  timeline?: TimelineEvent[];
  resolution_summary?: string;
  resolution_action_taken?: string;
  related_track_info?: {
    id: number;
    title: string;
    artist: string;
  };
  related_station_info?: {
    id: number;
    name: string;
    location: string;
  };
}

export interface DisputeEvidence {
  id: number;
  title: string;
  description: string;
  file?: string;
  file_url?: string;
  file_type: string;
  file_size?: number;
  text_content: string;
  external_url: string;
  uploaded_by: {
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
  uploaded_at: string;
}

export interface DisputeComment {
  id: number;
  content: string;
  is_internal: boolean;
  author: {
    user_id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
  parent_comment?: number;
  created_at: string;
  updated_at: string;
  replies: DisputeComment[];
}

export interface TimelineEvent {
  type: 'audit_log' | 'comment' | 'evidence';
  timestamp: string;
  actor: string;
  action: string;
  description: string;
  previous_state?: string;
  new_state?: string;
  is_internal?: boolean;
  evidence_id?: number;
}

export interface DisputeStats {
  total_disputes: number;
  open_disputes: number;
  resolved_disputes: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  average_resolution_time: number;
  recent_activity: Array<{
    created_at__date: string;
    count: number;
  }>;
}

export interface DisputeChoices {
  dispute_types: Array<{ value: string; label: string }>;
  dispute_statuses: Array<{ value: string; label: string }>;
  dispute_priorities: Array<{ value: string; label: string }>;
}

export interface DisputeFilters {
  status?: string;
  type?: string;
  priority?: string;
  assigned_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

class DisputeService {
  private baseURL = `${baseUrl}api/disputes/`;
  
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    };
  }

  async getDisputes(filters: DisputeFilters = {}): Promise<{
    results: Dispute[];
    count: number;
    next: string | null;
    previous: string | null;
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseURL}disputes/?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch disputes: ${response.statusText}`);
    }

    return response.json();
  }

  async getDispute(disputeId: string): Promise<Dispute> {
    const response = await fetch(`${this.baseURL}disputes/${disputeId}/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dispute: ${response.statusText}`);
    }

    return response.json();
  }

  async createDispute(disputeData: {
    title: string;
    description: string;
    dispute_type: string;
    priority?: string;
    related_track?: number;
    related_detection?: number;
    related_royalty?: number;
    related_station?: number;
    metadata?: Record<string, any>;
  }): Promise<Dispute> {
    const response = await fetch(`${this.baseURL}disputes/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(disputeData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create dispute');
    }

    return response.json();
  }

  async updateDispute(disputeId: string, updateData: {
    title?: string;
    description?: string;
    priority?: string;
    assigned_to?: string;
    resolution_summary?: string;
    resolution_action_taken?: string;
    metadata?: Record<string, any>;
  }): Promise<Dispute> {
    const response = await fetch(`${this.baseURL}disputes/${disputeId}/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update dispute');
    }

    return response.json();
  }

  async transitionStatus(disputeId: string, data: {
    new_status: string;
    reason?: string;
    notify?: boolean;
  }): Promise<Dispute> {
    const response = await fetch(`${this.baseURL}disputes/${disputeId}/transition_status/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to transition status');
    }

    return response.json();
  }

  async assignDispute(disputeId: string, data: {
    assignee_id: string;
    reason?: string;
  }): Promise<Dispute> {
    const response = await fetch(`${this.baseURL}disputes/${disputeId}/assign/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign dispute');
    }

    return response.json();
  }

  async addEvidence(disputeId: string, evidenceData: FormData): Promise<DisputeEvidence> {
    const headers = {
      'Authorization': `Bearer ${userToken}`,
    };

    const response = await fetch(`${this.baseURL}disputes/${disputeId}/add_evidence/`, {
      method: 'POST',
      headers,
      body: evidenceData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add evidence');
    }

    return response.json();
  }

  async addComment(disputeId: string, commentData: {
    content: string;
    is_internal?: boolean;
    parent_comment?: number;
  }): Promise<DisputeComment> {
    const response = await fetch(`${this.baseURL}disputes/${disputeId}/add_comment/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add comment');
    }

    return response.json();
  }

  async getTimeline(disputeId: string): Promise<{ timeline: TimelineEvent[] }> {
    const response = await fetch(`${this.baseURL}disputes/${disputeId}/timeline/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch timeline: ${response.statusText}`);
    }

    return response.json();
  }

  async getStats(): Promise<DisputeStats> {
    const response = await fetch(`${this.baseURL}disputes/stats/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return response.json();
  }

  async getChoices(): Promise<DisputeChoices> {
    const response = await fetch(`${this.baseURL}disputes/choices/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch choices: ${response.statusText}`);
    }

    return response.json();
  }

  // Notification methods
  async getNotifications(): Promise<any[]> {
    const response = await fetch(`${this.baseURL}notifications/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    const response = await fetch(`${this.baseURL}notifications/${notificationId}/mark_read/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    const response = await fetch(`${this.baseURL}notifications/mark_all_read/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }
  }

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await fetch(`${this.baseURL}notifications/unread_count/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }

    return response.json();
  }
}

export const disputeService = new DisputeService();