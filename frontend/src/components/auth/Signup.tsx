import {useForm} from "react-hook-form";
import type React from "react"
import {registerSchema} from "shared_schemas";
import type {  SignupCredentials } from "shared_schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios  from "axios";



export const Signup: React.FC = () => {
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
    const navigate = useNavigate();
  
   const [errorMsg, setErrorMsg] = useState<string | null>('');
    //This will ONLY run after form submission, not while typing.
    const onSubmit = async (data:SignupCredentials) => {
        setErrorMsg('') //clearing the previous error message
        try{
            //HTTP POST request
            //await pauses until server responds
            const response = await api.post(
                `/signup`,
                data, //request body -> Axios Json payload sending back to the backend -> it is an object
                //data is not JS object it is a Json string 
                //{withCredentials: true} // VERY IMPORTANT! Allows cookies to be sent/received
                
            );
            console.log("server response:", response.data);
            // setSubmittedData(data) //to save it to our state
            // console.log("submitted:", data),
            reset(); // this clears all inputs
            navigate('/dashboard');

        } catch(error: unknown){
            if(axios.isAxiosError(error)){
                console.log(error.response?.data);
                setErrorMsg(error.response?.data || 'Signup failed. Please try again.');
                console.error("Signup failed:", error);
            } 
        }
    }
    return (
    
        <div className="min-h-screen flex">
            <div 
                className="absolute w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('/authbackgrounf.png')" }}
            >
                <div className="flex items-center justify-center relative z-100 pt-15 mb-10">
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
                        
                        {errorMsg && <p className="text-red-500" >{errorMsg}</p>}

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
                                </div>
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
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
                                </div>
                                {errors.email && <p className="text-xs text-red-500 mt-1" >{errors.email.message}</p>}
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
                                </div>
                                {errors.phoneNumber && <p className="text-xs text-red-500 mt-1" >{errors.phoneNumber.message}</p>}
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
                                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password?.message}</p>}
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