import React, { useState } from 'react';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';
import { useApiWithRetry } from '../hooks/useRetry';
import { useFormWithValidation } from '../hooks/useFormWithValidation';
import { TextInput, PasswordInput, Select, TextArea } from './FormValidation';
import { apiClient } from '../services/apiClient';
import { AlertTriangle, RefreshCw, Upload, Send } from 'lucide-react';

const ErrorHandlingDemo: React.FC = () => {
  const [demoType, setDemoType] = useState<'api' | 'validation' | 'network' | 'upload'>('api');
  
  const {
    handleApiError,
    handleNetworkError,
    showSuccessMessage,
    showWarningMessage,
    showInfoMessage
  } = useApiErrorHandler();

  const { apiCall, isRetrying, canRetry } = useApiWithRetry({
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt} for error:`, error);
    }
  });

  // Form validation demo
  const form = useFormWithValidation({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      age: '',
      website: '',
      bio: '',
      country: ''
    },
    validationRules: {
      email: { required: true, email: true },
      password: { required: true, minLength: 8 },
      confirmPassword: {
        required: true,
        custom: (value, allValues) => {
          if (value !== allValues.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      },
      name: { required: true, minLength: 2, maxLength: 50 },
      age: { required: true, min: 18, max: 120 },
      website: { url: true },
      bio: { maxLength: 500 },
      country: { required: true }
    },
    onSubmit: async (values) => {
      // Simulate API call
      return apiCall(async () => {
        const response = await apiClient.post('api/demo/submit/', values);
        if (!response.success) {
          throw response.error;
        }
        return response.data;
      }, 'Form submission');
    },
    onSuccess: (result) => {
      showSuccessMessage('Form submitted successfully!');
      form.reset();
    }
  });

  // Demo functions
  const simulateApiError = async () => {
    try {
      await apiCall(async () => {
        // Simulate different types of API errors
        const errorTypes = [
          { code: 'VALIDATION_ERROR', message: 'Invalid input data', status: 400 },
          { code: 'AUTHENTICATION_ERROR', message: 'Token expired', status: 401 },
          { code: 'PERMISSION_DENIED', message: 'Insufficient permissions', status: 403 },
          { code: 'RESOURCE_NOT_FOUND', message: 'User not found', status: 404 },
          { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests', status: 429 },
          { code: 'INTERNAL_SERVER_ERROR', message: 'Database connection failed', status: 500 }
        ];
        
        const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        
        throw {
          response: {
            status: randomError.status,
            data: {
              error: {
                code: randomError.code,
                message: randomError.message,
                trace_id: `trace_${Date.now()}`
              }
            }
          }
        };
      }, 'API Error Demo');
    } catch (error) {
      // Error is already handled by useApiWithRetry
    }
  };

  const simulateNetworkError = async () => {
    try {
      await apiCall(async () => {
        // Simulate network error
        throw new Error('Network request failed');
      }, 'Network Error Demo');
    } catch (error) {
      handleNetworkError(error, () => simulateNetworkError());
    }
  };

  const simulateValidationError = () => {
    // Trigger form validation
    form.handleSubmit();
  };

  const simulateUploadError = async () => {
    try {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      await apiCall(async () => {
        // Simulate upload failure
        throw {
          response: {
            status: 413,
            data: {
              error: {
                code: 'FILE_TOO_LARGE',
                message: 'File size exceeds maximum allowed size of 10MB',
                details: { max_size: '10MB', file_size: '15MB' }
              }
            }
          }
        };
      }, 'File Upload Demo');
    } catch (error) {
      // Error handled by useApiWithRetry
    }
  };

  const showToastExamples = () => {
    showSuccessMessage('This is a success message!');
    setTimeout(() => showWarningMessage('This is a warning message!'), 1000);
    setTimeout(() => showInfoMessage('This is an info message!'), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Error Handling & User Feedback Demo
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This demo showcases the comprehensive error handling system including API errors, 
          form validation, retry mechanisms, and user feedback.
        </p>

        {/* Demo Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Demo Type:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'api', label: 'API Errors' },
              { value: 'validation', label: 'Form Validation' },
              { value: 'network', label: 'Network Errors' },
              { value: 'upload', label: 'Upload Errors' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setDemoType(option.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  demoType === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        {demoType === 'api' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              API Error Handling Demo
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Test different types of API errors and see how they're handled with user-friendly messages and retry mechanisms.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={simulateApiError}
                disabled={isRetrying}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                {isRetrying ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-2" />
                )}
                Simulate API Error
              </button>
              
              <button
                onClick={showToastExamples}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Show Toast Examples
              </button>
            </div>

            {isRetrying && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Retrying API call... {canRetry ? 'Retry available' : 'Max retries reached'}
                </p>
              </div>
            )}
          </div>
        )}

        {demoType === 'validation' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Form Validation Demo
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Test comprehensive form validation with field-level error display and real-time feedback.
            </p>

            <form onSubmit={form.handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  {...form.getFieldProps('email')}
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                />
                
                <TextInput
                  {...form.getFieldProps('name')}
                  label="Full Name"
                  placeholder="Enter your full name"
                />
                
                <PasswordInput
                  {...form.getFieldProps('password')}
                  label="Password"
                  showStrength={true}
                />
                
                <PasswordInput
                  {...form.getFieldProps('confirmPassword')}
                  label="Confirm Password"
                />
                
                <TextInput
                  {...form.getFieldProps('age')}
                  label="Age"
                  type="number"
                  placeholder="Enter your age"
                />
                
                <Select
                  {...form.getFieldProps('country')}
                  label="Country"
                  options={[
                    { value: 'gh', label: 'Ghana' },
                    { value: 'ng', label: 'Nigeria' },
                    { value: 'ke', label: 'Kenya' },
                    { value: 'za', label: 'South Africa' }
                  ]}
                  emptyOption="Select a country"
                />
                
                <TextInput
                  {...form.getFieldProps('website')}
                  label="Website (Optional)"
                  type="url"
                  placeholder="https://example.com"
                />
              </div>
              
              <TextArea
                {...form.getFieldProps('bio')}
                label="Bio (Optional)"
                placeholder="Tell us about yourself..."
                rows={3}
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Form Status: {form.isValid ? 'Valid' : 'Invalid'} | 
                  Dirty: {form.isDirty ? 'Yes' : 'No'} | 
                  Errors: {form.hasErrors ? 'Yes' : 'No'}
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => form.reset()}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Reset
                  </button>
                  
                  <button
                    type="submit"
                    disabled={form.isSubmitting}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {form.isSubmitting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit Form
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {demoType === 'network' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Network Error Handling Demo
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Test network connectivity issues and see how the system handles offline scenarios.
            </p>
            
            <button
              onClick={simulateNetworkError}
              disabled={isRetrying}
              className="flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors"
            >
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              Simulate Network Error
            </button>
          </div>
        )}

        {demoType === 'upload' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload Error Handling Demo
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Test file upload errors and see how they're handled with appropriate user feedback.
            </p>
            
            <button
              onClick={simulateUploadError}
              disabled={isRetrying}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
            >
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Simulate Upload Error
            </button>
          </div>
        )}
      </div>

      {/* Error Handling Features */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Error Handling Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Backend Features</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Standardized API error responses</li>
              <li>• Trace ID generation for support correlation</li>
              <li>• Comprehensive error logging</li>
              <li>• Custom exception classes</li>
              <li>• Error metrics and monitoring</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Frontend Features</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Global error boundary</li>
              <li>• Toast notification system</li>
              <li>• Retry mechanisms with exponential backoff</li>
              <li>• Form validation with field-level errors</li>
              <li>• Offline capability indicators</li>
              <li>• Contextual help and support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingDemo;