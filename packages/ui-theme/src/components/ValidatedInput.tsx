import React, { useState, useCallback } from 'react';
import { Input, InputProps } from './Input';
import { ValidationSchema, validateField } from '../utils/validation';

export interface ValidatedInputProps extends Omit<InputProps, 'error'> {
  name: string;
  validationSchema?: ValidationSchema[string];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onValidationChange?: (isValid: boolean, error: string) => void;
  externalError?: string;
}

/**
 * Input component with built-in validation
 */
export function ValidatedInput({
  name,
  validationSchema,
  validateOnChange = true,
  validateOnBlur = true,
  onValidationChange,
  externalError,
  onChange,
  onBlur,
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>('');
  const [hasBlurred, setHasBlurred] = useState(false);

  const validateValue = useCallback((value: string) => {
    if (!validationSchema) return true;

    const result = validateField(value, validationSchema);
    setError(result.error);
    
    if (onValidationChange) {
      onValidationChange(result.isValid, result.error);
    }

    return result.isValid;
  }, [validationSchema, onValidationChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (onChange) {
      onChange(e);
    }

    // Validate on change if enabled and field has been blurred at least once
    if (validateOnChange && (hasBlurred || error)) {
      validateValue(value);
    }
  }, [onChange, validateOnChange, hasBlurred, error, validateValue]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setHasBlurred(true);
    
    if (onBlur) {
      onBlur(e);
    }

    // Validate on blur if enabled
    if (validateOnBlur) {
      validateValue(e.target.value);
    }
  }, [onBlur, validateOnBlur, validateValue]);

  // Use external error if provided, otherwise use internal error
  const displayError = externalError || error;

  return (
    <Input
      {...props}
      name={name}
      error={displayError}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}