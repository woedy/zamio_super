// Allow overriding via Vite env vars; fall back to localhost defaults for dev
export const baseUrl = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:8000/";
export const baseUrlMedia = (import.meta as any)?.env?.VITE_MEDIA_BASE || "http://localhost:8000";
export const baseWsUrl = (import.meta as any)?.env?.VITE_WS_BASE || "ws://localhost:8000/";

//export const baseUrl = "http://92.112.194.239:6161/";
//export const baseUrlMedia = "http://92.112.194.239:6161";
//export const baseWsUrl = "ws://92.112.194.239:6161/";



//export const baseUrl = "http://localhost:5050/";
//export const baseWsUrl = "ws://localhost:5050/";

//export const userToken = localStorage.getItem('token');
export const userToken = localStorage.getItem('token');
export const userID = localStorage.getItem('user_id');
export const publisherID = localStorage.getItem('publisher_id');

export const userEmail = localStorage.getItem('email');
export const username = localStorage.getItem('username');


export const userPhoto = localStorage.getItem('photo');
export const projectID = localStorage.getItem('projectID');
export const project_name = localStorage.getItem('project_name');


export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
