import {useForm} from "react-hook-form";
import { useState } from "react";
import type { LoginCredentials } from "../../types/auth.types";
import axios from "axios";

export const Signin = () => {
    const {
        register, 
        handleSubmit, 
        formState: {errors}, 
        reset,
    } = useForm<LoginCredentials>();
    const [submittedData, setSubmittedData] = useState<LoginCredentials | null>(null);
   
    //This will ONLY run after form submission, not while typing.
    const onSubmit = async (data:LoginCredentials) => {

        try{
            //await pauses until server responds
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/signin`, data);
            console.log("server response:", response);
            setSubmittedData(data) //to save it to our state
            console.log("submitted:", data),
            reset(); // this clears all inputs

        } catch(error){
            console.log("network error:", error);
        }
      
    }

    console.log(submittedData);
    return (
        <>
        <form onSubmit={handleSubmit(onSubmit)}>
            <input 
                placeholder="Enter name" 
                {...register("name", {
                   
                })}/>
            <input 
                placeholder="Enter email" 
                {...register("email", {
                    required: "email required"
                })}/>
            <input 
                placeholder="Enter phoneNumber" 
                {...register("number", {
                    required: "Phone number required",
                    minLength: {value:10, message:"Must be 10 digits"},
                    maxLength: {value:10, message:"Must be 10 digits"}
                })}/>
            <input 
                placeholder="Enter Password"
                type="password"
                {...register("password", {
                    required: "Password required",
                })}/>
            <button>Continue</button>
            <p>{errors.email?.message}</p>
            <p>{errors.number?.message}</p>
            <p>{errors.password?.message}</p>
        </form>
        
        </>
    );
}

// Network calls are asynchronous → we must wait.