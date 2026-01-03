import {useForm} from "react-hook-form";
import { api } from "../utils/axios";
import z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type JSX } from 'react';


const paymentSchema = z.object({
    amount: z
        .number()
        .min(1, "Amount must be at least Rs. 1")
        .max(10_000, "You can send a maximum of Rs. 10,000 at once"),
    phoneNumber: z
        .string()
        .trim()
        .min(1, "Phone number is required")
        .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number")
});

type Payment = z.infer<typeof paymentSchema>

export const P2P= ():JSX.Element => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }, //tracks submission lifecycle
        
    } = useForm<Payment>({resolver: zodResolver(paymentSchema)});

    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = async (data: Payment) => {
        setServerError(null) //always clear the error first 

        try{
            const response = await api.post('/p2ptransfer', data);
            console.log("Payment successful:", response.data);
        } catch(error:any){
            if(!error.response){
                setServerError("Oops! Our server is having issues right now. Please try again in a moment.")
            }
        }       
        
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {(serverError) && <p>{serverError}</p>}
            <input 
                placeholder="Enter PayX user phone number"
                {...register("phoneNumber")}
            />
            {errors.phoneNumber && <p>{errors.phoneNumber.message}</p>}
    
            <input 
                placeholder="Enter amount"
                {...register("amount",{
                    valueAsNumber: true
                })}
            />
            {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}

            <button 
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Sending...": "Pay"}
            </button>
        </form>
    );
}