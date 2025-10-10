import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
      detail?: string;
    };
    status?: number;
  };
  message?: string;
}

export const useApiErrorHandler = () => {
  const handleApiError = useCallback((error: ApiError, fallbackMessage?: string) => {
    let errorMessage = fallbackMessage || 'An error occurred';

    if (error.response?.data) {
      const { message, errors, detail } = error.response.data;
      
      if (message) {
        errorMessage = message;
      } else if (detail) {
        errorMessage = detail;
      } else if (errors) {
        // Handle validation errors
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        errorMessage = errorMessages;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error(errorMessage);
    console.error('API Error:', error);
  }, []);

  const showSuccessMessage = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showWarningMessage = useCallback((message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
      },
    });
  }, []);

  const showInfoMessage = useCallback((message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#DBEAFE',
        color: '#1E40AF',
      },
    });
  }, []);

  return {
    handleApiError,
    showSuccessMessage,
    showWarningMessage,
    showInfoMessage,
  };
};