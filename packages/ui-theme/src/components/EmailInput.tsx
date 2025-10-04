import React from 'react';
import { ValidatedInput, ValidatedInputProps } from './ValidatedInput';
import { createValidationSchema } from '../utils/validation';
import { Mail } from 'lucide-react';

export interface EmailInputProps extends Omit<ValidatedInputProps, 'type' | 'validationSchema' | 'leftIcon'> {
  required?: boolean;
  showIcon?: boolean;
}

/**
 * Email input component with built-in email validation
 */
export function EmailInput({
  required = false,
  showIcon = true,
  placeholder = 'Enter your email address',
  ...props
}: EmailInputProps) {
  const validationSchema = createValidationSchema.email(required);

  return (
    <ValidatedInput
      {...props}
      type="email"
      placeholder={placeholder}
      validationSchema={validationSchema}
      leftIcon={showIcon ? <Mail size={16} /> : undefined}
      autoComplete="email"
    />
  );
}