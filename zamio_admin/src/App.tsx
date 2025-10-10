import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from '@zamio/ui-theme';
import { Toaster } from 'react-hot-toast';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import DefaultLayout from './layout/DefaultLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded components
import * as LazyRoutes from './routes/LazyRoutes';

const hiddenOnRoutes = [
  '/',
  '/sign-up',
  '/verify-email',
  '/sign-in',
  '/onboarding/profile',
  '/forgot-password',
  '/new-password-reset',
  '/confirm-password-otp',
  '/audio-match',
];

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Determine if the current route should skip the layout
  const shouldUseDefaultLayout = !hiddenOnRoutes.includes(location.pathname);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
        {loading ? (
          <Loader />
        ) : shouldUseDefaultLayout ? (
    <DefaultLayout hiddenOnRoutes={hiddenOnRoutes}>
      <Routes>
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="Admin Dasboard | ZamIO-Admin" />
              <LazyRoutes.Dashboard />
            </>
          }
        />

        <Route
          path="/all-artists"
          element={
            <>
              <PageTitle title="All Artist | Admin | ZamIO-Admin" />
              <LazyRoutes.AllArtistsPage />
            </>
          }
        />
        <Route
          path="/artist-details"
          element={
            <>
              <PageTitle title="Artist Details | Admin | ZamIO-Admin" />
              <LazyRoutes.ArtistDetails />
            </>
          }
        />
        <Route
          path="/add-artist"
          element={
            <>
              <PageTitle title="Add Artist | Admin | ZamIO-Admin" />
              <LazyRoutes.AddArtist />
            </>
          }
        />

        <Route
          path="/all-stations"
          element={
            <>
              <PageTitle title="All Stations | Admin | ZamIO-Admin" />
              <AllStationsPage />
            </>
          }
        />
        <Route
          path="/station-details"
          element={
            <>
              <PageTitle title="Station Details | Admin | ZamIO-Admin" />
              <StationDetails />
            </>
          }
        />
        <Route
          path="/all-publishers"
          element={
            <>
              <PageTitle title="All Publishers | Admin | ZamIO-Admin" />
              <AllPublishersPage />
            </>
          }
        />
        <Route
          path="/publisher-details"
          element={
            <>
              <PageTitle title="Publisher Details | Admin | ZamIO-Admin" />
              <PublisherDetails />
            </>
          }
        />

        <Route
          path="/all-artist-tracks"
          element={
            <>
              <PageTitle title="All Artist Tracks | Admin | ZamIO-Admin" />
              <ArtistTracksView />
            </>
          }
        />
        <Route
          path="/track-details"
          element={
            <>
              <PageTitle title="Track Details | Admin | ZamIO-Admin" />
              <AdminTrackDetails />
            </>
          }
        />
        <Route
          path="/all-fans"
          element={
            <>
              <PageTitle title="All Fans | Admin | ZamIO-Admin" />
              <AllFansPage />
            </>
          }
        />

        <Route
          path="/uploads"
          element={
            <>
              <PageTitle title="Upload | Admin | ZamIO-Admin" />
              <UploadTrack />
            </>
          }
        />
        <Route
          path="/disputes"
          element={
            <>
              <PageTitle title="Dispute Resolution Panel | ZamIO-Admin" />
              <DisputesList />
            </>
          }
        />
        <Route
          path="/disputes/:id"
          element={
            <>
              <PageTitle title="Dispute Details | ZamIO-Admin" />
              <DisputeDetails />
            </>
          }
        />
        <Route
          path="/royalties"
          element={
            <>
              <PageTitle title="Royalty & Payments Oversight | ZamIO-Admin" />
              <RoyaltiesList />
            </>
          }
        />
        <Route
          path="/partners"
          element={
            <>
              <PageTitle title="International Partners | ZamIO-Admin" />
              <PartnersList />
            </>
          }
        />
        <Route
          path="/partners/:id"
          element={
            <>
              <PageTitle title="Partner Detail | ZamIO-Admin" />
              <PartnerDetail />
            </>
          }
        />
        <Route
          path="/partner-ops"
          element={
            <>
              <PageTitle title="International Partners Ops | ZamIO-Admin" />
              <PartnerOpsWizard />
            </>
          }
        />
        <Route
          path="/royalties/:artist_id"
          element={
            <>
              <PageTitle title="Artist Royalty Details | ZamIO-Admin" />
              <ArtistRoyaltyDetails />
            </>
          }
        />
        <Route
          path="/analytics"
          element={
            <>
              <PageTitle title="Platform Analytics | ZamIO-Admin" />
              <PlatformAnalytics />
            </>
          }
        />
        <Route
          path="/user-management"
          element={
            <>
              <PageTitle title="User Management | ZamIO-Admin" />
              <UserManagementDashboard />
            </>
          }
        />
        <Route
          path="/staff-management"
          element={
            <>
              <PageTitle title="Staff Management | ZamIO-Admin" />
              <StaffManagementDashboard />
            </>
          }
        />
        <Route
          path="/kyc-review"
          element={
            <>
              <PageTitle title="KYC Review Dashboard | ZamIO-Admin" />
              <KycReviewDashboard />
            </>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <>
              <PageTitle title="Audit Logs | ZamIO-Admin" />
              <AuditLogViewer />
            </>
          }
        />
        <Route
          path="/system-health"
          element={
            <>
              <PageTitle title="System Health Dashboard | ZamIO-Admin" />
              <SystemHealthDashboard />
            </>
          }
        />
        <Route
          path="/royalty-management"
          element={
            <>
              <PageTitle title="Royalty Management | ZamIO-Admin" />
              <RoyaltyManagementDashboard />
            </>
          }
        />
        <Route
          path="/financial-oversight"
          element={
            <>
              <PageTitle title="Financial Oversight | ZamIO-Admin" />
              <FinancialOversightDashboard />
            </>
          }
        />
        <Route
          path="/shared-package-test"
          element={
            <>
              <PageTitle title="Shared Package Test | ZamIO-Admin" />
              <SharedPackageTest />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | ZamIO-Admin" />
              <Settings />
            </>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <>
              <PageTitle title="Edit Profile | ZamIO-Admin" />
              <EditProfile />
            </>
          }
        />
        </Route>
      </Routes>
    </DefaultLayout>
  ) : (
    <>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="Home | ZamIO-Admin" />
              <LazyRoutes.ZamIOLandingPage />
            </>
          }
        />

        <Route
          path="/audio-match"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO-Admin" />
              <LazyRoutes.AudioMatch />
            </>
          }
        />

        <Route
          path="/sign-in"
          element={
            <>
              <PageTitle title="Sign In | ZamIO-Admin" />
              <LazyRoutes.SignIn />
            </>
          }
        />
        <Route
          path="/sign-up"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO-Admin" />
              <LazyRoutes.SignUp />
            </>
          }
        />
        <Route
          path="/verify-email"
          element={
            <>
              <PageTitle title="Verify Email | ZamIO-Admin" />
              <LazyRoutes.VerifyEmail />
            </>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <>
              <PageTitle title="Complete Profile | ZamIO-Admin" />
              <LazyRoutes.AdminCompleteProfile />
            </>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <>
              <PageTitle title="Forgot Password | ZamIO-Admin" />
              <ForgotPassword />
            </>
          }
        />
        <Route
          path="/confirm-password-otp"
          element={
            <>
              <PageTitle title="Confirm Password OTP | ZamIO-Admin" />
              <ConfirmPasswordOTP />
            </>
          }
        />
        <Route
          path="/new-password-reset"
          element={
            <>
              <PageTitle title="New Password Reset | ZamIO-Admin" />
              <NewPassword />
            </>
          }
        />
      </Routes>
    </>
  )}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
