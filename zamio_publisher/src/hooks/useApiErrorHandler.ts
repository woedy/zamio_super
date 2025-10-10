import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ApiError {
  code: string;
  message: string;
  details?: any;
  trace_id?: string;
  timestamp?: string;
}

export const useApiErrorHandler = () => {
  const handleApiError = useCallback((
    error: any, 
    customMessage?: string,
    options?: {
      showToast?: boolean;
      logError?: boolean;
      retryAction?: () => void;
    }
  ) => {
    const { showToast = true, logError = true } = options || {};

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

    // Show toast notification if enabled
    if (showToast) {
      toast.error(errorData.message);
    }

    // Log to console for development
    if (logError) {
      console.error('API Error:', errorData);
    }

    return errorData;
  }, []);

  const handleValidationErrors = useCallback((
    validationErrors: Record<string, string[]>,
    customMessage?: string
  ) => {
    const fieldErrors = Object.entries(validationErrors)
      .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
      .join('; ');

    toast.error(customMessage || `Please fix the following errors: ${fieldErrors}`);

    return validationErrors;
  }, []);

  const handleNetworkError = useCallback((error: any) => {
    toast.error('Unable to connect to the server. Please check your internet connection.');
  }, []);

  const handleAuthError = useCallback(() => {
    toast.error('Your session has expired. Please log in again.');
    setTimeout(() => {
      window.location.href = '/sign-in';
    }, 2000);
  }, []);

  const handlePermissionError = useCallback(() => {
    toast.error('You don\'t have permission to perform this action.');
  }, []);

  const showSuccessMessage = useCallback((
    message: string,
    title?: string
  ) => {
    toast.success(message);
  }, []);

  const showWarningMessage = useCallback((
    message: string,
    title?: string
  ) => {
    toast(message, {
      icon: '⚠️',
    });
  }, []);

  const showInfoMessage = useCallback((
    message: string,
    title?: string
  ) => {
    toast(message, {
      icon: 'ℹ️',
    });
  }, []);

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