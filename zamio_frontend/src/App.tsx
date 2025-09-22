import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import DefaultLayout from './layout/DefaultLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/Authentication/SignUp';

import ZamIOLandingPage from './pages/Landing/LandingPage';
import SignIn from './pages/Authentication/SignIn';
import VerifyEmail from './pages/Authentication/VerifyEmail';
import ForgotPassword from './pages/Authentication/Password/ForgotPassword';
import ConfirmPasswordOTP from './pages/Authentication/Password/ConfirmPasswordOTP';
import NewPassword from './pages/Authentication/Password/NewPassword';
import ArtistDashboard from './pages/Dashboard/Dashboard';
import SongManager from './pages/MusicUploadManagement/SongManager';
import UploadTrack from './pages/MusicUploadManagement/UploadTrack';
import TractDetails from './pages/MusicUploadManagement/TrackDetails';
import EditTractDetails from './pages/MusicUploadManagement/EditSong';
import CoverUploader from './pages/MusicUploadManagement/UploadCoverArt';
import TrackContributors from './pages/MusicUploadManagement/Contributors';
import AddContributor from './pages/MusicUploadManagement/AddContributors';
import MatchLogViewer from './pages/PlaylogsMatchLog/FullDetectionTable';
import ArtistAnalyticsPage from './pages/PlatformAnalytics/ArtistAnalyticsPage';
import RoyaltyDashboard from './pages/PaymentsOversight/ViewPaymentHistory';
import NotificationCenter from './pages/NotificationCenter/NotificationCenter';
import LegalCompliancePage from './pages/LegalCompliance/LegalComplains';
import EducationSupport from './pages/TechSupport/HelpSupport';
import FeedbackReviewsPage from './pages/FeedbackReview/FeedbackReview';
import ArtistProfilePage from './pages/Profile/ArtistProfile';
import AddAlbum from './pages/MusicUploadManagement/AddAlbum';
import CompleteProfile from './pages/Authentication/Onboarding/CompleteProfile';
import SocialMediaInfo from './pages/Authentication/Onboarding/SocialMediaInfo';
import PaymentInfo from './pages/Authentication/Onboarding/PaymentInfo';
import Publisher from './pages/Authentication/Onboarding/Publisher';
import EnhancedArtistOnboarding from './pages/Authentication/Onboarding/EnhancedArtistOnboarding';
import ComponentShowcase from './components/ComponentShowcase';
import ComponentTest from './components/ComponentTest';
import api from './lib/api';

const hiddenOnRoutes = [
  '/',
  '/sign-up',
  '/verify-email',
  '/sign-in',
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

  return loading ? (
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
              <ArtistDashboard />
            </>
          }
        />

        <Route
          path="/all-artist-songs"
          element={
            <>
              <PageTitle title="Song Manager | ZamIO-Artists" />
              <SongManager />
            </>
          }
        />

 
        <Route
          path="/add-track"
          element={
            <>
              <PageTitle title="Upload | ZamIO-Artists" />
              <UploadTrack />
            </>
          }
        />
 
        <Route
          path="/add-album"
          element={
            <>
              <PageTitle title="Add Album | ZamIO-Artists" />
              <AddAlbum />
            </>
          }
        />

 
        <Route
          path="/track-details"
          element={
            <>
              <PageTitle title="Song Details | ZamIO-Artists" />
              <TractDetails />
            </>
          }
        />
        <Route
          path="/edit-track-details"
          element={
            <>
              <PageTitle title="Edit Song Details | ZamIO-Artists" />
              <EditTractDetails />
            </>
          }
        />
        <Route
          path="/add-track-cover"
          element={
            <>
              <PageTitle title="Add Song Cover | ZamIO-Artists" />
              <CoverUploader />
            </>
          }
        />
        <Route
          path="/track-contributors"
          element={
            <>
              <PageTitle title="Song Contributors | ZamIO-Artists" />
              <TrackContributors />
            </>
          }
        />
        <Route
          path="/add-track-contributor"
          element={
            <>
              <PageTitle title="Add Song Contributor | ZamIO-Artists" />
              <AddContributor />
            </>
          }
        />
        <Route
          path="/match-logs"
          element={
            <>
              <PageTitle title="Add Song Contributor | ZamIO-Artists" />
              <MatchLogViewer />
            </>
          }
        />
        <Route
          path="/analytics"
          element={
            <>
              <PageTitle title="Add Song Contributor | ZamIO-Artists" />
              <ArtistAnalyticsPage />
            </>
          }
        />
        <Route
          path="/royalty-payments"
          element={
            <>
              <PageTitle title="Royalty & Payments | ZamIO-Artists" />
              <RoyaltyDashboard />
            </>
          }
        />
        <Route
          path="/notifications"
          element={
            <>
              <PageTitle title="Notification Center | ZamIO-Artists" />
              <NotificationCenter />
            </>
          }
        />
        <Route
          path="/legal"
          element={
            <>
              <PageTitle title="Legal & Compliance | ZamIO-Artists" />
              <LegalCompliancePage />
            </>
          }
        />
        <Route
          path="/help"
          element={
            <>
              <PageTitle title="Help & Support | ZamIO-Artists" />
              <EducationSupport />
            </>
          }
        />
        <Route
          path="/feedback"
          element={
            <>
              <PageTitle title="Feedback & Compliance | ZamIO-Artists" />
              <FeedbackReviewsPage />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Artist Page | ZamIO-Artists" />
              <ArtistProfilePage />
            </>
          }
        />
        <Route
          path="/components"
          element={
            <>
              <PageTitle title="Component Showcase | ZamIO-Artists" />
              <ComponentShowcase />
            </>
          }
        />
        <Route
          path="/test"
          element={
            <>
              <PageTitle title="Component Test | ZamIO-Artists" />
              <ComponentTest />
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
              <ZamIOLandingPage />
            </>
          }
        />

        <Route
          path="/sign-in"
          element={
            <>
              <PageTitle title="Sign In | ZamIO-Artists" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/sign-up"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO-Artists" />
              <SignUp />
            </>
          }
        />
        <Route
          path="/verify-email"
          element={
            <>
              <PageTitle title="Verify Email | ZamIO-Artists" />
              <VerifyEmail />
            </>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <>
              <PageTitle title="Complete Profile | ZamIO-Artists" />
              <CompleteProfile />
            </>
          }
        />
        <Route
          path="/onboarding/social-media"
          element={
            <>
              <PageTitle title="Update Social Media | ZamIO-Artists" />
              <SocialMediaInfo />
            </>
          }
        />
        <Route
          path="/onboarding/payment"
          element={
            <>
              <PageTitle title="Update Social Media | ZamIO-Artists" />
              <PaymentInfo />
            </>
          }
        />
        <Route
          path="/onboarding/publisher"
          element={
            <>
              <PageTitle title="Add publisher | ZamIO-Artists" />
              <Publisher />
            </>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <>
              <PageTitle title="Forgot Password | ZamIO-Artists" />
              <ForgotPassword />
            </>
          }
        />
        <Route
          path="/confirm-password-otp"
          element={
            <>
              <PageTitle title="Confirm Password OTP | ZamIO-Artists" />
              <ConfirmPasswordOTP />
            </>
          }
        />
        <Route
          path="/new-password-reset"
          element={
            <>
              <PageTitle title="New Password Reset | ZamIO-Artists" />
              <NewPassword />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
