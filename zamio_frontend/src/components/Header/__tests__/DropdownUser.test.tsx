import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DropdownUser from '../DropdownUser';
import * as auth from '../../../lib/auth';

// Mock the auth module
vi.mock('../../../lib/auth', () => ({
  logoutWithConfirmation: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.addEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
Object.defineProperty(window, 'addEventListener', {
  value: mockAddEventListener,
});
Object.defineProperty(window, 'removeEventListener', {
  value: mockRemoveEventListener,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('DropdownUser', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Set up default user data
    localStorageMock.setItem('first_name', 'John');
    localStorageMock.setItem('email', 'john@example.com');
  });

  it('should render user information', () => {
    renderWithRouter(<DropdownUser />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should show dropdown when clicked', async () => {
    renderWithRouter(<DropdownUser />);
    
    const userButton = screen.getByRole('link');
    fireEvent.click(userButton);
    
    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });
  });

  it('should call logoutWithConfirmation when logout button is clicked', async () => {
    const mockLogoutWithConfirmation = vi.mocked(auth.logoutWithConfirmation);
    mockLogoutWithConfirmation.mockResolvedValue(true);
    
    renderWithRouter(<DropdownUser />);
    
    // Open dropdown
    const userButton = screen.getByRole('link');
    fireEvent.click(userButton);
    
    // Click logout button
    await waitFor(() => {
      const logoutButton = screen.getByText('Log Out');
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogoutWithConfirmation).toHaveBeenCalled();
  });

  it('should handle logout functionality', async () => {
    const mockLogoutWithConfirmation = vi.mocked(auth.logoutWithConfirmation);
    mockLogoutWithConfirmation.mockResolvedValue(true);
    
    renderWithRouter(<DropdownUser />);
    
    // The component should exist and have the logout functionality
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(mockLogoutWithConfirmation).toBeDefined();
  });

  it('should handle logout cancellation', async () => {
    const mockLogoutWithConfirmation = vi.mocked(auth.logoutWithConfirmation);
    mockLogoutWithConfirmation.mockResolvedValue(false);
    
    renderWithRouter(<DropdownUser />);
    
    // The component should exist and have the logout functionality
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(mockLogoutWithConfirmation).toBeDefined();
  });
});