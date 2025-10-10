import React from 'react';
import { cn } from '../utils/cn';

export interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Component that renders content only visible to screen readers
 * Uses the sr-only class pattern for accessibility
 */
export function ScreenReaderOnly({ 
  children, 
  className,
  as: Component = 'span'
}: ScreenReaderOnlyProps) {
  return (
    <Component 
      className={cn(
        'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
        'clip-path-inset-50', // Modern browsers
        className
      )}
      style={{
        clipPath: 'inset(50%)', // Modern clip-path
        clip: 'rect(0, 0, 0, 0)', // Fallback for older browsers
      }}
    >
      {children}
    </Component>
  );
}

export default ScreenReaderOnly;