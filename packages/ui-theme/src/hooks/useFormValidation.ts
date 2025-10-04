import { useState, useCallback, useMemo } from 'react';
import { ValidationSchema, validateField, validateForm, ValidationResult } from '../utils/validation';

export interface UseFormValidationOptions {
  schema: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn {
  errors: Record<string, string>;
  isValid: boolean;
  isFieldValid: (fieldName: string) => boolean;
  validateField: (fieldName: string, value: any) => boolean;
  validateForm: (values: Record<string, any>) => ValidationResult;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
}

/**
 * Hook for managing form validation state and operations
 */
export function useFormValidation({
  schema,
  validateOnChange = true,
  validateOnBlur = true
}: UseFormValidationOptions): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates a single field and updates error state
   */
  const validateFieldHandler = useCallback((fieldName: string, value: any): boolean => {
    const fieldSchema = schema[fieldName];
    if (!fieldSchema) {
      console.warn(`No validation schema found for field: ${fieldName}`);
      return true;
    }

    const result = validateField(value, fieldSchema);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: result.error
    }));

    return result.isValid;
  }, [schema]);

  /**
   * Validates the entire form
   */
  const validateFormHandler = useCallback((values: Record<string, any>): ValidationResult => {
    const result = validateForm(values, schema);
    setErrors(result.errors);
    return result;
  }, [schema]);

  /**
   * Checks if a specific field is valid
   */
  const isFieldValid = useCallback((fieldName: string): boolean => {
    return !errors[fieldName];
  }, [errors]);

  /**
   * Clears all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clears error for a specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Sets error for a specific field (useful for server-side validation)
   */
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  /**
   * Checks if the entire form is valid (no errors)
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 || Object.values(errors).every(error => !error);
  }, [errors]);

  return {
    errors,
    isValid,
    isFieldValid,
    validateField: validateFieldHandler,
    validateForm: validateFormHandler,
    clearErrors,
    clearFieldError,
    setFieldError
  };
}