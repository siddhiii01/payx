import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

//this create a custom axios instance with pre configured settings
export const api = axios.create({
    baseURL : API_URL, //every url will start with this url 
    withCredentials: true //this tells browser when making any req please include any cookies
});

// Track refresh state to prevent multiple simultaneous refresh calls
let isRefreshing = false; //are we already getting a new token 
let failedQueue: Array<{
    resolve: (value?: any) => void; //calls when refresh succedds
    reject: (reason?: any) => void; //calls when refreh fails
}> = []; //array that stores waiting request

//Process all queued request after token refresh
const processQueue = (error: any = null) => {
    failedQueue.forEach(promise => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};


//main interceptor -> every response passes through  -> handle 401 erros and auto-refreshes token
api.interceptors.response.use(
    //success response
    (response) => response, 

    //error response - hanlde 401
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/refresh')) {
            
            // If we're already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch(err => Promise.reject(err));
            }


            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('Access token expired, attempting to refresh...');
                
                // Call refresh endpoint -> should match backend
                await api.post("/api/auth/refresh");
                
                console.log('Token refresh successful');
                
                // Process all queued requests
                processQueue();
                isRefreshing = false;
                
                // Retry the original request
                return api(originalRequest);
                
            } catch (refreshError: any) {
                console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
                
                // Process queued requests with error
                processQueue(refreshError);
                isRefreshing = false;
                
                // Clear any stored user data
                localStorage.removeItem('user');
                
                // Only redirect to login if we're not already there
                 if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/signup')) {
                    console.log('Redirecting to login...');
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
);
