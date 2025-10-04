import React, { useState, useEffect } from 'react';
import { CodeInput } from '../ui/CodeInput';
import { baseUrl } from '../../constants';

interface EnhancedEmailVerificationProps {
  /** Email address being verified */
  email: string;
  /** Callback when verification is successful */
  onVerificationSuccess: () => void;
  /** Initial verification method */
  initialMethod?: 'code' | 'link';
  /** Whether to show method selection */
  showMethodSelection?: boolean;
}

interface ResendInfo {
  canResend: boolean;
  cooldownSeconds: number;
  resendCount: number;
  maxResends: number;
}

export function EnhancedEmailVerification({
  email,
  onVerificationSuccess,
  initialMethod = 'code',
  showMethodSelection = true
}: EnhancedEmailVerificationProps) {
  const [method, setMethod] = useState<'code' | 'link'>(initialMethod);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendInfo, setResendInfo] = useState<ResendInfo>({
    canResend: true,
    cooldownSeconds: 0,
    resendCount: 0,
    maxResends: 3
  });
  const [verificationSent, setVerificationSent] = useState(false);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendInfo.cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setResendInfo(prev => ({
          ...prev,
          cooldownSeconds: prev.cooldownSeconds - 1
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendInfo.cooldownSeconds]);

  // Send initial verification when component mounts
  useEffect(() => {
    if (!verificationSent) {
      handleSendVerification();
    }
  }, []);

  const handleSendVerification = async () => {
    setError('');
    setIsVerifying(true);

    try {
      const response = await fetch(baseUrl + 'api/accounts/request-email-verification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          method
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationSent(true);
        // Update resend info from response if available
        if (data?.resend_info) {
          setResendInfo(data.resend_info);
        }
      } else {
        const errorMessage = data?.message || 'Failed to send verification. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Failed to send verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeComplete = async (code: string) => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch(baseUrl + 'api/accounts/verify-admin-email/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          email_token: code,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onVerificationSuccess();
      } else {
        // Display the first error message from the errors object
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat();
          setError(errorMessages.join('\n'));
        } else {
          setError(data.message || 'Invalid verification code. Please try again.');
        }
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!resendInfo.canResend || resendInfo.cooldownSeconds > 0) {
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const response = await fetch(baseUrl + 'api/accounts/resend-email-verification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          method
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update resend info
        setResendInfo(prev => ({
          canResend: true,
          cooldownSeconds: 120, // 2 minutes
          resendCount: prev.resendCount + 1,
          maxResends: prev.maxResends
        }));
        
        // Update from response if available
        if (data?.resend_info) {
          setResendInfo(data.resend_info);
        }
      } else {
        const errorMessage = data?.message || 'Failed to resend verification. Please try again.';
        setError(errorMessage);
      }
    } catch (err) {
      setError('Failed to resend verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMethodChange = (newMethod: 'code' | 'link') => {
    if (newMethod !== method) {
      setMethod(newMethod);
      setError('');
      setVerificationSent(false);
      // Will trigger useEffect to send new verification
    }
  };

  return (
    <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md w-full border border-white/20 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-white mb-2">
          We've sent a verification {method === 'code' ? 'code' : 'link'} to
        </p>
        <p className="font-medium text-white">{email}</p>
      </div>

      {showMethodSelection && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Verification Method
          </label>
          <div className="flex space-x-4 justify-center">
            <label className="flex items-center text-white">
              <input
                type="radio"
                name="method"
                value="code"
                checked={method === 'code'}
                onChange={() => handleMethodChange('code')}
                disabled={isVerifying}
                className="mr-2"
              />
              <span className="text-sm">6-digit code</span>
            </label>
            <label className="flex items-center text-white">
              <input
                type="radio"
                name="method"
                value="link"
                checked={method === 'link'}
                onChange={() => handleMethodChange('link')}
                disabled={isVerifying}
                className="mr-2"
              />
              <span className="text-sm">Email link</span>
            </label>
          </div>
        </div>
      )}

      {method === 'code' && verificationSent && (
        <div className="mb-6">
          <CodeInput
            digits={6}
            label="Verification Code"
            helperText="Enter the 6-digit code from your email"
            onCodeComplete={handleCodeComplete}
            error={error}
            loading={isVerifying}
            autoFocus={true}
            className="text-white"
          />
        </div>
      )}

      {method === 'link' && verificationSent && (
        <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <div className="text-center">
            <div className="text-blue-200 font-medium mb-2">
              Check Your Email
            </div>
            <p className="text-blue-100 text-sm">
              Click the verification link in your email to complete the process.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-md">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <div className="text-center space-y-4">
        <div className="text-sm text-white">
          Didn't receive the {method === 'code' ? 'code' : 'link'}?
        </div>
        
        <button
          onClick={handleResend}
          disabled={!resendInfo.canResend || resendInfo.cooldownSeconds > 0 || isVerifying || resendInfo.resendCount >= resendInfo.maxResends}
          className={`
            px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${resendInfo.canResend && resendInfo.cooldownSeconds === 0 && !isVerifying && resendInfo.resendCount < resendInfo.maxResends
              ? 'text-blue-300 hover:text-blue-200 hover:bg-blue-500/20'
              : 'text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {resendInfo.cooldownSeconds > 0 
            ? `Resend in ${resendInfo.cooldownSeconds}s`
            : resendInfo.resendCount >= resendInfo.maxResends
            ? 'Maximum resends reached'
            : `Resend verification ${method === 'code' ? 'code' : 'link'}`
          }
        </button>

        {resendInfo.resendCount > 0 && (
          <p className="text-xs text-gray-300">
            Resent {resendInfo.resendCount} of {resendInfo.maxResends} times
          </p>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-300 text-center">
        <p>
          The verification {method === 'code' ? 'code expires in 15 minutes' : 'link expires in 1 hour'}.
        </p>
        <p>
          If you continue to have issues, please contact support.
        </p>
      </div>
    </div>
  );
}