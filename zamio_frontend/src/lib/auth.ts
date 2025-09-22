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

export const clearSession = () => {
  try {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('artist_id');
    localStorage.removeItem('user_id');
  } catch {}
};

