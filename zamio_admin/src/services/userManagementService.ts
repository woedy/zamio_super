import { baseUrl, userToken } from '../constants';

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  user_type: 'Artist' | 'Station' | 'Admin' | 'Publisher';
  kyc_status: 'pending' | 'verified' | 'rejected' | 'incomplete';
  is_active: boolean;
  email_verified: boolean;
  profile_complete: boolean;
  two_factor_enabled: boolean;
  last_activity?: string;
  timestamp: string;
  photo_url?: string;
  failed_login_attempts?: number;
  account_locked_until?: string;
  
  // Type-specific data
  artist_id?: string;
  stage_name?: string;
  self_published?: boolean;
  publisher_id?: string;
  company_name?: string;
  station_id?: string;
  station_name?: string;
}

export interface UserDetails extends User {
  kyc_documents: Record<string, any>;
  permissions: Array<{
    permission: string;
    granted_by: string;
    granted_at: string;
    expires_at?: string;
  }>;
  recent_activity: Array<{
    action: string;
    resource_type?: string;
    resource_id?: string;
    timestamp: string;
    ip_address?: string;
    status_code?: number;
  }>;
  artist_profile?: {
    artist_id: string;
    stage_name: string;
    bio: string;
    self_published: boolean;
    total_tracks: number;
    total_earnings: number;
  };
  publisher_profile?: {
    publisher_id: string;
    company_name: string;
    website: string;
    verified: boolean;
    total_artists: number;
  };
  station_profile?: {
    station_id: string;
    name: string;
    city: string;
    region: string;
    frequency: string;
    compliance_status: string;
  };
}

export interface UserManagementOverview {
  user_stats: {
    total_users: number;
    artists: number;
    publishers: number;
    stations: number;
    admins: number;
  };
  kyc_stats: {
    pending: number;
    verified: number;
    rejected: number;
    incomplete: number;
  };
  recent_stats: {
    new_registrations: number;
    kyc_submissions: number;
    active_users: number;
  };
  account_stats: {
    active: number;
    inactive: number;
    email_verified: number;
    profile_complete: number;
  };
  last_updated: string;
}

export interface UserFilters {
  search?: string;
  user_type?: string;
  kyc_status?: string;
  account_status?: string;
  order_by?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page_number: number;
    per_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
    next?: number;
    previous?: number;
  };
  filters_applied: UserFilters;
}

export interface BulkOperationResult {
  operation: string;
  total_requested: number;
  successful_updates: number;
  failed_updates: number;
  updated_users: Array<{
    user_id: string;
    email: string;
    operation: string;
  }>;
  failed_users: Array<{
    user_id: string;
    email: string;
    error: string;
  }>;
  performed_by: string;
  performed_at: string;
}

class UserManagementService {
  private baseURL = `${baseUrl}api/accounts/admin/`;
  
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${userToken}`,
    };
  }

  async getOverview(): Promise<UserManagementOverview> {
    const response = await fetch(`${this.baseURL}user-management-overview/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch overview: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getAllUsers(filters: UserFilters = {}): Promise<PaginatedUsers> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseURL}all-users/?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async getUserDetails(userId: string): Promise<UserDetails> {
    const response = await fetch(`${this.baseURL}user-details/?user_id=${userId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async updateKycStatus(data: {
    user_id: string;
    kyc_status: 'pending' | 'verified' | 'rejected' | 'incomplete';
    rejection_reason?: string;
    admin_notes?: string;
  }): Promise<{
    user_id: string;
    email: string;
    old_kyc_status: string;
    new_kyc_status: string;
    updated_by: string;
    updated_at: string;
  }> {
    const response = await fetch(`${this.baseURL}update-kyc-status/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.system?.[0] || 'Failed to update KYC status');
    }

    const result = await response.json();
    return result.data;
  }

  async updateUserStatus(data: {
    user_id: string;
    action: 'activate' | 'deactivate' | 'suspend';
    reason?: string;
    suspension_duration?: number;
  }): Promise<{
    user_id: string;
    email: string;
    action: string;
    old_status: any;
    new_status: any;
    updated_by: string;
    updated_at: string;
    reason: string;
  }> {
    const response = await fetch(`${this.baseURL}update-user-status/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.system?.[0] || 'Failed to update user status');
    }

    const result = await response.json();
    return result.data;
  }

  async bulkUserOperations(data: {
    user_ids: string[];
    operation: 'activate' | 'deactivate' | 'export' | 'update_kyc';
    operation_data?: Record<string, any>;
  }): Promise<BulkOperationResult | Blob> {
    const response = await fetch(`${this.baseURL}bulk-user-operations/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.system?.[0] || 'Failed to perform bulk operation');
    }

    // Handle CSV export
    if (data.operation === 'export') {
      return response.blob();
    }

    const result = await response.json();
    return result.data;
  }

  async getKycPendingUsers(): Promise<User[]> {
    const response = await fetch(this.baseURL + `kyc-pending-users/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch KYC pending users: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.users;
  }

  // Utility methods
  getUserTypeColor(userType: string): string {
    const colors = {
      'Artist': 'bg-blue-100 text-blue-800',
      'Publisher': 'bg-green-100 text-green-800',
      'Station': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800',
    };
    return colors[userType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  getKycStatusColor(status: string): string {
    const colors = {
      'verified': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'incomplete': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  getAccountStatusColor(isActive: boolean): string {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadCsvFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const userManagementService = new UserManagementService();