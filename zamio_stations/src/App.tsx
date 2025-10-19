import React from 'react';
import { ThemeProvider } from '@zamio/ui';
import Router from './lib/router';

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
}