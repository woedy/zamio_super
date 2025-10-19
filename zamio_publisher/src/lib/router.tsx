import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

// Placeholder for auth check (to be implemented in later tasks)
const isAuthenticated = () => {
  // For demo purposes, allow dashboard access after onboarding
  // In production, this should check for valid authentication token/session
  return true;
};

// Private Route Component
const PrivateRoute = ({ children }: { children: ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/signin" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: ReactNode }) => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

// Import pages (assuming they exist in pages/)
import Landing from '../pages/Landing';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import EmailVerification from '../pages/EmailVerification';
import PublisherOnboarding from '../pages/Authentication/PublisherOnboarding';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';

// Import new publisher pages
import {
  ArtistsManagement,
  CatalogManagement,
  RoyaltiesPayments,
  ReportsAnalytics,
  ContractsLegal,
  ProfileSettings,
  Support,
  PlayLogs,
  PaymentProcessing
} from '../pages/PublisherPages';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PublicRoute>
        <Landing />
      </PublicRoute>
    ),
  },
  {
    path: '/signin',
    element: (
      <PublicRoute>
        <SignIn />
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <SignUp />
      </PublicRoute>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <PublicRoute>
        <EmailVerification />
      </PublicRoute>
    ),
  },
  {
    path: '/onboarding',
    element: (
      <PublicRoute>
        <PublisherOnboarding />
      </PublicRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'artists',
        element: <ArtistsManagement />
      },
      {
        path: 'catalog',
        element: <CatalogManagement />
      },
      {
        path: 'royalties',
        element: <RoyaltiesPayments />
      },
      {
        path: 'royalties/process-payments',
        element: <PaymentProcessing />
      },
      {
        path: 'reports',
        element: <ReportsAnalytics />
      },
      {
        path: 'playlogs',
        element: <PlayLogs />
      },
      {
        path: 'contracts',
        element: <ContractsLegal />
      },
      {
        path: 'profile',
        element: <ProfileSettings />
      },
      {
        path: 'support',
        element: <Support />
      }
    ]
  },
  // Catch-all route for 404 errors - must be last
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
