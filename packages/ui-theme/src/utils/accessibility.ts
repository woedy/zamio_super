/**
 * Accessibility utilities for ZamIO UI components
 * Provides functions for ARIA attributes, keyboard navigation, and screen reader support
 */

export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean | 'grammar' | 'spelling';
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  role?: string;
}

/**
 * Generate unique IDs for accessibility attributes
 */
export function generateId(prefix: string = 'zamio'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create ARIA attributes for form fields
 */
export function createFormFieldAria(
  id: string,
  label?: string,
  error?: string,
  helperText?: string,
  required?: boolean
): AriaAttributes {
  const aria: AriaAttributes = {};

  if (label) {
    aria['aria-label'] = label;
  }

  if (error) {
    aria['aria-invalid'] = true;
    aria['aria-describedby'] = `${id}-error`;
  } else if (helperText) {
    aria['aria-describedby'] = `${id}-help`;
  }

  if (required) {
    aria['aria-required'] = true as any; // TypeScript doesn't include aria-required in standard attributes
  }

  return aria;
}

/**
 * Create ARIA attributes for buttons
 */
export function createButtonAria(
  label: string,
  pressed?: boolean,
  expanded?: boolean,
  controls?: string,
  disabled?: boolean
): AriaAttributes {
  const aria: AriaAttributes = {
    'aria-label': label,
  };

  if (pressed !== undefined) {
    aria['aria-pressed'] = pressed;
  }

  if (expanded !== undefined) {
    aria['aria-expanded'] = expanded;
  }

  if (controls) {
    aria['aria-controls'] = controls;
  }

  if (disabled) {
    aria['aria-disabled'] = disabled;
  }

  return aria;
}

/**
 * Create ARIA attributes for navigation items
 */
export function createNavAria(
  label: string,
  current?: boolean,
  selected?: boolean
): AriaAttributes {
  const aria: AriaAttributes = {
    'aria-label': label,
  };

  if (current) {
    aria['aria-current'] = 'page';
  }

  if (selected !== undefined) {
    aria['aria-selected'] = selected;
  }

  return aria;
}

/**
 * Create ARIA attributes for modal dialogs
 */
export function createModalAria(
  labelledBy?: string,
  describedBy?: string
): AriaAttributes {
  const aria: AriaAttributes = {
    role: 'dialog',
    'aria-modal': true as any, // TypeScript doesn't include aria-modal
  };

  if (labelledBy) {
    aria['aria-labelledby'] = labelledBy;
  }

  if (describedBy) {
    aria['aria-describedby'] = describedBy;
  }

  return aria;
}

/**
 * Create ARIA attributes for live regions
 */
export function createLiveRegionAria(
  level: 'off' | 'polite' | 'assertive' = 'polite',
  atomic: boolean = false
): AriaAttributes {
  return {
    'aria-live': level,
    'aria-atomic': atomic,
  };
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Handle keyboard navigation for interactive elements
 */
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  handlers: Partial<Record<keyof typeof KeyboardKeys, () => void>>
): void {
  const key = event.key;
  const handler = Object.entries(KeyboardKeys).find(([, value]) => value === key)?.[0] as keyof typeof KeyboardKeys;
  
  if (handler && handlers[handler]) {
    event.preventDefault();
    handlers[handler]!();
  }
}

/**
 * Focus management utilities
 */
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);

  // Focus the first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Announce content to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Check if an element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return !(
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.hasAttribute('hidden')
  );
}

/**
 * Color contrast utilities
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}