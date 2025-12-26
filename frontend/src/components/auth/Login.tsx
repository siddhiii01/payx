import {useForm} from "react-hook-form"
import type { LoginCredentials } from "../../types/auth.types";
import axios from "axios";

export const Login = () => {
    const {register, handleSubmit} = useForm<LoginCredentials>();

    const onSubmit = (data: LoginCredentials) => {
        try{
            const response = axios.post(`${import.meta.env.VITE_API_URL}/login`, {data});
            console.log(response)

        } catch(error){
            console.log("error", error)
        }
        
    }

    return (
       <form onSubmit={handleSubmit(onSubmit)} >
        <h2> Login with your PayX account</h2>
        <input 
            placeholder="Enter Email"
            {...register("email")}
        />
        <input 
            placeholder="Enter PayX Password"
            {...register("password")}
        />
        <button>Sign in</button>

       </form> 
    )
}