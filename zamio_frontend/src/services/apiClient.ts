import { baseUrl } from '../constants';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  trace_id?: string;
  timestamp?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryCondition?: (error: any) => boolean;
}

export interface RequestConfig extends RequestInit {
  retry?: Partial<RetryConfig>;
  timeout?: number;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryCondition: (error) => {
      // Retry on network errors and 5xx server errors
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }
  };

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh);
        }
        return data.access;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    // Clear invalid tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return null;
  }

  private async makeRequestWithTimeout(
    url: string,
    config: RequestConfig,
    timeout: number = 30000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  private async executeWithRetry<T>(
    requestFn: () => Promise<Response>,
    retryConfig: RetryConfig
  ): Promise<Response> {
    let lastError: any;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await requestFn();
        
        // Don't retry on successful responses or client errors (4xx)
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        // Check if we should retry this error
        const error = { response };
        if (!retryConfig.retryCondition || !retryConfig.retryCondition(error)) {
          return response;
        }

        lastError = error;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry this error
        if (!retryConfig.retryCondition || !retryConfig.retryCondition(error)) {
          throw error;
        }
      }

      // Don't sleep after the last attempt
      if (attempt < retryConfig.maxRetries) {
        const delay = this.calculateDelay(attempt, retryConfig.baseDelay, retryConfig.maxDelay);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();

      if (response.ok) {
        return {
          data,
          success: true
        };
      }

      // Handle error response
      const error: ApiError = {
        code: data.error?.code || 'UNKNOWN_ERROR',
        message: data.error?.message || 'An unexpected error occurred',
        details: data.error?.details,
        trace_id: data.error?.trace_id,
        timestamp: data.error?.timestamp
      };

      return {
        error,
        success: false
      };
    } catch (parseError) {
      // Handle non-JSON responses
      const error: ApiError = {
        code: 'PARSE_ERROR',
        message: `Failed to parse response: ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText }
      };

      return {
        error,
        success: false
      };
    }
  }

  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      retry = {},
      timeout = 30000,
      skipAuth = false,
      ...requestConfig
    } = config;

    const retryConfig = { ...this.defaultRetryConfig, ...retry };
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint.slice(1) : endpoint}`;

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...requestConfig.headers as Record<string, string>
    };

    // Add authentication if not skipped
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const requestFn = () => this.makeRequestWithTimeout(url, {
      ...requestConfig,
      headers
    }, timeout);

    try {
      const response = await this.executeWithRetry(requestFn, retryConfig);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && !skipAuth) {
        const newToken = await this.refreshToken();
        if (newToken) {
          // Retry with new token
          headers.Authorization = `Bearer ${newToken}`;
          const retryRequestFn = () => this.makeRequestWithTimeout(url, {
            ...requestConfig,
            headers
          }, timeout);
          
          const retryResponse = await retryRequestFn();
          return this.handleResponse<T>(retryResponse);
        } else {
          // Redirect to login if token refresh fails
          window.location.href = '/login';
          return {
            error: {
              code: 'AUTHENTICATION_ERROR',
              message: 'Authentication required. Please log in again.'
            },
            success: false
          };
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors and other exceptions
      const apiError: ApiError = {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network request failed',
        details: { originalError: error.toString() }
      };

      return {
        error: apiError,
        success: false
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // File upload method
  async upload<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: Omit<RequestConfig, 'body'>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    const { headers, ...restConfig } = config || {};
    
    return this.request<T>(endpoint, {
      ...restConfig,
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - let browser set it with boundary
        ...headers as Record<string, string>
      }
    });
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('api/health/', { 
        skipAuth: true,
        timeout: 5000,
        retry: { maxRetries: 1 }
      });
      return response.success;
    } catch {
      return false;
    }
  }

  // Log error to backend
  async logError(errorData: any): Promise<void> {
    try {
      await this.post('api/errors/log/', errorData, {
        retry: { maxRetries: 1 },
        timeout: 10000
      });
    } catch (error) {
      console.error('Failed to log error to backend:', error);
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient(baseUrl);

// Export types for use in other files
export type { ApiError, ApiResponse, RequestConfig, RetryConfig };