import axios from 'axios';
import type { SignupCredentials } from '../types/auth.types';
import { authSchema } from 'shared_schemas';


//sending request to backend
const SignupRoute = async (formData: SignupCredentials) => {
    const validation = authSchema.register.safeParse(formData)

    if(!validation.success){
        console.error("Frontend validation failed:", validation.error.flatten());
        return {
        success: false,
        errors: validation.error.flatten()
        };
    }
    try{
            const response = await axios.post(`${(import.meta as any).env.VITE_API_URL}/signup`, formData);
            console.log("Backend Response: ", response.data);
            

        } catch(error: any){
            console.error("Error while sending to backend", error);
        }
}

export default SignupRoute