import { useState, useCallback, useRef } from 'react';
import { useApiErrorHandler } from './useApiErrorHandler';

interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
  onMaxRetriesReached?: (error: any) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: any;
  canRetry: boolean;
}

export const useRetry = (config: RetryConfig = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    retryCondition = (error) => {
      // Default: retry on network errors and 5xx server errors
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    },
    onRetry,
    onMaxRetriesReached
  } = config;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
    canRetry: false
  });

  const { handleApiError, showInfoMessage } = useApiErrorHandler();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculateDelay = useCallback((attempt: number): number => {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, maxDelay);
  }, [baseDelay, maxDelay]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T> => {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryState(prev => ({
          ...prev,
          isRetrying: attempt > 0,
          attempt,
          canRetry: attempt < maxRetries
        }));

        if (attempt > 0 && onRetry) {
          onRetry(attempt, lastError);
        }

        const result = await operation();
        
        // Success - reset state
        setRetryState({
          isRetrying: false,
          attempt: 0,
          lastError: null,
          canRetry: false
        });

        if (attempt > 0) {
          showInfoMessage(
            `${operationName || 'Operation'} succeeded after ${attempt} ${attempt === 1 ? 'retry' : 'retries'}.`,
            'Retry Successful'
          );
        }

        return result;
      } catch (error) {
        lastError = error;
        
        setRetryState(prev => ({
          ...prev,
          lastError: error,
          canRetry: attempt < maxRetries && retryCondition(error)
        }));

        // Don't retry if condition is not met or we've reached max retries
        if (!retryCondition(error) || attempt >= maxRetries) {
          break;
        }

        // Wait before retrying
        if (attempt < maxRetries) {
          const delay = calculateDelay(attempt);
          
          showInfoMessage(
            `${operationName || 'Operation'} failed. Retrying in ${Math.round(delay / 1000)} seconds... (Attempt ${attempt + 1}/${maxRetries})`,
            'Retrying',
            delay
          );

          await new Promise(resolve => {
            timeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }
    }

    // All retries exhausted
    setRetryState(prev => ({
      ...prev,
      isRetrying: false,
      canRetry: false
    }));

    if (onMaxRetriesReached) {
      onMaxRetriesReached(lastError);
    }

    throw lastError;
  }, [maxRetries, retryCondition, onRetry, onMaxRetriesReached, calculateDelay, showInfoMessage]);

  const manualRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName?: string
  ): Promise<T> => {
    if (!retryState.canRetry) {
      throw new Error('Cannot retry: max retries reached or retry condition not met');
    }

    return executeWithRetry(operation, operationName);
  }, [executeWithRetry, retryState.canRetry]);

  const cancelRetry = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    setRetryState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
      canRetry: false
    });
  }, []);

  const reset = useCallback(() => {
    cancelRetry();
  }, [cancelRetry]);

  return {
    executeWithRetry,
    manualRetry,
    cancelRetry,
    reset,
    retryState,
    isRetrying: retryState.isRetrying,
    canRetry: retryState.canRetry,
    attempt: retryState.attempt,
    lastError: retryState.lastError
  };
};

// Hook for specific API operations with retry
export const useApiWithRetry = (config: RetryConfig = {}) => {
  const { executeWithRetry, ...retryUtils } = useRetry({
    retryCondition: (error) => {
      // Retry on network errors, timeouts, and 5xx server errors
      if (!error.response) return true; // Network error
      const status = error.response.status;
      return status >= 500 || status === 408 || status === 429; // Server error, timeout, or rate limit
    },
    ...config
  });

  const { handleApiError } = useApiErrorHandler();

  const apiCall = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName?: string,
    showErrorToast: boolean = true
  ): Promise<T> => {
    try {
      return await executeWithRetry(operation, operationName);
    } catch (error) {
      if (showErrorToast) {
        handleApiError(error, undefined, {
          retryAction: retryUtils.canRetry ? () => {
            executeWithRetry(operation, operationName);
          } : undefined
        });
      }
      throw error;
    }
  }, [executeWithRetry, handleApiError, retryUtils.canRetry]);

  return {
    apiCall,
    ...retryUtils
  };
};

// Hook for file upload operations with retry
export const useUploadWithRetry = (config: RetryConfig = {}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const { executeWithRetry, ...retryUtils } = useRetry({
    maxRetries: 2, // Fewer retries for uploads
    baseDelay: 2000, // Longer delay for uploads
    retryCondition: (error) => {
      // Only retry on network errors or server errors, not client errors
      if (!error.response) return true;
      const status = error.response.status;
      return status >= 500 || status === 408;
    },
    ...config
  });

  const uploadWithRetry = useCallback(async <T>(
    uploadOperation: (onProgress?: (progress: number) => void) => Promise<T>,
    operationName?: string
  ): Promise<T> => {
    setUploadProgress(0);
    
    try {
      return await executeWithRetry(async () => {
        return uploadOperation((progress) => {
          setUploadProgress(progress);
        });
      }, operationName);
    } finally {
      setUploadProgress(0);
    }
  }, [executeWithRetry]);

  return {
    uploadWithRetry,
    uploadProgress,
    ...retryUtils
  };
};