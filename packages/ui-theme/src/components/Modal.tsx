import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';
import { createModalAria, generateId, KeyboardKeys } from '../utils/accessibility';
import { FocusTrap } from './FocusTrap';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  description?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  description,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = generateId('modal-title');
  const descriptionId = description ? generateId('modal-description') : undefined;

  // Create ARIA attributes
  const ariaAttributes = createModalAria(
    ariaLabelledBy || (title ? titleId : undefined),
    ariaDescribedBy || descriptionId
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Announce modal opening to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Dialog opened: ${title || 'Modal dialog'}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, title]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === KeyboardKeys.ESCAPE && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          className={cn(
            'relative bg-background border border-border rounded-lg shadow-4 mx-4 w-full',
            'focus:outline-none',
            modalSizes[size]
          )}
          {...ariaAttributes}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 
                id={titleId}
                className="text-title-sm font-semibold text-text"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-offset-1"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5 text-text-secondary" aria-hidden="true" />
              </button>
            </div>
          )}
          
          {/* Description (if provided) */}
          {description && (
            <div className="px-6 pt-4">
              <p id={descriptionId} className="text-sm text-text-secondary">
                {description}
              </p>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}

export function ModalHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end space-x-3 mt-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}