import { useState, useCallback, useEffect } from 'react';
import { useApiErrorHandler } from './useApiErrorHandler';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, allValues: FormValues) => string | null;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
}

export interface FieldError {
  message: string;
  type: string;
}

export interface FormErrors {
  [fieldName: string]: FieldError[];
}

export interface FormValues {
  [fieldName: string]: any;
}

export interface FormConfig {
  initialValues?: FormValues;
  validationRules?: Record<string, ValidationRule>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: FormValues) => Promise<any>;
  onSuccess?: (result: any, values: FormValues) => void;
  onError?: (error: any, values: FormValues) => void;
}

export const useFormWithValidation = (config: FormConfig = {}) => {
  const {
    initialValues = {},
    validationRules = {},
    validateOnChange = false,
    validateOnBlur = true,
    onSubmit,
    onSuccess,
    onError
  } = config;

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const { handleApiError, handleValidationErrors, showSuccessMessage } = useApiErrorHandler();

  // Validation functions
  const validateField = useCallback((
    fieldName: string,
    value: any,
    allValues: FormValues = values
  ): FieldError[] => {
    const rules = validationRules[fieldName];
    if (!rules) return [];

    const fieldErrors: FieldError[] = [];

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      fieldErrors.push({ message: 'This field is required', type: 'required' });
      return fieldErrors; // Don't validate other rules if required fails
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return fieldErrors;
    }

    const stringValue = String(value);

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
      fieldErrors.push({
        message: `Must be at least ${rules.minLength} characters`,
        type: 'minLength'
      });
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      fieldErrors.push({
        message: `Must be no more than ${rules.maxLength} characters`,
        type: 'maxLength'
      });
    }

    // Numeric validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        fieldErrors.push({
          message: `Must be at least ${rules.min}`,
          type: 'min'
        });
      }

      if (rules.max !== undefined && value > rules.max) {
        fieldErrors.push({
          message: `Must be no more than ${rules.max}`,
          type: 'max'
        });
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      fieldErrors.push({
        message: 'Invalid format',
        type: 'pattern'
      });
    }

    // Email validation
    if (rules.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        fieldErrors.push({
          message: 'Please enter a valid email address',
          type: 'email'
        });
      }
    }

    // Phone validation
    if (rules.phone) {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phonePattern.test(stringValue.replace(/[\s\-\(\)]/g, ''))) {
        fieldErrors.push({
          message: 'Please enter a valid phone number',
          type: 'phone'
        });
      }
    }

    // URL validation
    if (rules.url) {
      try {
        new URL(stringValue);
      } catch {
        fieldErrors.push({
          message: 'Please enter a valid URL',
          type: 'url'
        });
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value, allValues);
      if (customError) {
        fieldErrors.push({
          message: customError,
          type: 'custom'
        });
      }
    }

    return fieldErrors;
  }, [validationRules, values]);

  const validateForm = useCallback((formValues: FormValues = values): FormErrors => {
    const formErrors: FormErrors = {};

    Object.keys(validationRules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formValues[fieldName], formValues);
      if (fieldErrors.length > 0) {
        formErrors[fieldName] = fieldErrors;
      }
    });

    return formErrors;
  }, [validationRules, validateField, values]);

  // Form field handlers
  const setValue = useCallback((fieldName: string, value: any) => {
    setValues(prev => {
      const newValues = { ...prev, [fieldName]: value };
      
      // Validate on change if enabled
      if (validateOnChange && validationRules[fieldName]) {
        const fieldErrors = validateField(fieldName, value, newValues);
        setErrors(prevErrors => ({
          ...prevErrors,
          [fieldName]: fieldErrors
        }));
      }
      
      return newValues;
    });
  }, [validateOnChange, validationRules, validateField]);

  const setFieldTouched = useCallback((fieldName: string, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [fieldName]: isTouched }));
    
    // Validate on blur if enabled and field is touched
    if (validateOnBlur && isTouched && validationRules[fieldName]) {
      const fieldErrors = validateField(fieldName, values[fieldName]);
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: fieldErrors
      }));
    }
  }, [validateOnBlur, validationRules, validateField, values]);

  const setFieldError = useCallback((fieldName: string, error: string | FieldError[]) => {
    const fieldErrors = typeof error === 'string' 
      ? [{ message: error, type: 'custom' }]
      : error;
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setSubmitCount(prev => prev + 1);
    
    // Validate entire form
    const formErrors = validateForm();
    setErrors(formErrors);

    // Mark all fields as touched
    const allFieldsTouched = Object.keys(validationRules).reduce((acc, fieldName) => {
      acc[fieldName] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allFieldsTouched);

    // Stop if there are validation errors
    if (Object.keys(formErrors).length > 0) {
      handleValidationErrors(
        Object.entries(formErrors).reduce((acc, [field, errors]) => {
          acc[field] = errors.map(e => e.message);
          return acc;
        }, {} as Record<string, string[]>)
      );
      return false;
    }

    // Submit form if onSubmit is provided
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        const result = await onSubmit(values);
        
        if (onSuccess) {
          onSuccess(result, values);
        } else {
          showSuccessMessage('Form submitted successfully');
        }
        
        return true;
      } catch (error) {
        // Handle API errors
        const apiError = handleApiError(error, 'Failed to submit form', {
          showToast: false // We'll handle the error display ourselves
        });

        // Check if it's a validation error from the server
        if (apiError.code === 'VALIDATION_ERROR' && apiError.details?.field_errors) {
          const serverErrors: FormErrors = {};
          Object.entries(apiError.details.field_errors).forEach(([field, messages]) => {
            serverErrors[field] = (messages as string[]).map(message => ({
              message,
              type: 'server'
            }));
          });
          setErrors(prev => ({ ...prev, ...serverErrors }));
        }

        if (onError) {
          onError(error, values);
        }
        
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    return true;
  }, [
    validateForm,
    validationRules,
    values,
    onSubmit,
    onSuccess,
    onError,
    handleApiError,
    handleValidationErrors,
    showSuccessMessage
  ]);

  // Reset form
  const reset = useCallback((newValues: FormValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  // Computed properties
  const hasErrors = Object.keys(errors).length > 0;
  const hasFieldErrors = (fieldName: string) => errors[fieldName]?.length > 0;
  const getFieldErrors = (fieldName: string) => errors[fieldName] || [];
  const isFieldTouched = (fieldName: string) => touched[fieldName] || false;
  const isValid = !hasErrors && Object.keys(touched).length > 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  // Update values when initialValues change
  useEffect(() => {
    if (submitCount === 0) { // Only update if form hasn't been submitted
      setValues(initialValues);
    }
  }, [initialValues, submitCount]);

  return {
    // Values and state
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    
    // Computed properties
    hasErrors,
    isValid,
    isDirty,
    
    // Field operations
    setValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasFieldErrors,
    getFieldErrors,
    isFieldTouched,
    
    // Form operations
    handleSubmit,
    reset,
    validateForm,
    validateField,
    
    // Helper functions for form fields
    getFieldProps: (fieldName: string) => ({
      name: fieldName,
      value: values[fieldName] || '',
      onChange: (value: any) => setValue(fieldName, value),
      onBlur: () => setFieldTouched(fieldName),
      errors: getFieldErrors(fieldName),
      rules: validationRules[fieldName]
    })
  };
};