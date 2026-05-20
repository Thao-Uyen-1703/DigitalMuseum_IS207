import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_APP_URL + "/api",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
        prom.reject(error);
        } else {
        prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url.includes('/auth/refresh')) {
      localStorage.removeItem('access_token');
      window.location.href = "/dang-nhap";
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_APP_URL}/api/auth/refresh`, 
          {}, 
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        localStorage.setItem('access_token', newAccessToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);

      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('access_token');
        window.location.href = "/dang-nhap";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
); 

export default api;