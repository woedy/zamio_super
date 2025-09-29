const ensureTrailingSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`);

const resolveDefaultApiBase = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return ensureTrailingSlash(window.location.origin);
  }
  return 'http://localhost:8000/';
};

const envApiBase = ((import.meta as any)?.env?.VITE_API_BASE ?? '').toString().trim();
const resolvedApiBase = envApiBase ? ensureTrailingSlash(envApiBase) : resolveDefaultApiBase();

// Allow overriding via Vite env vars; fall back to same-origin (or localhost for SSR)
export const baseUrl = resolvedApiBase;

const envMediaBase = ((import.meta as any)?.env?.VITE_MEDIA_BASE ?? '').toString().trim();
export const baseUrlMedia = envMediaBase || baseUrl.replace(/\/$/, '');

const envWsBase = ((import.meta as any)?.env?.VITE_WS_BASE ?? '').toString().trim();
const resolvedWsBase = envWsBase
  ? ensureTrailingSlash(envWsBase)
  : (() => {
      const defaultWsScheme = baseUrl.startsWith('https://') ? 'wss://' : 'ws://';
      const defaultWsHost = baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return `${defaultWsScheme}${defaultWsHost}/`;
    })();
export const baseWsUrl = resolvedWsBase;

const getStoredValue = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getUserToken = () => getStoredValue('token');
export const getUserId = () => getStoredValue('user_id');
export const getPublisherId = () => getStoredValue('publisher_id');

export const getUserEmail = () => getStoredValue('email');
export const getUsername = () => getStoredValue('username');


export const getUserPhoto = () => getStoredValue('photo');
export const getProjectId = () => getStoredValue('projectID');
export const getProjectName = () => getStoredValue('project_name');


export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
