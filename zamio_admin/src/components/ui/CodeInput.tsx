import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

export interface CodeInputProps {
  /** Callback fired when all digits are entered */
  onCodeComplete: (code: string) => void;
  /** Callback fired when code changes */
  onCodeChange?: (code: string) => void;
  /** Error message to display */
  error?: string;
  /** Loading state */
  loading?: boolean;
  /** Auto focus first input on mount */
  autoFocus?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label for the input group */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Custom class name */
  className?: string;
  /** Number of digits for the code (default: 6) */
  digits?: number;
}

export function CodeInput({
  onCodeComplete,
  onCodeChange,
  error,
  loading = false,
  autoFocus = true,
  disabled = false,
  label,
  helperText,
  className,
  digits = 6
}: CodeInputProps) {
  const [values, setValues] = useState<string[]>(Array(digits).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  // Clear inputs when error changes (for failed verification)
  useEffect(() => {
    if (error) {
      setValues(Array(digits).fill(''));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  }, [error, digits]);

  const handleChange = (index: number, value: string) => {
    // Only allow single digits
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    // Only allow numeric values
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Call onChange callback
    const code = newValues.join('');
    onCodeChange?.(code);

    // Auto advance to next field
    if (value && index < digits - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all fields are filled
    if (code.length === digits && !loading) {
      onCodeComplete(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        // Move to previous field if current is empty
        inputRefs.current[index - 1]?.focus();
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < digits - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Handle Enter key
    if (e.key === 'Enter') {
      const code = values.join('');
      if (code.length === digits && !loading) {
        onCodeComplete(code);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Extract only digits from pasted data
    const pastedDigits = pastedData.replace(/\D/g, '').slice(0, digits);
    
    if (pastedDigits.length > 0) {
      const newValues = Array(digits).fill('');
      for (let i = 0; i < pastedDigits.length && i < digits; i++) {
        newValues[i] = pastedDigits[i];
      }
      
      setValues(newValues);
      onCodeChange?.(newValues.join(''));
      
      // Focus the next empty field or the last field
      const nextIndex = Math.min(pastedDigits.length, digits - 1);
      inputRefs.current[nextIndex]?.focus();
      
      // Auto submit if all digits were pasted
      if (pastedDigits.length === digits && !loading) {
        onCodeComplete(pastedDigits);
      }
    }
  };

  const cn = (...classes: (string | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="flex gap-2 justify-center">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled || loading}
            className={cn(
              'w-12 h-12 text-center text-lg font-semibold',
              'rounded-md border border-gray-300 bg-white',
              'text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              loading && 'cursor-wait'
            )}
            aria-label={`Digit ${index + 1} of ${digits}`}
            aria-describedby={error ? 'code-error' : helperText ? 'code-helper' : undefined}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="text-sm text-gray-500">Verifying...</div>
        </div>
      )}
      
      {error && (
        <p id="code-error" className="text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id="code-helper" className="text-sm text-gray-500 text-center">
          {helperText}
        </p>
      )}
    </div>
  );
}