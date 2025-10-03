import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clearSession, logoutUser, logoutWithConfirmation, getToken, getArtistId } from '../auth';
import api from '../api';

// Mock the api module
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, 'confirm', {
  value: mockConfirm,
  writable: true,
});

// Mock window.location.replace
const mockLocationReplace = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    replace: mockLocationReplace,
  },
  writable: true,
});

// Mock localStorage and sessionStorage
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

const sessionStorageMock = (() => {
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

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

describe('Auth utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    sessionStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(getToken()).toBe('test-token');
    });

    it('should return token from sessionStorage if not in localStorage', () => {
      sessionStorage.setItem('token', 'session-token');
      expect(getToken()).toBe('session-token');
    });

    it('should return empty string if no token found', () => {
      expect(getToken()).toBe('');
    });
  });

  describe('getArtistId', () => {
    it('should return artist_id from localStorage', () => {
      localStorage.setItem('artist_id', '123');
      expect(getArtistId()).toBe('123');
    });

    it('should return empty string if no artist_id found', () => {
      expect(getArtistId()).toBe('');
    });
  });

  describe('clearSession', () => {
    it('should clear all session data from localStorage and sessionStorage', () => {
      // Set up test data
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('artist_id', '123');
      localStorage.setItem('user_id', '456');
      localStorage.setItem('first_name', 'John');
      localStorage.setItem('email', 'john@example.com');
      sessionStorage.setItem('temp_data', 'temp');

      clearSession();

      // Check that localStorage items are removed
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('artist_id')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
      expect(localStorage.getItem('first_name')).toBeNull();
      expect(localStorage.getItem('email')).toBeNull();

      // Check that sessionStorage is cleared
      expect(sessionStorage.getItem('temp_data')).toBeNull();
    });
  });

  describe('logoutUser', () => {
    it('should call logout API and clear session', async () => {
      localStorage.setItem('artist_id', '123');
      vi.mocked(api.post).mockResolvedValue({});

      await logoutUser();

      expect(api.post).toHaveBeenCalledWith('api/accounts/logout/', { artist_id: '123' });
      expect(mockLocationReplace).toHaveBeenCalledWith('/sign-in');
    });

    it('should handle API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(api.post).mockRejectedValue(new Error('API Error'));

      await logoutUser();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to log out user', expect.any(Error));
      expect(mockLocationReplace).toHaveBeenCalledWith('/sign-in');
      
      consoleSpy.mockRestore();
    });

    it('should logout without artist_id if not available', async () => {
      vi.mocked(api.post).mockResolvedValue({});

      await logoutUser();

      expect(api.post).toHaveBeenCalledWith('api/accounts/logout/', {});
      expect(mockLocationReplace).toHaveBeenCalledWith('/sign-in');
    });
  });

  describe('logoutWithConfirmation', () => {
    it('should logout when user confirms', async () => {
      mockConfirm.mockReturnValue(true);
      vi.mocked(api.post).mockResolvedValue({});

      const result = await logoutWithConfirmation();

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to log out?');
      expect(api.post).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not logout when user cancels', async () => {
      mockConfirm.mockReturnValue(false);

      const result = await logoutWithConfirmation();

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to log out?');
      expect(api.post).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});