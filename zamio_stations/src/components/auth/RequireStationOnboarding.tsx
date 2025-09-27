import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../../common/Loader';
import { getToken } from '../../lib/auth';
import useStationOnboarding from '../../hooks/useStationOnboarding';
import { getOnboardingRoute, isOnboardingRoute } from '../../utils/onboarding';
import { toast } from 'react-toastify';

const RequireStationOnboarding: React.FC = () => {
  const token = getToken();
  const location = useLocation();
  const { status, loading, error } = useStationOnboarding();

  // Debug logging
  useEffect(() => {
    console.log('RequireStationOnboarding - Debug Info:', {
      hasToken: !!token,
      loading,
      status,
      error,
      currentPath: location.pathname
    });

    if (error) {
      console.error('Error in onboarding status check:', error);
      toast.error('Error loading station status. Please try again.');
    }
  }, [token, loading, status, error, location.pathname]);

  if (!token) {
    console.log('No token found, redirecting to sign-in');
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (loading && !status) {
    console.log('Loading station status...');
    return <Loader />;
  }

  const nextStep = status?.next_recommended_step || status?.onboarding_step;
  const needsOnboarding = nextStep && nextStep !== 'done';
  const currentPath = location.pathname;

  console.log('Onboarding status:', {
    nextStep,
    needsOnboarding,
    currentPath,
    isOnboardingRoute: isOnboardingRoute(currentPath)
  });

  if (needsOnboarding && !isOnboardingRoute(currentPath)) {
    const onboardingRoute = getOnboardingRoute(nextStep);
    console.log('Redirecting to onboarding:', onboardingRoute);
    return <Navigate to={onboardingRoute} replace />;
  }

  if (!needsOnboarding && isOnboardingRoute(currentPath)) {
    console.log('Onboarding complete, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Rendering child routes');
  return <Outlet />;
};

export default RequireStationOnboarding;
