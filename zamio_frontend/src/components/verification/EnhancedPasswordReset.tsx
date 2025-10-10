import React, { useState, useEffect } from 'react';
import { CodeInput } from '../ui/CodeInput';
import api from '../../lib/api';

interface EnhancedPasswordResetProps {
  /** Email address for password reset */
  email: string;
  /** Callback when password reset is successful */
  onResetSuccess: () => void;
  /** Initial reset method */
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

export function EnhancedPasswordReset({
  email,
  onResetSuccess,
  initialMethod = 'code',
  showMethodSelection = true
}: EnhancedPasswordResetProps) {
  const [method, setMethod] = useState<'code' | 'link'>(initialMethod);
  const [step, setStep] = useState<'method' | 'code' | 'password'>('method');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resendInfo, setResendInfo] = useState<ResendInfo>({
    canResend: true,
    cooldownSeconds: 0,
    resendCount: 0,
    maxResends: 3
  });
  const [resetSent, setResetSent] = useState(false);

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

  const handleSendReset = async () => {
    setError('');
    setIsProcessing(true);

    try {
      const response = await api.post('api/accounts/request-password-reset/', {
        email,
        method
      });

      if (response.status === 200) {
        setResetSent(true);
        setStep(method === 'code' ? 'code' : 'method');
        
        // Update resend info from response if available
        if (response.data?.resend_info) {
          setResendInfo(response.data.resend_info);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to send password reset. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodeComplete = async (code: string) => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post('api/accounts/verify-password-reset-code/', {
        email,
        code
      });

      if (response.status === 200) {
        setVerifiedCode(code);
        setStep('password');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Invalid reset code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
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

    setIsProcessing(true);
    setError('');

    try {
      const response = await api.post('api/accounts/reset-password/', {
        email,
        code: verifiedCode,
        new_password: newPassword
      });

      if (response.status === 200) {
        onResetSuccess();
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResend = async () => {
    if (!resendInfo.canResend || resendInfo.cooldownSeconds > 0) {
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const response = await api.post('api/accounts/resend-password-reset/', {
        email,
        method
      });

      if (response.status === 200) {
        // Update resend info
        setResendInfo(prev => ({
          canResend: true,
          cooldownSeconds: 120, // 2 minutes
          resendCount: prev.resendCount + 1,
          maxResends: prev.maxResends
        }));
        
        // Update from response if available
        if (response.data?.resend_info) {
          setResendInfo(response.data.resend_info);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to resend reset. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMethodChange = (newMethod: 'code' | 'link') => {
    if (newMethod !== method) {
      setMethod(newMethod);
      setError('');
      setResetSent(false);
      setStep('method');
    }
  };

  const handleStartReset = () => {
    handleSendReset();
  };

  // Password step
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || !newPassword || !confirmPassword}
            className={`
              w-full py-2 px-4 rounded-md font-medium transition-colors
              ${isProcessing || !newPassword || !confirmPassword
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isProcessing ? 'Resetting Password...' : 'Reset Password'}
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

  // Code verification step
  if (step === 'code') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit reset code to
          </p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>

        <div className="mb-6">
          <CodeInput
            digits={6}
            label="Reset Code"
            helperText="Enter the 6-digit code from your email"
            onCodeComplete={handleCodeComplete}
            error={error}
            loading={isProcessing}
            autoFocus={true}
          />
        </div>

        <div className="text-center space-y-4">
          <div className="text-sm text-gray-600">
            Didn't receive the code?
          </div>
          
          <button
            onClick={handleResend}
            disabled={!resendInfo.canResend || resendInfo.cooldownSeconds > 0 || isProcessing || resendInfo.resendCount >= resendInfo.maxResends}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${resendInfo.canResend && resendInfo.cooldownSeconds === 0 && !isProcessing && resendInfo.resendCount < resendInfo.maxResends
                ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                : 'text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {resendInfo.cooldownSeconds > 0 
              ? `Resend code in ${resendInfo.cooldownSeconds}s`
              : resendInfo.resendCount >= resendInfo.maxResends
              ? 'Maximum resends reached'
              : 'Resend reset code'
            }
          </button>

          {resendInfo.resendCount > 0 && (
            <p className="text-xs text-gray-500">
              Resent {resendInfo.resendCount} of {resendInfo.maxResends} times
            </p>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>
            The reset code will expire in 15 minutes.
          </p>
          <p>
            If you continue to have issues, please contact support.
          </p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setStep('method')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Change verification method
          </button>
        </div>
      </div>
    );
  }

  // Method selection and initial step
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600 mb-2">
          Choose how you'd like to reset your password for
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      {showMethodSelection && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Reset Method
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="code"
                checked={method === 'code'}
                onChange={() => handleMethodChange('code')}
                disabled={isProcessing}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">6-digit code</div>
                <div className="text-xs text-gray-500">Enter a code sent to your email</div>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="link"
                checked={method === 'link'}
                onChange={() => handleMethodChange('link')}
                disabled={isProcessing}
                className="mr-3"
              />
              <div>
                <div className="font-medium text-sm">Email link</div>
                <div className="text-xs text-gray-500">Click a link sent to your email</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {resetSent && method === 'link' && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="text-blue-800 font-medium mb-2">
              Check Your Email
            </div>
            <p className="text-blue-700 text-sm">
              Click the password reset link in your email to continue.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleStartReset}
        disabled={isProcessing}
        className={`
          w-full py-3 px-4 rounded-md font-medium transition-colors
          ${isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {isProcessing 
          ? 'Sending...' 
          : `Send reset ${method === 'code' ? 'code' : 'link'}`
        }
      </button>

      {resetSent && (
        <div className="mt-4 text-center space-y-2">
          <div className="text-sm text-gray-600">
            Didn't receive the {method === 'code' ? 'code' : 'link'}?
          </div>
          
          <button
            onClick={handleResend}
            disabled={!resendInfo.canResend || resendInfo.cooldownSeconds > 0 || isProcessing || resendInfo.resendCount >= resendInfo.maxResends}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${resendInfo.canResend && resendInfo.cooldownSeconds === 0 && !isProcessing && resendInfo.resendCount < resendInfo.maxResends
                ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                : 'text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {resendInfo.cooldownSeconds > 0 
              ? `Resend in ${resendInfo.cooldownSeconds}s`
              : resendInfo.resendCount >= resendInfo.maxResends
              ? 'Maximum resends reached'
              : `Resend ${method === 'code' ? 'code' : 'link'}`
            }
          </button>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>
          The reset {method === 'code' ? 'code expires in 15 minutes' : 'link expires in 1 hour'}.
        </p>
      </div>
    </div>
  );
}