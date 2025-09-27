const env = (import.meta as any)?.env ?? {};

const ensureTrailingSlash = (value: string): string => {
  if (!value) {
    return '/';
  }
  return value.endsWith('/') ? value : `${value}/`;
};

const resolveApiBase = (): string => {
  const candidate =
    env.VITE_API_BASE ||
    env.VITE_API_URL ||
    env.VITE_BACKEND_URL ||
    '';

  if (candidate) {
    return ensureTrailingSlash(candidate);
  }

  if (typeof window !== 'undefined') {
    return ensureTrailingSlash(window.location.origin);
  }

  return 'http://localhost:8000/';
};

const resolveMediaBase = (apiBase: string): string => {
  if (!apiBase) {
    return '';
  }
  return apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
};

const resolveWsBase = (apiBase: string): string => {
  const wsCandidate = env.VITE_WS_BASE || env.VITE_WS_URL || '';
  if (wsCandidate) {
    return ensureTrailingSlash(wsCandidate);
  }

  if (apiBase.startsWith('http')) {
    return ensureTrailingSlash(apiBase.replace(/^http/, 'ws'));
  }

  if (typeof window !== 'undefined') {
    const { protocol, host } = window.location;
    const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    return ensureTrailingSlash(`${wsProtocol}//${host}`);
  }

  return 'ws://localhost:8000/';
};

export const baseUrl = resolveApiBase();
export const baseUrlMedia = resolveMediaBase(baseUrl);
export const baseWsUrl = resolveWsBase(baseUrl);

const readStorageItem = (key: string): string | null => {
  try {
    const fromLocal = localStorage.getItem(key);
    if (fromLocal) {
      return fromLocal;
    }
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export const userToken = readStorageItem('token');
export const userID = readStorageItem('user_id');
export const stationID = readStorageItem('station_id');

export const userEmail = readStorageItem('email');
export const username = readStorageItem('username');

export const userPhoto = readStorageItem('photo');
export const projectID = readStorageItem('projectID');
export const project_name = readStorageItem('project_name');

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};