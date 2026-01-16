import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "shared_schemas";
import { api } from "../../utils/axios";
import { Link, useNavigate } from 'react-router-dom';
import { useState, type JSX } from "react";
import axios from "axios";


export const Login = (): JSX.Element => {
    const {
        register, 
        handleSubmit,
        formState: {isSubmitting, errors}
    } = useForm<LoginCredentials>({resolver: zodResolver(loginSchema)});

    const [errorMsg, setErrorMsg] = useState<string |null>("");
    const navigate = useNavigate();

    const onSubmit = async (data: LoginCredentials) => {
        setErrorMsg(null);
        try{
            //console.log("Data: ", data)
            const response = await api.post(`/login`, data);
            console.log("Login successful:");
            navigate('/dashboard');

        } catch(error: unknown){
            let message = "Something went wrong. Please try again.";
            if(axios.isAxiosError(error)){

                //Network error sever unreachable
                if(!error.response){
                    message = "Cannot reach server. Check your internet connection.";
                } else {
                    const status = error.response.status;
                    const data = error.response.data;

                    //using backend messages if available
                    message = data.message || data.error || message;
                    // Fallback messages based on status code
                    if (status === 401) {
                        message = data?.message || "Invalid Crendentials.";
                    } else if (status === 400) {
                        message = data?.message || "Please check your input.";
                    } else if (status === 500) {
                        message = "Server error. Please try again later.";
                    } else {
                        // Non-Axios error (unexpected)
                        message = "An unexpected error occurred.";
                        console.error("Unexpected error:", error);
                    }
                    console.error("Login Page error: ", error)
                } 
                
                setErrorMsg(message);
            } 
        }
    }

    return (
        <div className="min-h-screen flex">
            <div
                className="absolute w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('/authbackgrounf.png')" }}
            >
            <div className="flex items-center justify-center relative z-100 pt-24">
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white w-full max-w-[420px] rounded-2xl shadow-lg p-6 space-y-1">
                    <h2 className="text-2xl font-semibold text-center mb-4"> 
                        Login with your PayX account
                    </h2>

                    {errorMsg && <p className="text-red-500" >{errorMsg}</p>}

                    {/* Email */}
                    <div className="mb-4">
                        <div className="flex items-center gap-4">
                            <img src="/src/assets/user.svg" />
                            <div className="w-full">
                                <label className="block font-medium text-sm text-gray-600">Email</label>
                                <input 
                                    {...register("email")}
                                    className="w-full border-b text-sm border-gray-300 focus:border-blue-500 outline-none py-1"
                                />
                                {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <div className="flex items-center gap-4">
                            <img src="/src/assets/password.svg" />
                            <div className="w-full">
                                <label className="block font-medium text-sm text-gray-600">Password</label>
                                <input 
                                    type="password"
                                    {...register("password")}
                                    className="w-full border-b text-sm border-gray-300 focus:border-blue-500 outline-none py-1"
                                />
                                {errors.password && <p className="text-red-500" >{errors.password.message}</p>}
                            </div>
                        </div>
                    </div>
                                

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 text-white py-3 rounded-full mt-4 hover:bg-blue-600 transition"
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="text-center text-sm mt-2 text-gray-500">
                        New to Paytm? 
                        <Link 
                            to="/signup"
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                            >
                                <span> </span>
                                Create an Account
                        </Link>
                    </p>
                </form>
            </div> 
        </div>
    </div>
    )
}