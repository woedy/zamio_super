import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from '@zamio/ui-theme';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';

import DefaultLayout from './layout/DefaultLayout';

// Lazy-loaded components
import * as LazyRoutes from './routes/LazyRoutes';

const hiddenOnRoutes = [
  '/',
  '/sign-up',
  '/sign-in',
  '/verify-email',
  '/onboarding/profile',
  '/onboarding/revenue-split',
  '/onboarding/link-artist',
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
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="Publisher Dasboard | ZamIO Publishers" />
              <LazyRoutes.Dashboard />
            </>
          }
        />

        <Route
          path="/all-artists"
          element={
            <>
              <PageTitle title="Publisher Artists | ZamIO Publishers" />
              <AllArtists />
            </>
          }
        />

        <Route
          path="/artist-details"
          element={
            <>
              <PageTitle title="Publisher Artist Details | ZamIO Publishers" />
              <ArtistDetails />
            </>
          }
        />

        <Route
          path="/match-logs"
          element={
            <>
              <PageTitle title="Publisher Artist Match Logs | ZamIO Publishers" />
              <MatchLogViewer />
            </>
          }
        />

        <Route
          path="/artists-contracts"
          element={
            <>
              <PageTitle title="Publisher - Artist Contracts | ZamIO Publishers" />
              <AllArtistsContracts />
            </>
          }
        />

        <Route
          path="/contract-details"
          element={
            <>
              <PageTitle title="Publisher - Contract Details | ZamIO Publishers" />
              <ContractDetails />
            </>
          }
        />

        <Route
          path="/artists-royalties"
          element={
            <>
              <PageTitle title="Publisher - Artist Royalties | ZamIO Publishers" />
              <AllArtistsRoyalties />
            </>
          }
        />
        <Route
          path="/artist-royalties/:artistId"
          element={
            <>
              <PageTitle title="Artist Royalties | ZamIO Publishers" />
              <ArtistRoyaltiesDetail />
            </>
          }
        />

        <Route
          path="/notifications"
          element={
            <>
              <PageTitle title="Publisher - Notifications | ZamIO Publishers" />
              <NotificationCenter />
            </>
          }
        />

        <Route
          path="/help-support"
          element={
            <>
              <PageTitle title="Publisher - Help & Support | ZamIO Publishers" />
              <EducationSupport />
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="Publisher - Profile | ZamIO Publishers" />
              <PublisherProfile />
            </>
          }
        />

        {/* Disputes */}
        <Route
          path="/disputes"
          element={
            <>
              <PageTitle title="Disputes | ZamIO Publishers" />
              <DisputesList />
            </>
          }
        />
        <Route
          path="/dispute-details"
          element={
            <>
              <PageTitle title="Dispute Details | ZamIO Publishers" />
              <DisputeDetails />
            </>
          }
        />

        {/* Contracts */}
        <Route
          path="/add-contract"
          element={
            <>
              <PageTitle title="New Contract | ZamIO Publishers" />
              <AddContract />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <PageTitle title="Settings | ZamIO Publishers" />
              <Settings />
            </>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <>
              <PageTitle title="Edit Profile | ZamIO Publishers" />
              <EditProfile />
            </>
          }
        />
        <Route
          path="/shared-package-test"
          element={
            <>
              <PageTitle title="Shared Package Test | ZamIO Publishers" />
              <SharedPackageTest />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  ) : (
    <>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="Home | ZamIO Publishers" />
              <LazyRoutes.ZamIOLandingPage />
            </>
          }
        />

        <Route
          path="/sign-in"
          element={
            <>
              <PageTitle title="Sign In | ZamIO Publishers" />
              <LazyRoutes.SignIn />
            </>
          }
        />
        <Route
          path="/sign-up"
          element={
            <>
              <PageTitle title="Sign Up | ZamIO Publishers" />
              <LazyRoutes.SignUp />
            </>
          }
        />
        <Route
          path="/verify-email"
          element={
            <>
              <PageTitle title="Verify Email | ZamIO-Publishers" />
              <LazyRoutes.VerifyEmail />
            </>
          }
        />
        <Route
          path="/onboarding/profile"
          element={
            <>
              <PageTitle title="Complete Profile | ZamIO-Publishers" />
              <CompleteProfile />
            </>
          }
        />
        <Route
          path="/onboarding/revenue-split"
          element={
            <>
              <PageTitle title="Complete Revenue Split | ZamIO-Publishers" />
              <RevenueSplit />
            </>
          }
        />
        <Route
          path="/onboarding/link-artist"
          element={
            <>
              <PageTitle title="Complete Link Artist | ZamIO-Publishers" />
              <LinkArtist />
            </>
          }
        />
        <Route
          path="/onboarding/payment"
          element={
            <>
              <PageTitle title="Complete Payment Info | ZamIO-Publishers" />
              <PaymentInfo />
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
