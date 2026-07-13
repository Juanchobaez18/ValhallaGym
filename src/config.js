// API base URL configuration
// In development: empty string (Vite proxy handles /api → localhost:5000)
// In production: set VITE_API_URL to your deployed backend URL (e.g. https://valhalla-api.onrender.com)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
