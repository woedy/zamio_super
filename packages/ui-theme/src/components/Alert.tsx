import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const alertVariants = {
  info: {
    container: 'bg-info/10 border-info/20 text-info',
    icon: Info,
  },
  success: {
    container: 'bg-success/10 border-success/20 text-success',
    icon: CheckCircle,
  },
  warning: {
    container: 'bg-warning/10 border-warning/20 text-warning',
    icon: AlertTriangle,
  },
  error: {
    container: 'bg-error/10 border-error/20 text-error',
    icon: AlertCircle,
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  ...props
}: AlertProps) {
  const { container, icon: Icon } = alertVariants[variant];

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4',
        container,
        className
      )}
      {...props}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
        
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}