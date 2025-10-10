import React from 'react';
import { cn } from '../utils/cn';
import { createFormFieldAria, generateId } from '../utils/accessibility';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hideLabel?: boolean; // For cases where label is visually hidden but still accessible
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  hideLabel = false,
  required,
  ...props
}: InputProps) {
  const inputId = id || generateId('input');
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helperText && !error ? `${inputId}-help` : undefined;

  // Create accessibility attributes
  const ariaAttributes = createFormFieldAria(inputId, label, error, helperText, required);

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium text-text',
            hideLabel && 'sr-only'
          )}
        >
          {label}
          {required && (
            <span className="text-error ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div 
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="text-text-secondary">{leftIcon}</div>
          </div>
        )}
        
        <input
          id={inputId}
          className={cn(
            'block w-full rounded-md border border-border bg-background px-3 py-2',
            'text-text placeholder-text-secondary',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-primary/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors duration-200',
            error && 'border-error focus:border-error focus:ring-error/20',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...ariaAttributes}
          {...props}
        />
        
        {rightIcon && (
          <div 
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            <div className="text-text-secondary">{rightIcon}</div>
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={errorId}
          className="text-sm text-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={helpId}
          className="text-sm text-text-secondary"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}