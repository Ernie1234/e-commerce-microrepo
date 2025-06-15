import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  // Only redirect if not already on the login page to prevent infinite loops
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const subscribeTokenRefresh = (listener: () => void) => {
  refreshSubscribers.push(listener);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((listener) => listener());
  refreshSubscribers = [];
};

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if it's an unauthorized error (e.g., 401) and not already a retry
    // You might want to refine this check based on your API's error structure
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a token refresh is already in progress, queue the original request
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true; // Mark the original request for retry
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await api.post(
          '/auth/api/v1/refresh-token-user',
          {},
          {
            withCredentials: true,
          }
        );

        isRefreshing = false;
        onRefreshSuccess(); // Notify all queued requests to retry
        return api(originalRequest); // Retry the original request with the new token
      } catch (refreshError) {
        // If refresh fails, clear subscribers and log out
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(refreshError); // Reject with the refresh error
      }
    }
    // For all other errors, or if it's a 401 but already retried, just reject
    return Promise.reject(error);
  }
);

export default api;
