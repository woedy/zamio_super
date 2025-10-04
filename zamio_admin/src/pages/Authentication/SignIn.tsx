import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import ButtonLoader from '../../common/button_loader';
import { Eye, EyeOff } from 'lucide-react';
import {
  fetchAdminOnboardingStatus,
  loginAdmin,
  type AdminAuthPayload,
  type AdminAuthResponse,
  type ApiErrorPayload,
} from '../../services/authService';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fcm_token = 'web-admin';

  const navigate = useNavigate();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || '',
  );

  useEffect(() => {
    // Clear the message after 5 seconds (optional)
    const timer = setTimeout(() => setSuccessMessage(''), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!isValid) return;

    setEmailError('');
    setPasswordError('');
    setLoading(true);
    const payload: AdminAuthPayload = {
      email,
      password,
      fcm_token,
    };

    try {
      const response = await loginAdmin(payload);
      const authData: AdminAuthResponse | undefined = response.data?.data;

      if (authData) {
        localStorage.setItem('first_name', authData.first_name ?? '');
        localStorage.setItem('last_name', authData.last_name ?? '');
        localStorage.setItem('user_id', authData.user_id ?? '');
        if (authData.admin_id) {
          localStorage.setItem('admin_id', String(authData.admin_id));
        }
        localStorage.setItem('email', authData.email ?? '');
        if (authData.photo) {
          localStorage.setItem('photo', authData.photo);
        } else {
          localStorage.removeItem('photo');
        }
        if (authData.token) {
          localStorage.setItem('token', authData.token);
          sessionStorage.setItem('token', authData.token);
        }
        if (authData.phone) {
          localStorage.setItem('phone', authData.phone);
        } else {
          localStorage.removeItem('phone');
        }
        if (authData.country) {
          localStorage.setItem('country', authData.country);
        } else {
          localStorage.removeItem('country');
        }

        let nextStep = authData.next_step;
        if (!nextStep) {
          try {
            const statusRes = await fetchAdminOnboardingStatus();
            nextStep = statusRes.data?.data?.next_step;
          } catch (statusError) {
            console.error('Failed to fetch onboarding status', statusError);
          }
        }

        if (nextStep && nextStep !== 'done') {
          navigate('/onboarding/profile', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      let emailMessage = '';
      let passwordMessage = '';

      if (error instanceof AxiosError) {
        const responsePayload = error.response?.data as ApiErrorPayload | undefined;
        const errorBag = responsePayload?.errors;

        const extractFirst = (value: string[] | string | undefined): string => {
          if (Array.isArray(value)) {
            return value[0] ?? '';
          }
          return value ?? '';
        };

        const rawEmail =
          errorBag && typeof errorBag === 'object'
            ? (errorBag as Record<string, string[] | string>)['email']
            : undefined;
        const rawPassword =
          errorBag && typeof errorBag === 'object'
            ? (errorBag as Record<string, string[] | string>)['password']
            : undefined;

        emailMessage = extractFirst(rawEmail as string[] | string | undefined);
        passwordMessage = extractFirst(rawPassword as string[] | string | undefined);

        if (!emailMessage && responsePayload?.message) {
          emailMessage = responsePayload.message;
        }

        if (emailMessage === 'Please check your email to confirm your account or resend confirmation email.') {
          navigate('/verify-email', { state: { email } });
        }
      } else {
        emailMessage = 'An unexpected error occurred. Please try again.';
      }

      setEmailError(emailMessage);
      setPasswordError(passwordMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
      <div className="w-full max-w-2xl px-6">
        {successMessage && (
          <div
            className="mb-4 rounded-lg border border-green bg-green px-4 py-3 text-white relative"
            role="alert"
          >
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">{successMessage}</span>
            <button
              onClick={() => setSuccessMessage('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-700"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}

        <h2 className="text-5xl font-bold text-white text-center mb-8">
          ZamIO
        </h2>

        {emailError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-3">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {emailError}</span>
          </div>
        )}

        <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-md w-full border border-white/20 shadow-xl">
          <h2 className="text-4xl font-bold text-white text-center mb-8">
            🎧 Admin Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Password Input + Show/Hide */}
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 pr-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white  focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>

            <p className=" text-white mt-6 text-center">
           Forgot your password?{' '}
            <Link
              to="/forgot-password"
              className="underline text-blue-400 hover:text-blue-200"
            >
              Reset
            </Link>
          </p>

            {/* Error Message */}
            {passwordError && (
              <p className="text-sm text-red-400">{passwordError}</p>
            )}

            {/* Submit Button */}
            {loading ? (
              <ButtonLoader />
            ) : (
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-4 rounded-lg mt-6 "
              >
                Login
              </button>
            )}
          </form>

          {/* Link to Register */}
          <p className=" text-white mt-6 text-center">
            Don't have an account?{' '}
            <Link
              to="/sign-up"
              className="underline text-blue-400 hover:text-blue-200"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
