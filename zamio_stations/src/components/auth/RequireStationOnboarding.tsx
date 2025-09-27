import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../../common/Loader';
import { getToken } from '../../lib/auth';
import useStationOnboarding from '../../hooks/useStationOnboarding';
import { getOnboardingRoute, isOnboardingRoute } from '../../utils/onboarding';

const RequireStationOnboarding: React.FC = () => {
  const token = getToken();
  const location = useLocation();
  const { status, loading } = useStationOnboarding();

  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  if (loading && !status) {
    return <Loader />;
  }

  const nextStep = status?.next_recommended_step || status?.onboarding_step;
  const needsOnboarding = nextStep && nextStep !== 'done';
  const currentPath = location.pathname;

  if (needsOnboarding && !isOnboardingRoute(currentPath)) {
    return <Navigate to={getOnboardingRoute(nextStep)} replace />;
  }

  if (!needsOnboarding && isOnboardingRoute(currentPath)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RequireStationOnboarding;
