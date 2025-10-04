/**
 * Validation utilities for form inputs
 */

export interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [field: string]: {
    rules: ValidationRule[];
    required?: boolean;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Common validation functions
 */
export const validators = {
  /**
   * Validates email format
   */
  email: (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Validates numeric input (integers and decimals)
   */
  numeric: (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    const numericRegex = /^\d+(\.\d+)?$/;
    return numericRegex.test(value);
  },

  /**
   * Validates integer input only
   */
  integer: (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    const integerRegex = /^\d+$/;
    return integerRegex.test(value);
  },

  /**
   * Validates required fields
   */
  required: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined && value !== '';
  },

  /**
   * Validates minimum length
   */
  minLength: (min: number) => (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    return value.length >= min;
  },

  /**
   * Validates maximum length
   */
  maxLength: (max: number) => (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    return value.length <= max;
  },

  /**
   * Validates minimum value for numbers
   */
  minValue: (min: number) => (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    const num = parseFloat(value);
    return !isNaN(num) && num >= min;
  },

  /**
   * Validates maximum value for numbers
   */
  maxValue: (max: number) => (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    const num = parseFloat(value);
    return !isNaN(num) && num <= max;
  },

  /**
   * Validates URL format
   */
  url: (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validates phone number format (basic)
   */
  phone: (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },

  /**
   * Custom pattern validator
   */
  pattern: (regex: RegExp) => (value: string): boolean => {
    if (!value) return true; // Allow empty for optional fields
    return regex.test(value);
  }
};

/**
 * Common validation error messages
 */
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  numeric: 'Please enter a valid number',
  integer: 'Please enter a whole number',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must be no more than ${max} characters long`,
  minValue: (min: number) => `Must be at least ${min}`,
  maxValue: (max: number) => `Must be no more than ${max}`,
  url: 'Please enter a valid URL',
  phone: 'Please enter a valid phone number',
  pattern: 'Invalid format'
};

/**
 * Validates a single field against its schema
 */
export function validateField(
  value: any,
  fieldSchema: ValidationSchema[string]
): { isValid: boolean; error: string } {
  // Check required validation first
  if (fieldSchema.required && !validators.required(value)) {
    return {
      isValid: false,
      error: validationMessages.required
    };
  }

  // If field is not required and empty, it's valid
  if (!fieldSchema.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return {
      isValid: true,
      error: ''
    };
  }

  // Run through all validation rules
  for (const rule of fieldSchema.rules) {
    if (!rule.validator(value)) {
      return {
        isValid: false,
        error: rule.message
      };
    }
  }

  return {
    isValid: true,
    error: ''
  };
}

/**
 * Validates an entire form against its schema
 */
export function validateForm(
  values: Record<string, any>,
  schema: ValidationSchema
): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const fieldValue = values[fieldName];
    const fieldResult = validateField(fieldValue, fieldSchema);
    
    if (!fieldResult.isValid) {
      errors[fieldName] = fieldResult.error;
      isValid = false;
    }
  }

  return {
    isValid,
    errors
  };
}

/**
 * Creates common validation schemas
 */
export const createValidationSchema = {
  /**
   * Email field validation
   */
  email: (required = false): ValidationSchema[string] => ({
    required,
    rules: [
      {
        validator: validators.email,
        message: validationMessages.email
      }
    ]
  }),

  /**
   * Numeric field validation
   */
  numeric: (required = false, min?: number, max?: number): ValidationSchema[string] => {
    const rules: ValidationRule[] = [
      {
        validator: validators.numeric,
        message: validationMessages.numeric
      }
    ];

    if (min !== undefined) {
      rules.push({
        validator: validators.minValue(min),
        message: validationMessages.minValue(min)
      });
    }

    if (max !== undefined) {
      rules.push({
        validator: validators.maxValue(max),
        message: validationMessages.maxValue(max)
      });
    }

    return {
      required,
      rules
    };
  },

  /**
   * Text field validation
   */
  text: (required = false, minLength?: number, maxLength?: number): ValidationSchema[string] => {
    const rules: ValidationRule[] = [];

    if (minLength !== undefined) {
      rules.push({
        validator: validators.minLength(minLength),
        message: validationMessages.minLength(minLength)
      });
    }

    if (maxLength !== undefined) {
      rules.push({
        validator: validators.maxLength(maxLength),
        message: validationMessages.maxLength(maxLength)
      });
    }

    return {
      required,
      rules
    };
  },

  /**
   * URL field validation
   */
  url: (required = false): ValidationSchema[string] => ({
    required,
    rules: [
      {
        validator: validators.url,
        message: validationMessages.url
      }
    ]
  }),

  /**
   * Phone field validation
   */
  phone: (required = false): ValidationSchema[string] => ({
    required,
    rules: [
      {
        validator: validators.phone,
        message: validationMessages.phone
      }
    ]
  })
};