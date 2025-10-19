import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@zamio/ui';
import router from './lib/router';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}