import { useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../services/apiClient';

interface ApiError {
  code: string;
  message: string;
  details?: any;
  trace_id?: string;
  timestamp?: string;
}

interface ApiErrorResponse {
  error: ApiError;
  success: false;
}

export const useApiErrorHandler = () => {
  const { addToast } = useToast();

  const handleApiError = useCallback((
    error: any, 
    customMessage?: string,
    options?: {
      showToast?: boolean;
      logError?: boolean;
      retryAction?: () => void;
    }
  ) => {
    const { showToast = true, logError = true, retryAction } = options || {};

    let errorData: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: customMessage || 'An unexpected error occurred'
    };

    // Extract error data from different error formats
    if (error?.error) {
      // Our standardized API error format
      errorData = error.error;
    } else if (error?.response?.data?.error) {
      // Axios error with our API error format
      errorData = error.response.data.error;
    } else if (error?.response?.data) {
      // Other API error formats
      const responseData = error.response.data;
      errorData = {
        code: responseData.code || 'API_ERROR',
        message: responseData.message || responseData.detail || customMessage || 'API request failed',
        details: responseData.details || responseData
      };
    } else if (error?.message) {
      // Network or other errors
      errorData = {
        code: 'NETWORK_ERROR',
        message: error.message
      };
    }

    // Log error to backend if enabled
    if (logError && errorData.trace_id) {
      apiClient.logError({
        trace_id: errorData.trace_id,
        error_code: errorData.code,
        error_message: errorData.message,
        user_action: 'error_encountered',
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      }).catch(err => {
        console.error('Failed to log error to backend:', err);
      });
    }

    // Show toast notification if enabled
    if (showToast) {
      const title = getErrorTitle(errorData.code);
      const message = errorData.message;

      addToast({
        type: 'error',
        title,
        message,
        duration: getErrorDuration(errorData.code),
        action: retryAction ? {
          label: 'Retry',
          onClick: retryAction
        } : undefined
      });
    }

    // Log to console for development
    console.error('API Error:', errorData);

    return errorData;
  }, [addToast]);

  const handleValidationErrors = useCallback((
    validationErrors: Record<string, string[]>,
    customMessage?: string
  ) => {
    const fieldErrors = Object.entries(validationErrors)
      .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
      .join('; ');

    addToast({
      type: 'error',
      title: 'Validation Error',
      message: customMessage || `Please fix the following errors: ${fieldErrors}`,
      duration: 8000
    });

    return validationErrors;
  }, [addToast]);

  const handleNetworkError = useCallback((
    error: any,
    retryAction?: () => void
  ) => {
    addToast({
      type: 'error',
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      duration: 0, // Don't auto-dismiss
      action: retryAction ? {
        label: 'Retry',
        onClick: retryAction
      } : undefined
    });
  }, [addToast]);

  const handleAuthError = useCallback(() => {
    addToast({
      type: 'warning',
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again.',
      duration: 0,
      action: {
        label: 'Log In',
        onClick: () => {
          window.location.href = '/sign-in';
        }
      }
    });
  }, [addToast]);

  const handlePermissionError = useCallback(() => {
    addToast({
      type: 'error',
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action.',
      duration: 6000
    });
  }, [addToast]);

  const showSuccessMessage = useCallback((
    message: string,
    title?: string,
    duration?: number
  ) => {
    addToast({
      type: 'success',
      title: title || 'Success',
      message,
      duration: duration || 4000
    });
  }, [addToast]);

  const showWarningMessage = useCallback((
    message: string,
    title?: string,
    action?: { label: string; onClick: () => void }
  ) => {
    addToast({
      type: 'warning',
      title: title || 'Warning',
      message,
      duration: 6000,
      action
    });
  }, [addToast]);

  const showInfoMessage = useCallback((
    message: string,
    title?: string,
    duration?: number
  ) => {
    addToast({
      type: 'info',
      title: title || 'Information',
      message,
      duration: duration || 5000
    });
  }, [addToast]);

  return {
    handleApiError,
    handleValidationErrors,
    handleNetworkError,
    handleAuthError,
    handlePermissionError,
    showSuccessMessage,
    showWarningMessage,
    showInfoMessage
  };
};

// Helper functions
function getErrorTitle(errorCode: string): string {
  const titles: Record<string, string> = {
    'VALIDATION_ERROR': 'Validation Error',
    'AUTHENTICATION_ERROR': 'Authentication Required',
    'PERMISSION_DENIED': 'Access Denied',
    'RESOURCE_NOT_FOUND': 'Not Found',
    'RATE_LIMIT_EXCEEDED': 'Too Many Requests',
    'EXTERNAL_SERVICE_ERROR': 'Service Unavailable',
    'FINGERPRINT_PROCESSING_ERROR': 'Audio Processing Error',
    'ROYALTY_CALCULATION_ERROR': 'Calculation Error',
    'INTERNAL_SERVER_ERROR': 'Server Error',
    'NETWORK_ERROR': 'Connection Error',
    'PARSE_ERROR': 'Data Error'
  };

  return titles[errorCode] || 'Error';
}

function getErrorDuration(errorCode: string): number {
  // Different error types should have different display durations
  const durations: Record<string, number> = {
    'VALIDATION_ERROR': 8000,
    'AUTHENTICATION_ERROR': 0, // Don't auto-dismiss
    'PERMISSION_DENIED': 6000,
    'RATE_LIMIT_EXCEEDED': 10000,
    'EXTERNAL_SERVICE_ERROR': 8000,
    'FINGERPRINT_PROCESSING_ERROR': 8000,
    'ROYALTY_CALCULATION_ERROR': 0, // Don't auto-dismiss
    'INTERNAL_SERVER_ERROR': 0, // Don't auto-dismiss
    'NETWORK_ERROR': 0 // Don't auto-dismiss
  };

  return durations[errorCode] || 5000;
}