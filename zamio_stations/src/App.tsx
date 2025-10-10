import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from '@zamio/ui-theme';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import DefaultLayout from './layout/DefaultLayout';
import RequireStationOnboarding from './components/auth/RequireStationOnboarding';

// Lazy-loaded components
import * as LazyRoutes from './routes/LazyRoutes';

const hiddenOnRoutes = [
  '/',
  '/sign-up',
  '/sign-in',
  '/verify-email',
  '/onboarding/profile',
  '/onboarding/staff',
  '/onboarding/payment',
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
  
  // Debug logging
  console.log('Current path:', location.pathname);
  console.log('Should use default layout:', shouldUseDefaultLayout);
  console.log('Loading state:', loading);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        {loading ? (
          <Loader />
        ) : shouldUseDefaultLayout ? (
    <DefaultLayout hiddenOnRoutes={hiddenOnRoutes}>
      <Routes>
        <Route path="/dashboard" element={
          <>
            <PageTitle title="Station Dashboard | ZamIO Stations" />
            <LazyRoutes.StationDashboard2 />
          </>
        } />
        
        <Route element={<RequireStationOnboarding />}>
          <Route
            path="/match-logs"
            element={
              <>
                <PageTitle title="Match Log | ZamIO Stations" />
                <MatchLogViewer />
              </>
            }
          />
          <Route
            path="/match-disputes"
            element={
              <>
                <PageTitle title="All Match Disputes | ZamIO Stations" />
                <AllDisputeMatches />
              </>
            }
          />
          <Route
            path="/match-dispute-details"
            element={
              <>
                <PageTitle title="Dispute Details | ZamIO Stations" />
                <DisputeDetails />
              </>
            }
          />
          <Route
            path="/profile"
            element={
              <>
                <PageTitle title="Station Profile | ZamIO Stations" />
                <StationProfilePage />
              </>
            }
          />
          <Route
            path="/staff-management"
            element={
              <>
                <PageTitle title="Staff Management | ZamIO Stations" />
                <StationStaffManagement />
              </>
            }
          />
          <Route
            path="/compliance"
            element={
              <>
                <PageTitle title="Station Compliance | ZamIO Stations" />
                <StationCompliance />
              </>
            }
          />
          <Route
            path="/playlog-management"
            element={
              <>
                <PageTitle title="Playlog Management | ZamIO Stations" />
                <PlaylogManagement />
              </>
            }
          />
          <Route
            path="/notifications"
            element={
              <>
                <PageTitle title="Notification Center | ZamIO Stations" />
                <NotificationCenter />
              </>
            }
          />
          <Route
            path="/help"
            element={
              <>
                <PageTitle title="Education & Support | ZamIO Stations" />
                <EducationSupport />
              </>
            }
          />
          <Route
            path="/radio-stream"
            element={
              <>
                <PageTitle title="Radio Stream | ZamIO Stations" />
                <RadioStreamMonitor />
              </>
            }
          />
          <Route
            path="/audio-stream"
            element={
              <>
                <PageTitle title="Audio Stream | ZamIO Stations" />
                <AudioFileMatcher />
              </>
            }
          />
          <Route
            path="/shared-package-test"
            element={
              <>
                <PageTitle title="Shared Package Test | ZamIO Stations" />
                <SharedPackageTest />
              </>
            }
          />
          <Route
            path="/complaints"
            element={
              <>
                <PageTitle title="Complaint Management | ZamIO Stations" />
                <ComplaintsList />
              </>
            }
          />
          <Route
            path="/complaints/create"
            element={
              <>
                <PageTitle title="Create Complaint | ZamIO Stations" />
                <CreateComplaint />
              </>
            }
          />
          <Route
            path="/complaints/:id"
            element={
              <>
                <PageTitle title="Complaint Details | ZamIO Stations" />
                <ComplaintDetails />
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <PageTitle title="Settings | ZamIO Stations" />
                <Settings />
              </>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <>
                <PageTitle title="Edit Profile | ZamIO Stations" />
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
              <PageTitle title="Home | ZamIO Stations" />
              <LazyRoutes.ZamIOLandingPage />
            </>
          }
        />

        <Route
          path="/sign-in"
          element={
            <>
              <PageTitle title="Sign In | ZamIO Stations" />
              <LazyRoutes.SignIn />
            </>
          }
        />
        <Route
          path="/sign-up"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO Stations" />
              <LazyRoutes.SignUp />
            </>
          }
        />
        <Route
          path="/verify-email"
          element={
            <>
              <PageTitle title="Verify Email | ZamIO-station" />
              <LazyRoutes.VerifyEmail />
            </>
          }
        />
        <Route element={<RequireStationOnboarding />}>
          <Route
            path="/onboarding/profile"
            element={
              <>
                <PageTitle title="Complete Profile | ZamIO-Station" />
                <CompleteProfile />
              </>
            }
          />
          <Route
            path="/onboarding/staff"
            element={
              <>
                <PageTitle title="Complete Add Staff | ZamIO-Station" />
                <AddStaff />
              </>
            }
          />
          <Route
            path="/onboarding/payment"
            element={
              <>
                <PageTitle title="Complete Payment | ZamIO-Station" />
                <PaymentInfo />
              </>
            }
          />
        </Route>
      </Routes>
    </>
  )}
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
