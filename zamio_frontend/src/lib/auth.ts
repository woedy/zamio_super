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
];

export const clearSession = () => {
  try {
    LOCAL_SESSION_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
    sessionStorage.removeItem('token');
  } catch {}
};

export const logoutArtist = async () => {
  const artistId = getArtistId();

  try {
    const payload = artistId ? { artist_id: artistId } : {};
    await api.post('api/accounts/logout-artist/', payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to log out artist', error);
  } finally {
    clearSession();

    if (typeof window !== 'undefined') {
      window.location.replace('/sign-in');
    }
  }
};

