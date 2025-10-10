import React from 'react';
import { cn } from '../utils/cn';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Radio({
  label,
  description,
  className,
  id,
  ...props
}: RadioProps) {
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-start space-x-3">
      <input
        type="radio"
        id={radioId}
        className={cn(
          'h-4 w-4 border border-border bg-background',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          'checked:bg-primary checked:border-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer',
          className
        )}
        {...props}
      />
      
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={radioId}
              className="text-sm font-medium text-text cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-text-secondary">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}