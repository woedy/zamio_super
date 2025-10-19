import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Demo verification - only accept "1234" as valid code
  const DEMO_VALID_CODE = '1234';

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...verificationCode];
    newCode[index] = value;

    setVerificationCode(newCode);
    setVerificationStatus('idle');
    setErrorMessage('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);

    if (/^\d{4}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);

      // Focus the last input
      setTimeout(() => {
        inputRefs.current[3]?.focus();
      }, 0);
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');

    if (code.length !== 4) {
      setErrorMessage('Please enter all 4 digits');
      setVerificationStatus('error');
      return;
    }

    setIsVerifying(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (code === DEMO_VALID_CODE) {
      setVerificationStatus('success');
      // Redirect to onboarding after successful verification
      setTimeout(() => {
        navigate('/onboarding');
      }, 1500);
    } else {
      setErrorMessage('Invalid verification code. Try 1234 for demo.');
      setVerificationStatus('error');
    }

    setIsVerifying(false);
  };

  const handleResendCode = () => {
    // In a real app, this would trigger a new email
    console.log('Resending verification code...');
    setVerificationCode(['', '', '', '']);
    setVerificationStatus('idle');
    setErrorMessage('');
    inputRefs.current[0]?.focus();
  };

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-black" />
      <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-2xl" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-4">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
              <TrendingUp className="h-6 w-6" />
            </span>
            <span className="text-2xl font-semibold tracking-tight">Zamio</span>
          </Link>
          <h2 className="text-3xl font-semibold">Verify your email</h2>
          <p className="mt-2 text-slate-400">Enter the 4-digit code sent to your email</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
          {/* Verification Code Input */}
          <div className="mb-6">
            <div className="flex justify-center gap-3 mb-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-14 h-14 text-center text-2xl font-semibold rounded-lg border bg-slate-800/50 text-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                    verificationStatus === 'error' ? 'border-red-400' : 'border-white/20'
                  }`}
                  disabled={isVerifying}
                />
              ))}
            </div>

            {verificationStatus === 'error' && (
              <div className="flex items-center justify-center text-red-400 text-sm mb-4">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errorMessage}
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="flex items-center justify-center text-green-400 text-sm mb-4">
                <CheckCircle className="h-4 w-4 mr-2" />
                Email verified successfully! Redirecting to onboarding...
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={isVerifying || verificationCode.join('').length !== 4}
              className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          {/* Demo Note */}
          <div className="text-center mb-6">
            <p className="text-sm text-slate-400">
              <span className="text-indigo-400 font-semibold">Demo:</span> Use code <span className="font-mono bg-slate-800 px-2 py-1 rounded">1234</span>
            </p>
          </div>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendCode}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
                disabled={isVerifying}
              >
                Resend code
              </button>
            </p>
          </div>

          {/* Back to Sign Up */}
          <div className="text-center mt-6">
            <Link
              to="/signup"
              className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>By verifying your email, you agree to our{' '}
            <Link to="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
