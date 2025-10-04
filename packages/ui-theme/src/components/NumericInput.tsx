import React, { useCallback } from 'react';
import { ValidatedInput, ValidatedInputProps } from './ValidatedInput';
import { createValidationSchema } from '../utils/validation';

export interface NumericInputProps extends Omit<ValidatedInputProps, 'type' | 'validationSchema'> {
  required?: boolean;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
  decimalPlaces?: number;
}

/**
 * Numeric input component with built-in numeric validation
 */
export function NumericInput({
  required = false,
  min,
  max,
  allowDecimals = true,
  decimalPlaces = 2,
  onChange,
  onKeyPress,
  placeholder = 'Enter a number',
  ...props
}: NumericInputProps) {
  const validationSchema = createValidationSchema.numeric(required, min, max);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const value = (e.target as HTMLInputElement).value;
    
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (
      char === 'Backspace' ||
      char === 'Delete' ||
      char === 'Tab' ||
      char === 'Escape' ||
      char === 'Enter' ||
      char.startsWith('Arrow')
    ) {
      if (onKeyPress) onKeyPress(e);
      return;
    }

    // Allow digits
    if (/\d/.test(char)) {
      if (onKeyPress) onKeyPress(e);
      return;
    }

    // Allow decimal point if decimals are allowed and there's no decimal point yet
    if (allowDecimals && char === '.' && !value.includes('.')) {
      if (onKeyPress) onKeyPress(e);
      return;
    }

    // Prevent all other characters
    e.preventDefault();
  }, [allowDecimals, onKeyPress]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // If decimals are not allowed, remove any decimal points
    if (!allowDecimals) {
      value = value.replace(/\./g, '');
    } else if (decimalPlaces !== undefined) {
      // Limit decimal places
      const parts = value.split('.');
      if (parts.length > 1 && parts[1].length > decimalPlaces) {
        value = `${parts[0]}.${parts[1].substring(0, decimalPlaces)}`;
      }
    }

    // Update the input value
    e.target.value = value;

    if (onChange) {
      onChange(e);
    }
  }, [allowDecimals, decimalPlaces, onChange]);

  return (
    <ValidatedInput
      {...props}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      validationSchema={validationSchema}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
    />
  );
}