import api from './api';

export const getToken = (): string => {
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  } catch {
    return '';
  }
};

export const getArtistId = (): string => {
  try {
    return localStorage.getItem('artist_id') || '';
  } catch {
    return '';
  }
};

const LOCAL_SESSION_KEYS = [
  'token',
  'artist_id',
  'user_id',
  'first_name',
  'last_name',
  'email',
  'photo',
  'username',
  'theme',
  'preferences',
];

export const clearSession = () => {
  try {
    // Clear localStorage
    LOCAL_SESSION_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage completely
    sessionStorage.clear();
    
    // Clear any cached data or temporary storage
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

export const logoutUser = async () => {
  const artistId = getArtistId();

  try {
    const payload = artistId ? { artist_id: artistId } : {};
    await api.post('api/accounts/logout/', payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to log out user', error);
  } finally {
    clearSession();

    if (typeof window !== 'undefined') {
      window.location.replace('/sign-in');
    }
  }
};

// Keep the old function for backward compatibility
export const logoutArtist = logoutUser;

export const logoutWithConfirmation = async (): Promise<boolean> => {
  const confirmed = window.confirm('Are you sure you want to log out?');
  
  if (confirmed) {
    await logoutUser();
    return true;
  }
  
  return false;
};

