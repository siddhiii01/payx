import {useForm} from "react-hook-form";
import type {JSX} from "react"
import {registerSchema} from "shared_schemas";
import type {  SignupCredentials } from "shared_schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios  from "axios";


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
    
        <div className="min-h-screen flex">
            <div 
                className="absolute w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('/authbackgrounf.png')" }}
            >
                <div className="flex items-center justify-center relative z-100 pt-12 mb-10">
                    <form 
                        onSubmit={handleSubmit(onSubmit)}
                        className="bg-white w-full max-w-[420px] rounded-2xl shadow-lg p-6 space-y-1"
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-semibold text-center">
                                Create an Account
                            </h2>
                            
                        </div>
                        
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
                        <div className="mb-4">
                            <div className="flex items-center gap-4">
                                <img src="/src/assets/user.svg" />
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Name
                                    </label>
                                    <input 
                                        
                                        {...register("name")}
                                        className="w-full border-b text-sm border-gray-300 focus:border-blue-500 outline-none py-1"
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                                </div>
                                
                            </div>  
                        </div>
                        
                        {/* Email Field */}
                        <div className="mb-4">
                           <div className="flex items-center gap-4">
                                <img src="/src/assets/user.svg" />
                                <div className="w-full">
                                    <label className=" block text-sm  font-medium text-gray-600">Email</label> 
                                    <input 
                                        
                                        {...register("email")}
                                        className="w-full border-b text-sm border-gray-300 focus:border-blue-500 outline-none py-1"
                                    />
                                    {errors.email && <p className="text-xs text-red-500" >{errors.email.message}</p>}
                                </div>
                                
                            </div>
                        </div>  
                        
                        {/* PhoneNumber Field */}
                        <div className="mb-4">
                            <div className="flex items-center gap-4">
                                <img src="/src/assets/user.svg" />
                                <div className="w-full">
                                    <label className=" block text-sm font-medium text-gray-600">Phone Number</label>
                                    <input 
                                         
                                        {...register("phoneNumber")}
                                        className="w-full border-b text-sm border-gray-300 focus:border-blue-500 outline-none py-1"
                                    />
                                    {errors.phoneNumber && <p className="text-xs text-red-500" >{errors.phoneNumber.message}</p>}
                                </div>
                                
                            </div>
                        </div>
                        
                         {/* Password Field */}
                        <div className="mb-4">
                            <div className="flex items-center gap-4">
                                <img src="/src/assets/password.svg" />
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-600">Password</label>
                                    <input 
                                        
                                        type="password"
                                        {...register("password")}
                                        className="w-full border-b text-sm border-gray-300 focus:border-blue-500 outline-none py-1"
                                    />
                                    {errors.password && <p className="text-xs text-red-500">{errors.password?.message}</p>}
                                </div>
                            </div>
                        </div>
                        
                        
                        {/* Submit Button */}
                        <button 
                            disabled={isSubmitting}
                            className="w-full bg-blue-500 text-white py-3 rounded-full mt-4 hover:bg-blue-600 transition"
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

// Network calls are asynchronous → we must wait.