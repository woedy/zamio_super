import { baseUrl, userToken } from '../constants';

export interface AuditLogEntry {
  id: string;
  user: {
    email: string;
    first_name: string;
    last_name: string;
    user_type: string;
  } | null;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  status_code?: number;
  timestamp: string;
  trace_id?: string;
  request_data: Record<string, any>;
  response_data: Record<string, any>;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  resource_type?: string;
  ip_address?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedAuditLogs {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: {
    total_logs: number;
    unique_users: number;
    unique_actions: number;
    recent_activity_24h: number;
  };
  filters_applied: AuditLogFilters;
}

class AuditLogService {
  private baseURL = `${baseUrl}api/accounts/rbac/`;
  
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Token ${userToken}`,
    };
  }

  async getAuditLogs(filters: AuditLogFilters = {}): Promise<PaginatedAuditLogs> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseURL}audit-logs/?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  // Utility methods for formatting and display
  getActionColor(action: string): string {
    if (action.includes('login')) {
      return action.includes('success') 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    
    if (action.includes('logout')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    
    if (action.includes('deposit') || action.includes('withdrawal')) {
      return action.includes('success')
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    
    if (action.includes('dispute')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    }
    
    if (action.includes('track') || action.includes('audio')) {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    }
    
    if (action.includes('failed') || action.includes('error')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  getStatusCodeColor(statusCode?: number): string {
    if (!statusCode) return 'bg-gray-100 text-gray-800';
    
    if (statusCode >= 200 && statusCode < 300) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    } else if (statusCode >= 500) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    }
    
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  formatAction(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getResourceTypeIcon(resourceType?: string): string {
    const icons = {
      'authentication': '🔐',
      'bank_account': '💰',
      'track': '🎵',
      'music_detection': '🔍',
      'dispute': '⚖️',
      'user': '👤',
      'user_management': '👥',
      'artist_profile': '🎤',
      'system_test': '🧪'
    };
    
    return icons[resourceType as keyof typeof icons] || '📄';
  }

  truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Export functionality
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    // Add export parameter
    params.append('export', 'csv');

    const response = await fetch(`${this.baseURL}audit-logs/?${params}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to export audit logs: ${response.statusText}`);
    }

    return response.blob();
  }

  downloadCsvFile(blob: Blob, filename: string = 'audit_logs.csv'): void {
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

export const auditLogService = new AuditLogService();