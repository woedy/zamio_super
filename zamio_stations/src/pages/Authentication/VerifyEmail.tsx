import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { persistStationId } from '../../lib/auth';
import type { StationOnboardingStep } from '../../contexts/StationOnboardingContext';
import useStationOnboarding from '../../hooks/useStationOnboarding';
import { getOnboardingRoute } from '../../utils/onboarding';
import { EnhancedEmailVerification } from '../../components/verification/EnhancedEmailVerification';

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

  const resolveNextStep = (payload: any): StationOnboardingStep => {
    if (payload?.profile_completed) {
      return 'done';
    }

    const candidate = (payload?.next_step || 'profile') as StationOnboardingStep;
    const allowed: StationOnboardingStep[] = ['profile', 'staff', 'report', 'payment', 'done'];
    return allowed.includes(candidate) ? candidate : 'profile';
  };

  const handleVerificationSuccess = async (payload: any) => {
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
  };

  if (!email) {
    navigate('/sign-up');
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <h2 className="text-5xl font-bold text-white text-center mb-8">
          ZamIO Stations
        </h2>

        <EnhancedEmailVerification
          email={email}
          onVerificationSuccess={handleVerificationSuccess}
          initialMethod="code"
          showMethodSelection={true}
        />
      </div>
    </div>
  );
};

export default VerifyEmail;

