import axios from 'axios';

// const BASE_URL = 'http://35.232.150.232/api';
// const BASE_URL = 'http://localhost:8000/api';
const BASE_URL = 'http://web-production-d5b0.up.railway.app/api';

export default axios.create({
    baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: {'Content-Type': 'application/json'},
    withCredentials: true
});