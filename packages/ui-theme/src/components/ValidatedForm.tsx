import React, { createContext, useContext, useCallback } from 'react';
import { useFormValidation, UseFormValidationReturn } from '../hooks/useFormValidation';
import { ValidationSchema } from '../utils/validation';

interface ValidatedFormContextType extends UseFormValidationReturn {
  validateOnSubmit: (values: Record<string, any>) => boolean;
}

const ValidatedFormContext = createContext<ValidatedFormContextType | null>(null);

export interface ValidatedFormProps {
  children: React.ReactNode;
  validationSchema: ValidationSchema;
  onSubmit?: (values: Record<string, any>, isValid: boolean) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  className?: string;
}

/**
 * Form wrapper that provides validation context to child components
 */
export function ValidatedForm({
  children,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
  className
}: ValidatedFormProps) {
  const validation = useFormValidation({
    schema: validationSchema,
    validateOnChange,
    validateOnBlur
  });

  const validateOnSubmit = useCallback((values: Record<string, any>): boolean => {
    const result = validation.validateForm(values);
    return result.isValid;
  }, [validation]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!onSubmit) return;

    const formData = new FormData(e.currentTarget);
    const values: Record<string, any> = {};
    
    // Extract form values
    for (const [key, value] of formData.entries()) {
      values[key] = value;
    }

    const isValid = validateOnSubmit(values);
    onSubmit(values, isValid);
  }, [onSubmit, validateOnSubmit]);

  const contextValue: ValidatedFormContextType = {
    ...validation,
    validateOnSubmit
  };

  return (
    <ValidatedFormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children}
      </form>
    </ValidatedFormContext.Provider>
  );
}

/**
 * Hook to access form validation context
 */
export function useValidatedForm(): ValidatedFormContextType {
  const context = useContext(ValidatedFormContext);
  if (!context) {
    throw new Error('useValidatedForm must be used within a ValidatedForm component');
  }
  return context;
}