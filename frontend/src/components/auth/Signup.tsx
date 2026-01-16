import {useForm} from "react-hook-form";
import type {JSX} from "react"
import {registerSchema} from "shared_schemas";
import type {  SignupCredentials } from "shared_schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios  from "axios";
import { ShieldCheck, Wallet } from "lucide-react";


export const Signup = (): JSX.Element => {
    const {
        register, //A function that connects an input field to the form system.
        handleSubmit, //Wraps submit function.
        formState: {
            errors, //validation errors, keyed by field name.
            isSubmitting //Boolean value
        }, 
        reset,
    } = useForm<SignupCredentials>({resolver: zodResolver(registerSchema)});//Whenever the form is validated or submitted, validate it using THIS Zod schema.
    // const [submittedData, setSubmittedData] = useState<SignupCredentials | null>(null);
    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<string | boolean>(false);
    const navigate = useNavigate();
  
    //This will ONLY run after form submission, not while typing.
    const onSubmit = async (data:SignupCredentials) => {
        setIsSuccess(false) //clearing the previous error message
        setServerMessage(null); // Clear any previous message
        try{
            
            //HTTP POST request
            //await pauses until server responds
            const response = await api.post(`/signup`,data);
            console.log("Signup successful:", response.data);
            // setSubmittedData(data) //to save it to our state
            // console.log("submitted:", data),


            // Show success message
            setServerMessage("Account created successfully! Redirecting...");
            setIsSuccess(true);
            
            //Small delay so user sees the success message
            setTimeout(() => {
                reset(); // Clear form
                navigate("/dashboard");
            }, 1500); // 1.5 seconds delay

        } catch(error: unknown){
            let errorMessage = "Something went wrong.";
            if(axios.isAxiosError(error)){
                // Trying to extract meaningful message from backend
                const status = error.response?.status;
                const data = error.response?.data as any;

                errorMessage =  data.message || 
                                data.error || 
                                (status === 409 && "Email or phone number already exists.") ||
                                (status === 400 && "Invalid details provided.") 
            } else {
                errorMessage = "Network error. Check your connection.";
            }
            setServerMessage(errorMessage);
            setIsSuccess(false);
            console.error("Signup error:", error);
        }
    }
    return (
    
        <div className="min-h-screen w-full flex font-sans">

            {/* Left Section */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#434ce8] text-white flex-col justify-center px-20">
                <div className="max-w-md space-y-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Wallet size={24} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">PayX</span>
                    </div>

                    <h1 className="text-5xl font-bold leading-tight">Join PayX Today</h1>
                    <p className="text-blue-100 text-lg">
                    Create your free account and start managing your digital wallet in minutes.
                    </p>

                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                        <ShieldCheck size={18} />
                        <span className="text-sm">Secured with JWT Authentication</span>
                    </div>
                </div>
            </div>
            
            {/* right side */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="mt-2 text-gray-500">Sign up to get started with PayX</p>
                    </div>

                    {/* form */}
                    <form 
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5">
                        {/* Server Message: Success or Error */}
                        {serverMessage && (
                            <div
                                className={`text-center p-3 rounded-lg mb-4 text-sm font-medium ${
                                    isSuccess
                                        ? "bg-green-100 text-green-800 border border-green-300"
                                        : "bg-red-100 text-red-800 border border-red-300"
                                }`}
                            >
                                {serverMessage}
                            </div>
                        )}

                        {/* Name Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">
                                Name
                            </label>
                            <input 
                                type="text"
                                placeholder="John Doe"
                                {...register("name")}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#434ce8] outline-none"
                            />
                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>} 
                        </div>
                        
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Email</label> 
                            <input 
                                type="email" 
                                placeholder="you@example.com"
                                {...register("email")}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#434ce8] outline-none"
                            />
                            {errors.email && <p className="text-xs text-red-500" >{errors.email.message}</p>}
                        </div>  
                        
                        {/* PhoneNumber Field */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                            <input 
                                {...register("phoneNumber")}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#434ce8] outline-none"
                            />
                            {errors.phoneNumber && <p className="text-xs text-red-500" >{errors.phoneNumber.message}</p>}                      
                        </div>
                        
                         {/* Password Field */}
                        <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700">Password</label>
                                    <input  
                                        type="password"
                                        {...register("password")}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#434ce8] outline-none"
                                    />
                                    {errors.password && <p className="text-xs text-red-500">{errors.password?.message}</p>}
                        </div>
                        
                        
                        {/* Submit Button */}
                        <button 
                            disabled={isSubmitting}
                            className="w-full bg-[#434ce8] hover:bg-[#373dbd] text-white font-bold py-3 rounded-lg transition-all active:scale-[0.98]"
                        >
                            {isSubmitting ? "Signing up...": "Continue"}
                        </button>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-600 mt-6">
                            Already a user?<span> </span>
                            <Link 
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                            >
                                 Login with your Paytm account
                            </Link>
                        </p>
                    </form>
                </div>
               
            </div>
        </div>
    );
}

