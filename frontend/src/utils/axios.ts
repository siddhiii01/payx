import axios from 'axios';


//custom Axios instance with a preconfigured base URL so every request 
// made with api automatically points to  backend
export const api = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
    withCredentials: true //allow browser to attach cookies with req
    
});

api.interceptors.response.use(
    (reponse) => reponse, 
    async (error) => {
        //accessing the original request -> this tells what was the error about
        const originalRequest = error.config

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            try {
                console.log('Attempting to refresh token...');
                
                
                // Call refresh endpoint
                await api.post("/refresh"); // This will set new accessToken cookie
                console.log('Refresh success');
                // Retry the original request
                return api(originalRequest);
            } catch(refreshError){
                // Refresh failed → logout user
                console.error("Refresh failed:", refreshError);
                // Redirect to login or clear auth state
                window.location.href = "/login";
                return Promise.reject(refreshError)
            }
            
        }
        return Promise.reject(error);
    }
);








//Idea : I have Access & Refresh Token
//Acess token are short lived -> only for 15min
//Refresh token are long-live

//Now the problem is : On every 15 min i have to create a new access token
//I have created in the backend how to create a new access token using refresh token on /refresh-token endpoint
//Now instead of make the user re-logging -> as soon as the 
//Access token expires → backend returns 401 Unauthorized

//So the Goal here is : 
//If token expired silently refresh it and retry the request

//Now this I have create it globally so that at every response it it: 
    //-> It must run automatically
    //-> It must run after every response
//and this can be done by : Axios response interceptors