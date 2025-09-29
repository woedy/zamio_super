import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './css/style.css';
import './css/satoshi.css';
import { ToastProvider } from './components/ui';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import { StationOnboardingProvider } from './contexts/StationOnboardingContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastProvider position="top-right">
      <Router>
        <StationOnboardingProvider>
          <App />
        </StationOnboardingProvider>
      </Router>
    </ToastProvider>
  </React.StrictMode>,
);
