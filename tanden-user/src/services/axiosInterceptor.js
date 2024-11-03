import axios from 'axios';
import toast from 'react-hot-toast';

const SetupAxiosInterceptors = () => {
    
    const TOAST_ID = 'global-error-toast';
    const showToast = (message, type = 'error') => {
        toast.dismiss(TOAST_ID); 
        toast[type](message, {
            id: TOAST_ID,
            duration: 3000
        });
    };

    // Response interceptor
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            // console.log(error)
            if (error.response && error.response.data) {
                if (error.response.data.message === 'Token has expired.') {
                    showToast('Your session has expired. Please log in again.');
                    localStorage.removeItem('auth')
                    localStorage.removeItem('currentUser')
                    setTimeout(()=>{
                        window.location.href = '/login';
                    },3000)
                } 
                else if(error.response.data.message === 'Access denied. No token provided.'){
                    showToast('Your session has expired. Please log in again.');
                    localStorage.removeItem('auth')
                    localStorage.removeItem('currentUser')
                    setTimeout(()=>{
                        window.location.href = '/login';
                    },3000)
                }
                else if(error.response.data.message === 'Unauthorized'){
                    showToast('Your session has expired. Please log in again.');
                    localStorage.removeItem('auth')
                    localStorage.removeItem('currentUser')
                    setTimeout(()=>{
                        window.location.href = '/login';
                    },3000)
                }
                // else if(error.response.data.message === 'User not found.'){
                //     showToast('Your session has expired. Please log in again.');
                // }
                else if(error.response.data.message === 'Invalid token.'){
                    showToast('Your session has expired. Please log in again.');
                    localStorage.removeItem('auth')
                    localStorage.removeItem('currentUser')
                    setTimeout(()=>{
                        window.location.href = '/login';
                    },3000)
                }
                else {
                    showToast(error.response.data.message || 'An error occurred');
                }
            }
            return Promise.reject(error);
        }
    );
};

export default SetupAxiosInterceptors;