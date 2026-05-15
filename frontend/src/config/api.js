// API base URL — uses environment variable in production, localhost in development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE;
