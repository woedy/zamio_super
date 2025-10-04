import React, { useState } from 'react';
import { CodeInput } from '../ui/CodeInput';

interface PasswordResetCodeFormProps {
  /** Email address for password reset */
  email: string;
  /** Callback when password reset is successful */
  onResetSuccess: () => void;
  /** Callback when user wants to resend code */
  onResendCode: () => void;
  /** Whether resend is available */
  canResend: boolean;
  /** Seconds until resend is available */
  resendCooldownSeconds?: number;
}

export function PasswordResetCodeForm({
  email,
  onResetSuccess,
  onResendCode,
  canResend,
  resendCooldownSeconds = 0
}: PasswordResetCodeFormProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [verifiedCode, setVerifiedCode] = useState('');

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
      // Verify the code first
      const response = await fetch('/api/auth/verify-password-reset-code', {
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
        setVerifiedCode(code);
        setStep('password');
      } else {
        setError(data.message || 'Invalid reset code. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verifiedCode,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        onResetSuccess();
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
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
      setStep('code'); // Go back to code step
      setVerifiedCode('');
    }
  };

  if (step === 'password') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Set New Password
          </h2>
          <p className="text-gray-600">
            Enter your new password for {email}
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying || !newPassword || !confirmPassword}
            className={`
              w-full py-2 px-4 rounded-md font-medium transition-colors
              ${isVerifying || !newPassword || !confirmPassword
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isVerifying ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setStep('code')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to verification code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600">
          We've sent a 4-digit reset code to
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      <div className="mb-6">
        <CodeInput
          label="Reset Code"
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
            : 'Resend reset code'
          }
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          The reset code will expire in 15 minutes.
        </p>
        <p>
          If you continue to have issues, please contact support.
        </p>
      </div>
    </div>
  );
}