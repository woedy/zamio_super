import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

// Static demo does not enforce authentication
const PrivateRoute = ({ children }: { children: ReactNode }) => <>{children}</>;

const PublicRoute = ({ children }: { children: ReactNode }) => <>{children}</>;

// Import pages (assuming they exist in pages/)
import Landing from '../pages/Landing';
import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import UserManagement from '../pages/UserManagement';
import UserDetail from '../pages/UserDetail';
import AddUser from '../pages/AddUser';
import Partners from '../pages/Partners';
import PartnerDetail from '../pages/PartnerDetail';
import Agreements from '../pages/Agreements';
import Disputes from '../pages/Disputes';
import DisputeDetail from '../pages/DisputeDetail';
import DisputesAnalytics from '../pages/DisputesAnalytics';
import PlayLogs from '../pages/PlayLogs';
import NotFound from '../pages/NotFound';

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
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    path: '/partners',
    element: (
      <PrivateRoute>
        <Partners />
      </PrivateRoute>
    ),
  },
  {
    path: '/agreements',
    element: (
      <PrivateRoute>
        <Agreements />
      </PrivateRoute>
    ),
  },
  {
    path: '/disputes',
    element: (
      <PrivateRoute>
        <Disputes />
      </PrivateRoute>
    ),
  },
  {
    path: '/disputes/analytics',
    element: (
      <PrivateRoute>
        <DisputesAnalytics />
      </PrivateRoute>
    ),
  },
  {
    path: '/disputes/:id',
    element: (
      <PrivateRoute>
        <DisputeDetail />
      </PrivateRoute>
    ),
  },
  {
    path: '/playlogs',
    element: (
      <PrivateRoute>
        <PlayLogs />
      </PrivateRoute>
    ),
  },
  {
    path: '/partners/:type/:id',
    element: (
      <PrivateRoute>
        <PartnerDetail />
      </PrivateRoute>
    ),
  },
  {
    path: '/user-management',
    element: (
      <PrivateRoute>
        <UserManagement />
      </PrivateRoute>
    ),
  },
  {
    path: '/user-management/add',
    element: (
      <PrivateRoute>
        <AddUser />
      </PrivateRoute>
    ),
  },
  {
    path: '/user-management/:id',
    element: (
      <PrivateRoute>
        <UserDetail />
      </PrivateRoute>
    ),
  },
  // Catch-all route for 404 errors - must be last
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
