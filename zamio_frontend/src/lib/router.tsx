import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

// Static demo does not enforce authentication
const PrivateRoute = ({ children }: { children: ReactNode }) => <>{children}</>;

const PublicRoute = ({ children }: { children: ReactNode }) => <>{children}</>;

// Import pages (assuming they exist in pages/)
import Landing from '../pages/Landing';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import EmailVerification from '../pages/EmailVerification';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';

// Import new pages
import MatchLogs from '../pages/MatchLogs';
import Analytics from '../pages/Analytics';
import RoyaltyPayments from '../pages/RoyaltyPayments';
import Notifications from '../pages/Notifications';
import Settings from '../pages/Settings';
import AddTrack from '../pages/AddTrack';
import UploadManagement from '../pages/UploadManagement';
import AlbumList from '../pages/AlbumList';
import AlbumDetails from '../pages/AlbumDetails';

import {
  Profile,
  Legal,
  Feedback,
  Help,
  Schedule,
  Collaborations,
  AllArtistSongs,
  TrackDetailsPage
} from '../pages/Pages';

// Import layout and onboarding components
import Layout from '../components/Layout';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import ArtistOnboarding from '../pages/Authentication/ArtistOnboarding';

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
        <ArtistOnboarding />
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
        path: 'match-logs',
        element: <MatchLogs />
      },
      {
        path: 'all-artist-songs',
        element: <AllArtistSongs />
      },
      {
        path: 'analytics',
        element: <Analytics />
      },
      {
        path: 'royalty-payments',
        element: <RoyaltyPayments />
      },
      {
        path: 'notifications',
        element: <Notifications />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'legal',
        element: <Legal />
      },
      {
        path: 'feedback',
        element: <Feedback />
      },
      {
        path: 'help',
        element: <Help />
      },
      {
        path: 'schedule',
        element: <Schedule />
      },
      {
        path: 'collaborations',
        element: <Collaborations />
      },
      {
        path: 'track-details',
        element: <TrackDetailsPage />
      },
      {
        path: 'add-track',
        element: <AddTrack />
      },
      {
        path: 'upload-management',
        element: <UploadManagement />
      },
      {
        path: 'album-list',
        element: <AlbumList />
      },
      {
        path: 'album-details',
        element: <AlbumDetails />
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
