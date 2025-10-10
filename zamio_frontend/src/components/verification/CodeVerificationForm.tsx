import React, { useState } from 'react';
import { CodeInput } from '../ui/CodeInput';

interface CodeVerificationFormProps {
  /** Email address being verified */
  email: string;
  /** Callback when verification is successful */
  onVerificationSuccess: () => void;
  /** Callback when user wants to resend code */
  onResendCode: () => void;
  /** Whether resend is available */
  canResend: boolean;
  /** Seconds until resend is available */
  resendCooldownSeconds?: number;
}

export function CodeVerificationForm({
  email,
  onVerificationSuccess,
  onResendCode,
  canResend,
  resendCooldownSeconds = 0
}: CodeVerificationFormProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);

  // Countdown timer for resend cooldown
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleCodeComplete = async (code: string) => {
    setIsVerifying(true);
    setError('');

    try {
      // Call your verification API here
      const response = await fetch('/api/auth/verify-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code
        })
      });

      const data = await response.json();

      if (response.ok) {
        onVerificationSuccess();
      } else {
        setError(data.message || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (canResend && cooldown === 0) {
      onResendCode();
      setCooldown(120); // 2 minute cooldown
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          We've sent a 4-digit verification code to
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      <div className="mb-6">
        <CodeInput
          label="Verification Code"
          helperText="Enter the 4-digit code from your email"
          onCodeComplete={handleCodeComplete}
          error={error}
          loading={isVerifying}
          autoFocus={true}
        />
      </div>

      <div className="text-center space-y-4">
        <div className="text-sm text-gray-600">
          Didn't receive the code?
        </div>
        
        <button
          onClick={handleResend}
          disabled={!canResend || cooldown > 0 || isVerifying}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${canResend && cooldown === 0 && !isVerifying
              ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              : 'text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {cooldown > 0 
            ? `Resend code in ${cooldown}s`
            : 'Resend verification code'
          }
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          The verification code will expire in 15 minutes.
        </p>
        <p>
          If you continue to have issues, please contact support.
        </p>
      </div>
    </div>
  );
}