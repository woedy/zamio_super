import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import { ToastProvider } from './components/ui';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import { StationOnboardingProvider } from './contexts/StationOnboardingContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider position="top-right">
        <Router>
          <StationOnboardingProvider>
            <App />
          </StationOnboardingProvider>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
