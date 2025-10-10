import React, { useCallback } from 'react';
import { useValidatedForm } from './ValidatedForm';
import { ValidatedInput, ValidatedInputProps } from './ValidatedInput';

export interface FormFieldProps extends Omit<ValidatedInputProps, 'externalError' | 'onValidationChange'> {
  name: string;
}

/**
 * Form field component that integrates with ValidatedForm context
 */
export function FormField({
  name,
  onChange,
  validationSchema,
  ...props
}: FormFieldProps) {
  const { errors, clearFieldError } = useValidatedForm();
  const fieldError = errors[name];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clear error when user starts typing
    if (fieldError) {
      clearFieldError(name);
    }

    if (onChange) {
      onChange(e);
    }
  }, [onChange, fieldError, clearFieldError, name]);

  const handleValidationChange = useCallback((isValid: boolean, error: string) => {
    // This is handled by the form context, but we can add additional logic here if needed
  }, []);

  return (
    <ValidatedInput
      {...props}
      name={name}
      validationSchema={validationSchema}
      externalError={fieldError}
      onValidationChange={handleValidationChange}
      onChange={handleChange}
    />
  );
}