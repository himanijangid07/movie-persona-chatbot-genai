import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // your backend server address
    withCredentials: true, // if you are using cookies or sessions
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('userId');
        localStorage.removeItem('token'); // if you're using a token
        alert('Session expired. Please log in again.');
        window.location.href = '/login'; // your login route
      }
      return Promise.reject(error);
    }
  );

export default axiosInstance;
