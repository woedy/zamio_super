import React from 'react';
import { cn } from '../utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Switch({
  label,
  description,
  className,
  id,
  checked,
  ...props
}: SwitchProps) {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={switchId}
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
      
      <div className="relative">
        <input
          type="checkbox"
          id={switchId}
          checked={checked}
          className={cn(
            'sr-only',
            className
          )}
          {...props}
        />
        <label
          htmlFor={switchId}
          className={cn(
            'flex items-center cursor-pointer',
            'w-11 h-6 bg-border rounded-full transition-colors duration-200',
            checked && 'bg-primary'
          )}
        >
          <span
            className={cn(
              'inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200',
              'ml-1',
              checked && 'translate-x-5'
            )}
          />
        </label>
      </div>
    </div>
  );
}