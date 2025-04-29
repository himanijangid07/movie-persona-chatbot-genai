import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // your backend server address
    withCredentials: true, // if you are using cookies or sessions
});

export default axiosInstance;
