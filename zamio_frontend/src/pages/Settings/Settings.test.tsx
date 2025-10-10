import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Settings from './Settings';
import { ThemeProvider } from '../../contexts/ThemeContext';
import api from '../../lib/api';

// Mock the API
vi.mock('../../lib/api');
const mockedApi = vi.mocked(api);

// Mock the hooks
vi.mock('../../hooks/useApiErrorHandler', () => ({
  useApiErrorHandler: () => ({
    handleApiError: vi.fn(),
    showSuccessMessage: vi.fn(),
  }),
}));

vi.mock('../../hooks/useFormWithValidation', () => ({
  useFormWithValidation: () => ({
    values: {
      email: 'test@example.com',
      phone: '+1234567890',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    setValue: vi.fn(),
    setFieldTouched: vi.fn(),
    handleSubmit: vi.fn(),
    hasFieldErrors: vi.fn(() => false),
    getFieldErrors: vi.fn(() => []),
    isSubmitting: false,
  }),
}));

const mockUserProfile = {
  data: {
    success: true,
    data: {
      email: 'test@example.com',
      phone: '+1234567890',
      first_name: 'Test',
      last_name: 'User',
    },
  },
};

const mockUserPreferences = {
  data: {
    success: true,
    data: {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      marketing_emails: false,
      royalty_alerts: true,
      match_notifications: true,
      weekly_reports: true,
      sound_notifications: true,
      privacy_profile_public: false,
      privacy_show_earnings: false,
      privacy_show_plays: true,
      theme_preference: 'system',
      language: 'en',
      timezone: 'UTC',
    },
  },
};

const renderSettings = () => {
  return render(
    <ThemeProvider>
      <Settings />
    </ThemeProvider>
  );
};

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.get.mockImplementation((url) => {
      if (url === '/api/accounts/profile/') {
        return Promise.resolve(mockUserProfile);
      }
      if (url === '/api/accounts/user-preferences/') {
        return Promise.resolve(mockUserPreferences);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('renders settings page with all tabs', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Check all tabs are present
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('loads user profile and preferences on mount', async () => {
    renderSettings();

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith('/api/accounts/profile/');
      expect(mockedApi.get).toHaveBeenCalledWith('/api/accounts/user-preferences/');
    });
  });

  it('switches between tabs correctly', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Account Information')).toBeInTheDocument();
    });

    // Click on Notifications tab
    fireEvent.click(screen.getByText('Notifications'));
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();

    // Click on Privacy tab
    fireEvent.click(screen.getByText('Privacy'));
    expect(screen.getByText('Profile Privacy')).toBeInTheDocument();

    // Click on Appearance tab
    fireEvent.click(screen.getByText('Appearance'));
    expect(screen.getByText('Appearance Settings')).toBeInTheDocument();
  });

  it('displays theme options in appearance tab', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click on Appearance tab
    fireEvent.click(screen.getByText('Appearance'));

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('displays notification settings in notifications tab', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click on Notifications tab
    fireEvent.click(screen.getByText('Notifications'));

    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
  });

  it('displays privacy settings in privacy tab', async () => {
    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    // Click on Privacy tab
    fireEvent.click(screen.getByText('Privacy'));

    expect(screen.getByText('Profile Privacy')).toBeInTheDocument();
    expect(screen.getByText('Public profile')).toBeInTheDocument();
    expect(screen.getByText('Show earnings')).toBeInTheDocument();
    expect(screen.getByText('Show play counts')).toBeInTheDocument();
  });
});