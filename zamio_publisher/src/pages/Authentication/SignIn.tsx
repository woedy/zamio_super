import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { baseUrl } from '../../constants';
import api from '../../lib/api';
import ButtonLoader from '../../common/button_loader';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fcm_token, setFcmtoken] = useState('sddfdsfdsfsdf');
  const [showPassword, setShowPassword] = useState(false);

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



  const handleSubmit = async (e) => {
    e.preventDefault();
  
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
  
    const url = 'api/accounts/login-publisher/';
    const data = { email, password, fcm_token };
  
    setLoading(true);
  
    try {
      const response = await api.post(url, data);
      if (response.status === 200) {
        const user = response.data.data;
  
        // Save to localStorage
        localStorage.setItem('first_name', user.first_name);
        localStorage.setItem('last_name', user.last_name);
        // Provide a username value for header display
        try {
          const compositeName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
          const uname = user.username || compositeName;
          if (uname) localStorage.setItem('username', uname);
        } catch (_) {
          // no-op
        }
        localStorage.setItem('user_id', user.user_id);
        localStorage.setItem('publisher_id', user.publisher_id);
        localStorage.setItem('email', user.email);
        localStorage.setItem('photo', user.photo);
        localStorage.setItem('token', user.token);
  
        // Redirect based on onboarding step
        const onboardingStep = user.onboarding_step;
  
        switch (onboardingStep) {
          case 'profile':
            navigate('/onboarding/profile');
            break;
          case 'revenue-split':
            navigate('/onboarding/revenue-split');
            break;
          case 'payment':
            navigate('/onboarding/payment');
            break;
          case 'link-artist':
            navigate('/onboarding/link-artist');
            break;
          case 'done':
          default:
            navigate('/dashboard');
            window.location.reload();

        }
  
      } else if (response.status === 400) {
        const responseData = response.data;
        setEmailError(responseData.errors?.email?.[0] || '');
        setPasswordError(responseData.errors?.password?.[0] || '');
  
        // Email not verified case
        if (responseData.errors?.email?.[0] === "Please check your email to confirm your account or resend confirmation email.") {
          navigate('/verify-email', { state: { email } });
  
        // Profile incomplete fallback (rare case if onboarding_step isn't returned)
        } else if (responseData.errors?.profile?.[0] === "Please complete your profile.") {
          localStorage.setItem('token', responseData.errors?.token);
          navigate('/onboarding/profile');
        }
  
      } else {
        console.error('Login failed:', response.data?.message);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Login failed';
      const errs = error?.response?.data?.errors;
      if (errs) {
        setEmailError(errs?.email?.[0] || '');
        setPasswordError(errs?.password?.[0] || '');
      } else {
        setEmailError(msg);
      }
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
            🎧 Publisher Login
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
                  <EyeSlashIcon className="w-6 h-6" />
                ) : (
                  <EyeIcon className="w-6 h-6" />
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
