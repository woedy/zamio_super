import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

// Static demo does not enforce authentication
const PrivateRoute = ({ children }: { children: ReactNode }) => <>{children}</>;

const PublicRoute = ({ children }: { children: ReactNode }) => <>{children}</>;

// Import onboarding components
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import StationOnboarding from '../pages/Authentication/StationOnboarding';

// Import pages (assuming they exist in pages/)
import ZamIOLandingPage from '../pages/Landing';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import EmailVerification from '../pages/EmailVerification';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Layout from '../components/Layout';

// Import new station pages
import {
  MatchLogs,
  MatchDisputes,
  Profile,
  PlaylogManagement,
  RadioStream,
  AudioStream
} from '../pages/StationPages';

// Import StaffManagement, Compliance, Notifications, and Help from their own files
import StaffManagement from '../pages/StaffManagement';
import Compliance from '../pages/Compliance';
import Notifications from '../pages/Notifications';
import Help from '../pages/Help';

// Import dispute management pages
import DisputeDetails from '../pages/MatchDisputeManagement/DisputeDetails';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <ZamIOLandingPage />
          </PublicRoute>
        } />
        <Route path="/signin" element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        <Route path="/verify-email" element={
          <PublicRoute>
            <EmailVerification />
          </PublicRoute>
        } />
        <Route path="/onboarding" element={
          <PublicRoute>
            <StationOnboarding />
          </PublicRoute>
        } />

        {/* Station Dashboard Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="match-logs" element={<MatchLogs />} />
          <Route path="match-disputes" element={<MatchDisputes />} />
          <Route path="match-dispute-details" element={<DisputeDetails />} />
          <Route path="profile" element={<Profile />} />
          <Route path="staff-management" element={<StaffManagement />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="playlog-management" element={<PlaylogManagement />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="help" element={<Help />} />
          <Route path="radio-stream" element={<RadioStream />} />
          <Route path="audio-stream" element={<AudioStream />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
