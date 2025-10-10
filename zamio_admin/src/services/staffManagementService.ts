/**
 * Staff Management Service
 * Handles all staff management operations for the admin dashboard
 */

import { api } from '../lib/api';

export interface StaffMember {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  user_type: string;
  is_admin: boolean;
  is_staff: boolean;
  is_active: boolean;
  email_verified: boolean;
  last_activity?: string;
  created_at: string;
  permissions: string[];
}

export interface StaffDetails extends StaffMember {
  phone?: string;
  country?: string;
  profile_complete: boolean;
  kyc_status: string;
  two_factor_enabled: boolean;
  permissions: Array<{
    permission: string;
    granted_by: string;
    granted_at: string;
    expires_at?: string;
  }>;
  recent_activity: Array<{
    action: string;
    resource_type?: string;
    timestamp: string;
    ip_address?: string;
  }>;
}

export interface StaffOverview {
  staff_stats: {
    total_staff: number;
    active_staff: number;
    inactive_staff: number;
    admin_staff: number;
    regular_staff: number;
    station_staff: number;
  };
  activity_stats: {
    recent_activity: number;
    last_updated: string;
  };
}

export interface PaginatedStaff {
  staff: StaffMember[];
  pagination: {
    page_number: number;
    per_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface StaffFilters {
  page?: number;
  per_page?: number;
  search?: string;
  staff_type?: 'admin' | 'regular' | '';
  is_active?: 'true' | 'false' | '';
  order_by?: string;
}

export interface CreateStaffRequest {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  user_type?: string;
  phone?: string;
  country?: string;
  is_staff?: boolean;
  is_admin?: boolean;
  permissions?: string[];
}

export interface UpdateStaffRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  user_type?: string;
  is_admin?: boolean;
  is_staff?: boolean;
  is_active?: boolean;
  permissions?: string[];
}

export interface StaffActivityLog {
  activities: Array<{
    id: number;
    action: string;
    resource_type?: string;
    resource_id?: string;
    ip_address?: string;
    timestamp: string;
    status_code?: number;
  }>;
  pagination: {
    page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

export interface Permission {
  permission: string;
  description: string;
  category: string;
}

export interface AvailablePermissions {
  permissions: Permission[];
}

class StaffManagementService {
  /**
   * Get staff management overview statistics
   */
  async getOverview(): Promise<StaffOverview> {
    const response = await api.get('/accounts/admin/staff-overview/');
    return response.data;
  }

  /**
   * Get paginated list of all staff members with filtering
   */
  async getAllStaff(filters: StaffFilters = {}): Promise<PaginatedStaff> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/accounts/admin/all-staff/?${params.toString()}`);
    return response.data;
  }

  /**
   * Get detailed information about a specific staff member
   */
  async getStaffDetails(staffId: string): Promise<StaffDetails> {
    const response = await api.get(`/accounts/admin/staff-details/${staffId}/`);
    return response.data;
  }

  /**
   * Create a new staff member
   */
  async createStaffMember(data: CreateStaffRequest): Promise<{ message: string; staff_id: string }> {
    const response = await api.post('/accounts/admin/create-staff/', data);
    return response.data;
  }

  /**
   * Update staff member information and permissions
   */
  async updateStaffMember(staffId: string, data: UpdateStaffRequest): Promise<{ message: string }> {
    const response = await api.put(`/accounts/admin/update-staff/${staffId}/`, data);
    return response.data;
  }

  /**
   * Deactivate a staff member (soft delete)
   */
  async deactivateStaffMember(staffId: string): Promise<{ message: string }> {
    const response = await api.delete(`/accounts/admin/deactivate-staff/${staffId}/`);
    return response.data;
  }

  /**
   * Get activity log for a specific staff member
   */
  async getStaffActivityLog(
    staffId: string, 
    page: number = 1, 
    perPage: number = 20,
    dateFrom?: string,
    dateTo?: string
  ): Promise<StaffActivityLog> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (dateFrom) params.append('date_from', dateFrom);
    if (dateTo) params.append('date_to', dateTo);

    const response = await api.get(`/accounts/admin/staff-activity-log/${staffId}/?${params.toString()}`);
    return response.data;
  }

  /**
   * Get list of available permissions that can be assigned to staff
   */
  async getAvailablePermissions(): Promise<AvailablePermissions> {
    const response = await api.get('/accounts/admin/available-permissions/');
    return response.data;
  }

  /**
   * Utility functions for UI display
   */

  /**
   * Get color class for staff type badge
   */
  getStaffTypeColor(isAdmin: boolean, isStaff: boolean): string {
    if (isAdmin) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else if (isStaff) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }

  /**
   * Get color class for active status badge
   */
  getActiveStatusColor(isActive: boolean): string {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return this.formatDate(dateString);
    }
  }

  /**
   * Get staff type display name
   */
  getStaffTypeDisplay(isAdmin: boolean, isStaff: boolean): string {
    if (isAdmin) return 'Administrator';
    if (isStaff) return 'Staff';
    return 'User';
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  isValidPassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  }

  /**
   * Group permissions by category
   */
  groupPermissionsByCategory(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((groups, permission) => {
      const category = permission.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
      return groups;
    }, {} as Record<string, Permission[]>);
  }

  /**
   * Export staff data as CSV
   */
  exportStaffAsCSV(staff: StaffMember[], filename: string = 'staff_export.csv'): void {
    const headers = [
      'Email',
      'First Name',
      'Last Name',
      'User Type',
      'Is Admin',
      'Is Staff',
      'Is Active',
      'Email Verified',
      'Last Activity',
      'Created At',
      'Permissions'
    ];

    const csvContent = [
      headers.join(','),
      ...staff.map(member => [
        member.email,
        member.first_name,
        member.last_name,
        member.user_type,
        member.is_admin ? 'Yes' : 'No',
        member.is_staff ? 'Yes' : 'No',
        member.is_active ? 'Yes' : 'No',
        member.email_verified ? 'Yes' : 'No',
        member.last_activity ? this.formatDate(member.last_activity) : 'Never',
        this.formatDate(member.created_at),
        member.permissions.join('; ')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const staffManagementService = new StaffManagementService();
export default staffManagementService;