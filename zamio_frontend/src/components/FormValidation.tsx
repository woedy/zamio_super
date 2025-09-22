import React, { useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
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

// Validation utilities
export class FormValidator {
  static validateField(value: any, rules: ValidationRule): FieldError[] {
    const errors: FieldError[] = [];

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push({ message: 'This field is required', type: 'required' });
      return errors; // Don't validate other rules if required fails
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return errors;
    }

    const stringValue = String(value);

    // Length validations
    if (rules.minLength && stringValue.length < rules.minLength) {
      errors.push({
        message: `Must be at least ${rules.minLength} characters`,
        type: 'minLength'
      });
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      errors.push({
        message: `Must be no more than ${rules.maxLength} characters`,
        type: 'maxLength'
      });
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      errors.push({
        message: 'Invalid format',
        type: 'pattern'
      });
    }

    // Email validation
    if (rules.email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(stringValue)) {
        errors.push({
          message: 'Please enter a valid email address',
          type: 'email'
        });
      }
    }

    // Phone validation
    if (rules.phone) {
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phonePattern.test(stringValue.replace(/[\s\-\(\)]/g, ''))) {
        errors.push({
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
        errors.push({
          message: 'Please enter a valid URL',
          type: 'url'
        });
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        errors.push({
          message: customError,
          type: 'custom'
        });
      }
    }

    return errors;
  }

  static validateForm(values: FormValues, rules: Record<string, ValidationRule>): FormErrors {
    const errors: FormErrors = {};

    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const fieldErrors = this.validateField(values[fieldName], fieldRules);
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    });

    return errors;
  }
}

// Form field components
interface FormFieldProps {
  label: string;
  name: string;
  value: any;
  onChange: (name: string, value: any) => void;
  errors?: FieldError[];
  rules?: ValidationRule;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  errors = [],
  rules,
  placeholder,
  disabled = false,
  className = '',
  children
}) => {
  const hasErrors = errors.length > 0;
  const isRequired = rules?.required;

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {children}
        
        {hasErrors && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
              {error.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

interface TextInputProps extends Omit<FormFieldProps, 'children'> {
  type?: 'text' | 'email' | 'tel' | 'url' | 'number';
}

export const TextInput: React.FC<TextInputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  errors = [],
  placeholder,
  disabled = false,
  ...fieldProps
}) => {
  const hasErrors = errors.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || '' : e.target.value;
    onChange(name, newValue);
  };

  return (
    <FormField {...fieldProps} name={name} value={value} onChange={onChange} errors={errors}>
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
          ${hasErrors 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 dark:focus:border-blue-400'
          }
          ${hasErrors ? 'pr-10' : ''}
        `}
      />
    </FormField>
  );
};

interface PasswordInputProps extends Omit<FormFieldProps, 'children'> {
  showStrength?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  name,
  value,
  onChange,
  errors = [],
  placeholder = 'Enter password',
  disabled = false,
  showStrength = false,
  ...fieldProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasErrors = errors.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(name, e.target.value);
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

    return {
      score,
      label: labels[score],
      color: colors[score]
    };
  };

  const strength = showStrength ? getPasswordStrength(value || '') : null;

  return (
    <FormField {...fieldProps} name={name} value={value} onChange={onChange} errors={errors}>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full px-3 py-2 pr-10 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
            ${hasErrors 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 dark:focus:border-blue-400'
            }
          `}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>

      {showStrength && strength && value && (
        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-0">
              {strength.label}
            </span>
          </div>
        </div>
      )}
    </FormField>
  );
};

interface TextAreaProps extends Omit<FormFieldProps, 'children'> {
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  name,
  value,
  onChange,
  errors = [],
  placeholder,
  disabled = false,
  rows = 3,
  ...fieldProps
}) => {
  const hasErrors = errors.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <FormField {...fieldProps} name={name} value={value} onChange={onChange} errors={errors}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
          resize-vertical
          ${hasErrors 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 dark:focus:border-blue-400'
          }
          ${hasErrors ? 'pr-10' : ''}
        `}
      />
    </FormField>
  );
};

interface SelectProps extends Omit<FormFieldProps, 'children'> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  emptyOption?: string;
}

export const Select: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  errors = [],
  options,
  emptyOption,
  disabled = false,
  ...fieldProps
}) => {
  const hasErrors = errors.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(name, e.target.value);
  };

  return (
    <FormField {...fieldProps} name={name} value={value} onChange={onChange} errors={errors}>
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          dark:bg-gray-700 dark:border-gray-600 dark:text-white
          ${hasErrors 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 dark:focus:border-blue-400'
          }
          ${hasErrors ? 'pr-10' : ''}
        `}
      >
        {emptyOption && (
          <option value="">{emptyOption}</option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
};

// Form hook for managing form state and validation
export const useForm = (
  initialValues: FormValues = {},
  validationRules: Record<string, ValidationRule> = {}
) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validate field if it has been touched
    if (touched[name] && validationRules[name]) {
      const fieldErrors = FormValidator.validateField(value, validationRules[name]);
      setErrors(prev => ({
        ...prev,
        [name]: fieldErrors
      }));
    }
  }, [touched, validationRules]);

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback(() => {
    const formErrors = FormValidator.validateForm(values, validationRules);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [values, validationRules]);

  const reset = useCallback((newValues: FormValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors && Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateForm,
    reset,
    hasErrors,
    isValid
  };
};