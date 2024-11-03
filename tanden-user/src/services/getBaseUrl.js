import axios from 'axios';

export const API_URL = 'https://w2jostw27rpv3yvwsfcf5jzj2y0mvvfy.lambda-url.ap-south-1.on.aws';
// export const API_URL = 'https://yoga-be-2.vercel.app';
// export const API_URL = 'https://yoga-be.onrender.com';


export const domain = 'https://tanden.vercel.app'
// export const domain = 'http://localhost:5173'

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, 
});

export default api;
