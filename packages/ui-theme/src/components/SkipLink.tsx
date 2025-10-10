import React from 'react';
import { cn } from '../utils/cn';

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Skip link component for keyboard navigation accessibility
 * Allows users to skip to main content or other important sections
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default, visible on focus
        'absolute left-0 top-0 z-[9999] -translate-y-full',
        'bg-primary text-white px-4 py-2 rounded-md',
        'focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
        'transition-transform duration-200 ease-in-out',
        'text-sm font-medium',
        className
      )}
      onFocus={(e) => {
        // Ensure the link is visible when focused
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onBlur={(e) => {
        // Hide the link when focus is lost
        e.currentTarget.style.transform = 'translateY(-100%)';
      }}
    >
      {children}
    </a>
  );
}

export default SkipLink;