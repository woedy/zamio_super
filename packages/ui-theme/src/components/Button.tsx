import React from 'react';
import { cn } from '../utils/cn';
import { createButtonAria, AriaAttributes } from '../utils/accessibility';
import { ScreenReaderOnly } from './ScreenReaderOnly';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-pressed'?: boolean;
  loadingText?: string;
}

const buttonVariants = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/20',
  secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/20',
  outline: 'border border-border bg-transparent hover:bg-surface focus:ring-primary/20',
  ghost: 'bg-transparent hover:bg-surface focus:ring-primary/20',
  danger: 'bg-error text-white hover:bg-error/90 focus:ring-error/20',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  loadingText = 'Loading...',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-pressed': ariaPressed,
  ...props
}: ButtonProps) {
  // Create accessibility attributes
  const ariaAttributes: AriaAttributes = {};
  
  if (ariaLabel) ariaAttributes['aria-label'] = ariaLabel;
  if (ariaDescribedBy) ariaAttributes['aria-describedby'] = ariaDescribedBy;
  if (ariaExpanded !== undefined) ariaAttributes['aria-expanded'] = ariaExpanded;
  if (ariaControls) ariaAttributes['aria-controls'] = ariaControls;
  if (ariaPressed !== undefined) ariaAttributes['aria-pressed'] = ariaPressed;
  if (disabled || loading) ariaAttributes['aria-disabled'] = true;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Enhanced focus styles for better visibility
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || loading}
      {...ariaAttributes}
      {...props}
    >
      {loading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <ScreenReaderOnly>{loadingText}</ScreenReaderOnly>
        </>
      )}
      {children}
    </button>
  );
}