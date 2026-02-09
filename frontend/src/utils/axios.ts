import axios from 'axios';
//custom Axios instance with a preconfigured base URL so every request 
// made with api automatically points to backend

const API_URL = "https://payx-backend.onrender.com";
console.log("🌐 Axios Base URL:", API_URL); // Add this line
export const api = axios.create({
    baseURL : API_URL,
    withCredentials: true //allow browser to attach cookies with req
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

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

api.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            
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
                console.log('🔄 Access token expired, attempting to refresh...');
                
                // Call refresh endpoint - IMPORTANT: matches your backend route
                await api.post("/refresh");
                
                console.log('✅ Token refresh successful');
                
                // Process queued requests
                processQueue();
                isRefreshing = false;
                
                // Retry the original request
                return api(originalRequest);
                
            } catch (refreshError: any) {
                console.error("❌ Token refresh failed:", refreshError);
                
                // Process queued requests with error
                processQueue(refreshError);
                isRefreshing = false;
                
                // Clear any auth state
                localStorage.removeItem('user');
                
                // Only redirect to login if we're not already there
                if (!window.location.pathname.includes('/login')) {
                    console.log('🚪 Redirecting to login...');
                    window.location.href = "/login";
                }
                
                return Promise.reject(refreshError);
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
);

// Optional: Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);