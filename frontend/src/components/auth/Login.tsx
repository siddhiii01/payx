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
        try{
            //console.log("Data: ", data)
            const response = await api.post(`/login`, data);
            console.log("Login successful:", response.data);
            navigate('/dashboard');

        } catch(error: unknown){
            if(axios.isAxiosError(error)){
                console.error("Login Page error: ", error)
                setErrorMsg(error.response?.data || 'Login failed. Try again later');
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
                    <h2 className="text-2xl font-semibold text-center"> 
                        Login with your PayX account
                    </h2>

                    {errorMsg && <p className="text-red-500" >{errorMsg}</p>}

                    {/* Email */}
                    <div className="mb-">
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