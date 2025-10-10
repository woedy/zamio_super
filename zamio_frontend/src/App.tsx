import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from '@zamio/ui-theme';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import DefaultLayout from './layout/DefaultLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded components
import * as LazyRoutes from './routes/LazyRoutes';
import api from './lib/api';

const hiddenOnRoutes = [
  '/',
  '/sign-up',
  '/verify-email',
  '/sign-in',
  '/onboarding',
  '/onboarding/profile',
  '/onboarding/social-media',
  '/onboarding/payment',
  '/onboarding/publisher',
  '/onboarding/enhanced',
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

  // Bootstrap session: validate token and hydrate artist_id on load
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;
    // If artist_id is missing, fetch profile
    const currentArtist = localStorage.getItem('artist_id');
    if (currentArtist) return;
    api
      .get('api/profile/me')
      .then((res) => {
        const me = res.data;
        if (me?.artist_id) {
          localStorage.setItem('artist_id', me.artist_id);
        }
      })
      .catch(() => {
        // 401 is handled globally; ignore here
      });
  }, []);

  // Determine if the current route should skip the layout
  const shouldUseDefaultLayout = !hiddenOnRoutes.includes(location.pathname);

  return (
    <ErrorBoundary>
      <ThemeProvider>
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
              <PageTitle title="Artist Dasboard | ZamIO-Artists" />
              <LazyRoutes.ArtistDashboard />
            </>
          }
        />

        <Route
          path="/all-artist-songs"
          element={
            <>
              <PageTitle title="Song Manager | ZamIO-Artists" />
              <LazyRoutes.SongManager />
            </>
          }
        />

 
        <Route
          path="/add-track"
          element={
            <>
              <PageTitle title="Upload | ZamIO-Artists" />
              <LazyRoutes.UploadTrack />
            </>
          }
        />

        <Route
          path="/upload-track-v2"
          element={
            <>
              <PageTitle title="Non-Blocking Upload | ZamIO-Artists" />
              <LazyRoutes.NonBlockingUploadTrack />
            </>
          }
        />
 
        <Route
          path="/add-album"
          element={
            <>
              <PageTitle title="Add Album | ZamIO-Artists" />
              <LazyRoutes.AddAlbum />
            </>
          }
        />

        <Route
          path="/edit-album"
          element={
            <>
              <PageTitle title="Edit Album | ZamIO-Artists" />
              <LazyRoutes.EditAlbum />
            </>
          }
        />

 
        <Route
          path="/track-details"
          element={
            <>
              <PageTitle title="Song Details | ZamIO-Artists" />
              <LazyRoutes.TractDetails />
            </>
          }
        />
        <Route
          path="/edit-track-details"
          element={
            <>
              <PageTitle title="Edit Song Details | ZamIO-Artists" />
              <LazyRoutes.EditTractDetails />
            </>
          }
        />
        <Route
          path="/add-track-cover"
          element={
            <>
              <PageTitle title="Add Song Cover | ZamIO-Artists" />
              <LazyRoutes.CoverUploader />
            </>
          }
        />
        <Route
          path="/track-contributors"
          element={
            <>
              <PageTitle title="Song Contributors | ZamIO-Artists" />
              <LazyRoutes.TrackContributors />
            </>
          }
        />
        <Route
          path="/add-track-contributor"
          element={
            <>
              <PageTitle title="Add Song Contributor | ZamIO-Artists" />
              <LazyRoutes.AddContributor />
            </>
          }
        />
        <Route
          path="/match-logs"
          element={
            <>
              <PageTitle title="Add Song Contributor | ZamIO-Artists" />
              <LazyRoutes.MatchLogViewer />
            </>
          }
        />
        <Route
          path="/analytics"
          element={
            <>
              <PageTitle title="Add Song Contributor | ZamIO-Artists" />
              <LazyRoutes.ArtistAnalyticsPage />
            </>
          }
        />
        <Route
          path="/royalty-payments"
          element={
            <>
              <PageTitle title="Royalty & Payments | ZamIO-Artists" />
              <LazyRoutes.RoyaltyDashboard />
            </>
          }
        />
        <Route
          path="/notifications"
          element={
            <>
              <PageTitle title="Notification Center | ZamIO-Artists" />
              <LazyRoutes.NotificationCenter />
            </>
          }
        />
        <Route
          path="/legal"
          element={
            <>
              <PageTitle title="Legal & Compliance | ZamIO-Artists" />
              <LazyRoutes.LegalCompliancePage />
            </>
          }
        />
        <Route
          path="/help"
          element={
            <>
              <PageTitle title="Help & Support | ZamIO-Artists" />
              <LazyRoutes.EducationSupport />
            </>
          }
        />
        <Route
          path="/feedback"
          element={
            <>
              <PageTitle title="Feedback & Compliance | ZamIO-Artists" />
              <LazyRoutes.FeedbackReviewsPage />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Artist Page | ZamIO-Artists" />
              <LazyRoutes.ArtistProfilePage />
            </>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <>
              <PageTitle title="Edit Profile | ZamIO-Artists" />
              <LazyRoutes.EditProfile />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | ZamIO-Artists" />
              <LazyRoutes.Settings />
            </>
          }
        />
        <Route
          path="/components"
          element={
            <>
              <PageTitle title="Component Showcase | ZamIO-Artists" />
              <LazyRoutes.ComponentShowcase />
            </>
          }
        />
        <Route
          path="/test"
          element={
            <>
              <PageTitle title="Component Test | ZamIO-Artists" />
              <LazyRoutes.ComponentTest />
            </>
          }
        />
        <Route
          path="/shared-package-test"
          element={
            <>
              <PageTitle title="Shared Package Test | ZamIO-Artists" />
              <LazyRoutes.SharedPackageTest />
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
              <PageTitle title="Home | ZamIO-Artists" />
              <LazyRoutes.ZamIOLandingPage />
            </>
          }
        />

        <Route
          path="/sign-in"
          element={
            <>
              <PageTitle title="Sign In | ZamIO-Artists" />
              <LazyRoutes.SignIn />
            </>
          }
        />
        <Route
          path="/sign-up"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO-Artists" />
              <LazyRoutes.SignUp />
            </>
          }
        />
        <Route
          path="/verify-email"
          element={
            <>
              <PageTitle title="Verify Email | ZamIO-Artists" />
              <LazyRoutes.VerifyEmail />
            </>
          }
        />
        <Route
          path="/onboarding"
          element={
            <>
              <PageTitle title="Artist Onboarding | ZamIO-Artists" />
              <LazyRoutes.EnhancedArtistOnboarding />
            </>
          }
        />
        <Route
          path="/onboarding/enhanced"
          element={<Navigate to="/onboarding" replace />}
        />
        <Route
          path="/onboarding/profile"
          element={<Navigate to="/onboarding?step=profile" replace />}
        />
        <Route
          path="/onboarding/social-media"
          element={<Navigate to="/onboarding?step=social-media" replace />}
        />
        <Route
          path="/onboarding/payment"
          element={<Navigate to="/onboarding?step=payment" replace />}
        />
        <Route
          path="/onboarding/publisher"
          element={<Navigate to="/onboarding?step=publisher" replace />}
        />
        <Route
          path="/forgot-password"
          element={
            <>
              <PageTitle title="Forgot Password | ZamIO-Artists" />
              <LazyRoutes.ForgotPassword />
            </>
          }
        />
        <Route
          path="/confirm-password-otp"
          element={
            <>
              <PageTitle title="Confirm Password OTP | ZamIO-Artists" />
              <LazyRoutes.ConfirmPasswordOTP />
            </>
          }
        />
        <Route
          path="/new-password-reset"
          element={
            <>
              <PageTitle title="New Password Reset | ZamIO-Artists" />
              <LazyRoutes.NewPassword />
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
