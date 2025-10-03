import api from './api';

export const getToken = (): string => {
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  } catch {
    return '';
  }
};

export const getAdminId = (): string => {
  try {
    return localStorage.getItem('admin_id') || '';
  } catch {
    return '';
  }
};

const LOCAL_SESSION_KEYS = [
  'token',
  'admin_id',
  'user_id',
  'first_name',
  'last_name',
  'email',
  'photo',
  'username',
  'role',
  'permissions',
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
  const adminId = getAdminId();

  try {
    const payload = adminId ? { admin_id: adminId } : {};
    await api.post('api/accounts/logout/', payload);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to log out admin user', error);
  } finally {
    clearSession();

    if (typeof window !== 'undefined') {
      window.location.replace('/sign-in');
    }
  }
};

export const logoutWithConfirmation = async (): Promise<boolean> => {
  const confirmed = window.confirm('Are you sure you want to log out?');
  
  if (confirmed) {
    await logoutUser();
    return true;
  }
  
  return false;
};

// Keep backward compatibility
export const logoutAdmin = logoutUser;