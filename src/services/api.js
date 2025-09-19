import axios from 'axios';

// The baseURL will be dynamic based on the environment.
const API_URL = process.env.REACT_APP_API_URL || 'https://eduvoult-back.onrender.com';

const API = axios.create({ baseURL: `${API_URL}/api/v1` });

// This interceptor adds the user's token to every request if they are logged in.
API.interceptors.request.use((req) => {
  if (localStorage.getItem('user')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('user')).token}`;
  }
  return req;
});

// --- Auth routes ---
export const registerUser = (formData) => API.post('/auth/register', formData);
export const loginUser = (formData) => API.post('/auth/login', formData);

// --- User profile routes ---
export const updateUserProfile = (formData) => API.put('/users/profile', formData);
export const getMyUploads = () => API.get('/users/my-uploads');
export const saveUpload = (uploadId) => API.post(`/users/save/${uploadId}`);
export const unsaveUpload = (uploadId) => API.delete(`/users/save/${uploadId}`);
export const getSavedUploads = () => API.get('/users/saved');

// --- Upload routes ---
export const getUploads = () => API.get('/uploads');
export const createUpload = (formData) => API.post('/uploads', formData);
export const getUploadById = (id) => API.get(`/uploads/${id}`);
export const updateUpload = (id, updatedData) => API.put(`/uploads/${id}`, updatedData);
export const deleteUpload = (id) => API.delete(`/uploads/${id}`);
export const trackDownload = (uploadId) => API.post(`/uploads/${uploadId}/download`);

// --- Idea routes ---
export const getIdeas = () => API.get('/ideas');
export const createIdea = (ideaData) => API.post('/ideas', ideaData);
export const updateIdea = (id, ideaData) => API.put(`/ideas/${id}`, ideaData);
export const deleteIdea = (id) => API.delete(`/ideas/${id}`);

export default API;
