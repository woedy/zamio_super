import React, { useState, useEffect } from 'react';
import { CodeInput } from '../ui/CodeInput';
import api from '../../lib/api';

interface EnhancedPasswordResetProps {
  /** Email address for password reset */
  email: string;
  /** Callback when password reset is successful */
  onResetSuccess: () => void;
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

export function EnhancedPasswordReset({
  email,
  onResetSuccess,
  initialMethod = 'code',
  showMethodSelection = true
}: EnhancedPasswordResetProps) {
  const [method, setMethod] = useState<'code' | 'link'>(initialMethod);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendInfo, setResendInfo] = useState<ResendInfo>({
    canResend: true,
    cooldownSeconds: 0,
    resendCount: 0,
    maxResends: 3
  });
  const [resetSent, setResetSent] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

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

  // Send initial reset when component mounts
  useEffect(() => {
    if (!resetSent) {
      handleSendReset();
    }
  }, []);

  const handleSendReset = async () => {
    setError('');
    setIsVerifying(true);

    try {
      const response = await api.post('api/accounts/request-password-reset/', {
        email,
        method
      });

      if (response.status === 200) {
        setResetSent(true);
        // Update resend info from response if available
        if (response.data?.resend_info) {
          setResendInfo(response.data.resend_info);
        }
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to send password reset. Please try again.';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeComplete = async (code: string) => {
    if (method === 'code') {
      setVerificationCode(code);
      setShowPasswordForm(true);
      setError('');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setPasswordError('');
    setIsVerifying(true);

    try {
      const response = await api.post('api/accounts/confirm-password-otp/', {
        email,
        otp_code: verificationCode,
        new_password: newPassword
      });

      if (response.status === 200) {
        onResetSuccess();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to reset password. Please try again.';
      const errs = err?.response?.data?.errors;
      if (errs) {
        const errorMessages = Object.values(errs).flat() as string[];
        setPasswordError(errorMessages.join('\n'));
      } else {
        setPasswordError(msg);
      }
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
      const response = await api.post('api/accounts/resend-password-otp/', {
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
      const msg = err?.response?.data?.message || err?.message || 'Failed to resend password reset. Please try again.';
      const errs = err?.response?.data?.errors;
      if (errs) {
        const errorMessages = Object.values(errs).flat() as string[];
        setError(errorMessages.join('\n'));
      } else {
        setError(msg);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMethodChange = (newMethod: 'code' | 'link') => {
    if (newMethod !== method) {
      setMethod(newMethod);
      setError('');
      setResetSent(false);
      setShowPasswordForm(false);
      // Will trigger useEffect to send new reset
    }
  };

  return (
    <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md w-full border border-white/20 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Reset Your Password
        </h2>
        <p className="text-white mb-2">
          We've sent a password reset {method === 'code' ? 'code' : 'link'} to
        </p>
        <p className="font-medium text-white">{email}</p>
      </div>

      {showMethodSelection && !showPasswordForm && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-3">
            Reset Method
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

      {method === 'code' && resetSent && !showPasswordForm && (
        <div className="mb-6">
          <CodeInput
            digits={6}
            label="Reset Code"
            helperText="Enter the 6-digit code from your email"
            onCodeComplete={handleCodeComplete}
            error={error}
            loading={isVerifying}
            autoFocus={true}
            className="text-white"
          />
        </div>
      )}

      {showPasswordForm && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm new password"
              required
            />
          </div>

          {passwordError && (
            <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-md">
              <p className="text-sm text-red-200">{passwordError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50"
          >
            {isVerifying ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
      )}

      {method === 'link' && resetSent && (
        <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
          <div className="text-center">
            <div className="text-blue-200 font-medium mb-2">
              Check Your Email
            </div>
            <p className="text-blue-100 text-sm">
              Click the password reset link in your email to complete the process.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-md">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {!showPasswordForm && (
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
              : `Resend reset ${method === 'code' ? 'code' : 'link'}`
            }
          </button>

          {resendInfo.resendCount > 0 && (
            <p className="text-xs text-gray-300">
              Resent {resendInfo.resendCount} of {resendInfo.maxResends} times
            </p>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-300 text-center">
        <p>
          The reset {method === 'code' ? 'code expires in 15 minutes' : 'link expires in 1 hour'}.
        </p>
        <p>
          If you continue to have issues, please contact support.
        </p>
      </div>
    </div>
  );
}