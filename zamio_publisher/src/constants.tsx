// Allow overriding via Vite env vars; fall back to localhost defaults for dev
export const baseUrl = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:8000/";
export const baseUrlMedia = (import.meta as any)?.env?.VITE_MEDIA_BASE || "http://localhost:8000";
export const baseWsUrl = (import.meta as any)?.env?.VITE_WS_BASE || "ws://localhost:8000/";

//export const baseUrl = "http://92.112.194.239:6161/";
//export const baseUrlMedia = "http://92.112.194.239:6161";
//export const baseWsUrl = "ws://92.112.194.239:6161/";



//export const baseUrl = "http://localhost:5050/";
//export const baseWsUrl = "ws://localhost:5050/";

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
