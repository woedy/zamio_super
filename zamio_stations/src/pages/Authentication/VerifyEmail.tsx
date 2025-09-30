import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ButtonLoader from '../../common/button_loader';
import { persistStationId } from '../../lib/auth';
import api from '../../lib/api';
import type { StationOnboardingStep } from '../../contexts/StationOnboardingContext';
import useStationOnboarding from '../../hooks/useStationOnboarding';
import { getOnboardingRoute } from '../../utils/onboarding';

const OTP_LENGTH = 4;

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useStationOnboarding();

  const email = useMemo(() => {
    if (location.state?.email) {
      return String(location.state.email);
    }

    const queryEmail = new URLSearchParams(location.search).get('email');
    if (queryEmail) {
      return queryEmail;
    }

    try {
      return localStorage.getItem('email') || '';
    } catch {
      return '';
    }
  }, [location]);

  const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [inputError, setInputError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const focusInput = (index: number) => {
    const el = document.getElementById(`otp-${index}`) as HTMLInputElement | null;
    el?.focus();
  };

  const handleChange = (value: string, index: number) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 1);
    const nextOtp = [...otp];
    nextOtp[index] = sanitized;
    setOtp(nextOtp);

    if (sanitized && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) {
      return;
    }
    const nextOtp = Array.from({ length: OTP_LENGTH }, (_, idx) => pasted[idx] ?? '');
    setOtp(nextOtp);
    const filledLength = nextOtp.findIndex((digit) => !digit);
    focusInput(filledLength === -1 ? OTP_LENGTH - 1 : filledLength);
  };

  const ensureEmailAvailable = (): boolean => {
    if (email) {
      return true;
    }

    setInputError(
      'We could not determine which account to verify. Please open the verification link from your email or log in to request a new code.',
    );
    return false;
  };

  const resolveNextStep = (payload: any): StationOnboardingStep => {
    if (payload?.profile_completed) {
      return 'done';
    }

    const candidate = (payload?.next_step || 'profile') as StationOnboardingStep;
    const allowed: StationOnboardingStep[] = ['profile', 'staff', 'report', 'payment', 'done'];
    return allowed.includes(candidate) ? candidate : 'profile';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ensureEmailAvailable()) {
      return;
    }

    const code = otp.join('');
    if (code.length !== OTP_LENGTH || otp.some((digit) => !digit)) {
      setInputError('Please enter the 4-digit code that we emailed to you.');
      return;
    }

    setInputError('');
    setInfoMessage('');
    setVerifying(true);

    try {
      const response = await api.post('api/accounts/verify-station-email/', {
        email,
        email_token: code,
      });

      const payload = response.data?.data ?? {};

      localStorage.setItem('first_name', payload.first_name ?? '');
      localStorage.setItem('last_name', payload.last_name ?? '');
      localStorage.setItem('user_id', payload.user_id ?? '');
      persistStationId(payload.station_id ?? '');
      localStorage.setItem('email', payload.email ?? email);
      if (payload.photo) {
        localStorage.setItem('photo', payload.photo);
      } else {
        localStorage.removeItem('photo');
      }
      localStorage.setItem('token', payload.token ?? '');
      try {
        sessionStorage.setItem('token', payload.token ?? '');
      } catch {
        /* ignore storage errors */
      }

      await refresh({ silent: true });

      const nextStep = resolveNextStep(payload);
      const nextRoute = getOnboardingRoute(nextStep);

      navigate(nextRoute, {
        state: { successMessage: 'Email verified successfully!' },
        replace: true,
      });
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors) {
        const message = Object.values(data.errors)
          .flat()
          .filter((item): item is string => typeof item === 'string')
          .join('\n');
        setInputError(message || 'Verification error. Please try again.');
      } else {
        setInputError(data?.message || 'Verification error. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!ensureEmailAvailable()) {
      return;
    }

    setInputError('');
    setInfoMessage('');
    setResending(true);

    try {
      await api.post('api/accounts/resend-email-verification/', { email });
      setInfoMessage('We just sent a new verification code to your email.');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors) {
        const message = Object.values(data.errors)
          .flat()
          .filter((item): item is string => typeof item === 'string')
          .join('\n');
        setInputError(message || 'Verification error. Please try again.');
      } else {
        setInputError(data?.message || 'Verification error. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h2 className="text-5xl font-bold text-white text-center mb-8">Verify Email</h2>

        {inputError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {inputError}</span>
          </div>
        )}

        {infoMessage && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {infoMessage}</span>
          </div>
        )}

        <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md w-full border border-white/20 shadow-xl">
          <p className="text-white text-center mb-6">
            Please enter the 4-digit code sent to {email || 'your email address'}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(event.target.value, index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  onPaste={handlePaste}
                  className="w-16 h-16 text-center text-2xl text-white bg-white/20 border border-white/30 rounded-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {verifying ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition"
                disabled={verifying}
              >
                Verify
              </button>
            )}
          </form>

          <p className="text-white mt-6 text-center">
            Didn't receive a code?{' '}
            {resending ? (
              <span className="inline-flex items-center justify-center align-middle">
                <ButtonLoader />
              </span>
            ) : (
              <button
                onClick={handleResend}
                className="underline text-blue-400 hover:text-blue-200"
                type="button"
                disabled={resending}
              >
                Resend
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

