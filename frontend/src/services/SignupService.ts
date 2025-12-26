// import axios from 'axios';
// import type { SignupCredentials } from '../types/auth.types';
// import { authSchema } from 'shared_schemas';


// //sending request to backend
// //this route should either return valid data or throw on fialure 
// const SignupRoute = async (formData: SignupCredentials) => {
//     const validation = authSchema.register.safeParse(formData)
//     if(!validation.success){
//         // console.error("Frontend validation failed:", validation.error.flatten());
//         throw {
//             type: "VALIDATION_ERROR",
//             errors: validation.error.flatten()
//         }
//     }
//     try{
//             const response = await axios.post(`${(import.meta as any).env.VITE_API_URL}/signup`, formData);
//             console.log("Backend Response: ", response.data);
//             return response.data // on backend req success this will go to ths SIgnupForm handle function
//         } catch(error: any){
//             //if the backend req fails -> it must throw something
//             // console.error("Error while sending to backend", error);
//             throw {
//                 type: "SERVER_ERROR",
//                 message: "Unable to reach the server"
//             };
//         }
// }

// export default SignupRoute;