import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@zamio/ui';
import Layout from './components/Layout';
import router from './lib/router';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router}>
        <Layout />
      </RouterProvider>
    </ThemeProvider>
  );
}