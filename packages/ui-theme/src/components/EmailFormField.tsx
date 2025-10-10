import React from 'react';
import { FormField, FormFieldProps } from './FormField';
import { createValidationSchema } from '../utils/validation';
import { Mail } from 'lucide-react';

export interface EmailFormFieldProps extends Omit<FormFieldProps, 'type' | 'validationSchema' | 'leftIcon'> {
  required?: boolean;
  showIcon?: boolean;
}

/**
 * Email form field component with built-in email validation for use within ValidatedForm
 */
export function EmailFormField({
  required = false,
  showIcon = true,
  placeholder = 'Enter your email address',
  ...props
}: EmailFormFieldProps) {
  const validationSchema = createValidationSchema.email(required);

  return (
    <FormField
      {...props}
      type="email"
      placeholder={placeholder}
      validationSchema={validationSchema}
      leftIcon={showIcon ? <Mail size={16} /> : undefined}
      autoComplete="email"
    />
  );
}