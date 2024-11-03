import axios from 'axios';

export const API_URL = 'http://localhost:5000';
// export const API_URL = 'https://yoga-be-2.vercel.app';
// export const API_URL = 'https://yoga-be.onrender.com';


export const domain = 'https://tanden.vercel.app'
// export const domain = 'http://localhost:5173'

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, 
});

export default api;
