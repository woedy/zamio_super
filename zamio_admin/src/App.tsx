import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import DefaultLayout from './layout/DefaultLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SignUp from './pages/Authentication/SignUp';
import AudioMatch from './pages/Project/AudioMatch';
import ArtistDetails from './pages/Admin/Artists/ArtistDetails';
import AddArtist from './pages/Admin/Artists/AddArtist';
import UploadTrack from './pages/Admin/Artists/UploadTrack';
import ZamIOLandingPage from './pages/Landing/LandingPage';
import SignIn from './pages/Authentication/SignIn';
import VerifyEmail from './pages/Authentication/VerifyEmail';
import ForgotPassword from './pages/Authentication/Password/ForgotPassword';
import ConfirmPasswordOTP from './pages/Authentication/Password/ConfirmPasswordOTP';
import NewPassword from './pages/Authentication/Password/NewPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import AllArtistsPage from './pages/ArtistManagement/AllArtistsPge';
import AllStationsPage from './pages/StationManagement/AllStationsPage';
import StationDetails from './pages/Admin/Stations/StationDetails';
import AllPublishersPage from './pages/PublisherManagement/AllPublishersPage';
import PublisherDetails from './pages/Admin/Publishers/PublisherDetails';
import ArtistTracksView from './pages/Song&DetectionManagement/SongManager';
import AdminTrackDetails from './pages/Song&DetectionManagement/TrackDetails';
import AllFansPage from './pages/FanManagement/AllFansPage';
import AdminCompleteProfile from './pages/Authentication/Onboarding/AdminCompleteProfile';
import DisputesList from './pages/Disputes/DisputesList';
import DisputeDetails from './pages/Disputes/DisputeDetails';
import RoyaltiesList from './pages/Royalties/RoyaltiesList';
import ArtistRoyaltyDetails from './pages/Royalties/ArtistRoyaltyDetails';
import PlatformAnalytics from './pages/PlatformAnalytics/PlatformAnalytics';
import PartnersList from './pages/Partners/PartnersList';
import PartnerDetail from './pages/Partners/PartnerDetail';
import PartnerOps from './pages/Royalties/PartnerOps';
import PartnerOpsWizard from './pages/Royalties/PartnerOpsWizard';
import UserManagementDashboard from './pages/Admin/UserManagement/UserManagementDashboard';
import KycReviewDashboard from './pages/Admin/UserManagement/KycReviewDashboard';
import AuditLogViewer from './pages/Admin/UserManagement/AuditLogViewer';
import SystemHealthDashboard from './pages/Admin/SystemHealth/SystemHealthDashboard';
import RoyaltyManagementDashboard from './pages/Admin/RoyaltyManagement/RoyaltyManagementDashboard';
import FinancialOversightDashboard from './pages/Admin/RoyaltyManagement/FinancialOversightDashboard';
import SharedPackageTest from './pages/SharedPackageTest';

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
              <PageTitle title="Admin Dasboard | ZamIO-Admin" />
              <Dashboard />
            </>
          }
        />

        <Route
          path="/all-artists"
          element={
            <>
              <PageTitle title="All Artist | Admin | ZamIO-Admin" />
              <AllArtistsPage />
            </>
          }
        />
        <Route
          path="/artist-details"
          element={
            <>
              <PageTitle title="Artist Details | Admin | ZamIO-Admin" />
              <ArtistDetails />
            </>
          }
        />
        <Route
          path="/add-artist"
          element={
            <>
              <PageTitle title="Add Artist | Admin | ZamIO-Admin" />
              <AddArtist />
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
              <ZamIOLandingPage />
            </>
          }
        />

        <Route
          path="/audio-match"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO-Admin" />
              <AudioMatch />
            </>
          }
        />

        <Route
          path="/sign-in"
          element={
            <>
              <PageTitle title="Sign In | ZamIO-Admin" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/sign-up"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO-Admin" />
              <SignUp />
            </>
          }
        />
        <Route
          path="/verify-email"
          element={
            <>
              <PageTitle title="Verify Email | ZamIO-Admin" />
              <VerifyEmail />
            </>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <>
              <PageTitle title="Complete Profile | ZamIO-Admin" />
              <AdminCompleteProfile />
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
  );
}

export default App;
