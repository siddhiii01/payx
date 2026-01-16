import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "shared_schemas";
import { api } from "../../utils/axios";
import { Link, useNavigate } from 'react-router-dom';
import { useState, type JSX } from "react";
import axios from "axios";
import { ShieldCheckIcon, Wallet2Icon, WalletIcon } from "lucide-react";


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
        <div className="min-h-screen w-full flex font-sans">
            {/* left section */}
            <div className="hidden md:flex md:w-1/2 bg-blue-700 text-white flex-col justify-center px-12 lg:px-24">
                <div className="space-y-6 max-w-md">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <WalletIcon className="w-8 h-8"/>
                        </div>
                        <span className="text-2xl font-bold italic">PayX</span>
                        
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-blue-100 text-lg">
                        Access your wallet and manage your transactions securely.
                    </p>

                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                        <ShieldCheckIcon className="w-5 h-5"></ShieldCheckIcon>
                        <span className="text-sm">Secured with JWT Authentication</span>
                    </div>
                </div>
            </div>

            {/* right section */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Login to PayX</h2>
                        <p className="mt-2 text-gray-600">Enter your credentials to access your wallet</p>
                    </div>

                    {/* form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"   >
                        {errorMsg && <p className="text-red-500" >{errorMsg}</p>}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <input 
                                placeholder="you@example.com"
                                {...register("email")}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                            {errors.email && <p className="text-red-500">{errors.email.message}</p>}   
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <input 
                                    type="password"
                                    {...register("password")}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                {errors.password && <p className="text-red-500" >{errors.password.message}</p>}
                            </div>
                        </div>
                                

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="text-center text-sm mt-2 text-gray-500">
                        New to PayX? 
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