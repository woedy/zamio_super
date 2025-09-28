const DEFAULT_HTTP_BASE = 'http://localhost:8000';

const resolveHttpBase = () => {
  const envBase =
    typeof import.meta !== 'undefined' ? (import.meta as any)?.env?.VITE_API_BASE : undefined;
  if (envBase && typeof envBase === 'string' && envBase.trim()) {
    return envBase.trim().replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return DEFAULT_HTTP_BASE;
};

const httpBase = resolveHttpBase();

export const baseUrl = `${httpBase}/`;
export const baseUrlMedia = httpBase;

const wsScheme = httpBase.startsWith('https://') ? 'wss://' : 'ws://';
const wsHost = httpBase.replace(/^https?:\/\//, '');
export const baseWsUrl = `${wsScheme}${wsHost}/`;

//export const baseUrl = "http://92.112.194.239:6161/";
//export const baseUrlMedia = "http://92.112.194.239:6161";
//export const baseWsUrl = "ws://92.112.194.239:6161/";



//export const baseUrl = "http://localhost:5050/";
//export const baseWsUrl = "ws://localhost:5050/";

//export const userToken = localStorage.getItem('token');
export const userToken = localStorage.getItem('token');
export const userID = localStorage.getItem('user_id');
export const adminID = localStorage.getItem('admin_id');

export const userEmail = localStorage.getItem('email');

export const username = localStorage.getItem('username');
export const firstName = localStorage.getItem('first_name');
export const lastName = localStorage.getItem('last_name');


export const userPhoto = localStorage.getItem('photo');


export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  