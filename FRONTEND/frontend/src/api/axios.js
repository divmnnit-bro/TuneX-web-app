import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Don't try to refresh if the refresh-token call itself failed
    if (original?.url?.includes('/users/refresh-access-token')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await api.post('/users/refresh-access-token');
        return api(original);
      } catch {
        // refresh failed too — user needs to log in again
      }
    }
    return Promise.reject(error);
  }
);

export default api;