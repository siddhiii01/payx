import {useForm} from "react-hook-form";
import { api } from "../../utils/axios";
import z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type JSX } from 'react';
import { P2PHeader } from "./P2PHeader";
import { BalanceCard } from "./BalanceCard";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";


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

export const P2PTransfer= ():JSX.Element => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }, //tracks submission lifecycle
        
    } = useForm<Payment>({resolver: zodResolver(paymentSchema)});

    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (data: Payment) => {
        setServerError(null) //always clear the error first 


        try{
            const response = await api.post('/p2ptransfer', data);
            console.log("Payment successful:", response.data);
            navigate('/dasbhoard');
        } catch(error:any){
            if (!error.response) {
                setServerError("Server is unreachable. Please try again later.");
            } else if (error.response.data?.message) {
                setServerError(error.response.data.message);
            } else {
                setServerError("An unexpected error occurred.");
            }
        }       
        
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <P2PHeader />

            <main className="mx-auto mt-6 max-w-xl px-4">
                {/* Balance Card */}
                <BalanceCard />

                {/* Transfer Form Card */}
                <div className="rounded-l border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-default">

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {serverError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {serverError}
                            </div>
                        )}

                        {/* Phone Number Input */}
                        <div>
                            <label className="mb-1.5 block text-[13px] font-semibold text-gray-700">
                                Receiver's Phone Number
                            </label>
                            <input 
                                placeholder="9876543210"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/30 px-3 py-2.5 text-sm outline-none transition-all focus:border-indigo-600 focus:bg-white"
                                {...register("phoneNumber")}
                            />
                            {errors.phoneNumber && (
                                <p className="mt-1 text-[11px] text-red-500">{errors.phoneNumber.message}</p>
                            )}
                        </div>
                        {/* Amount Input */}
                        <div>
                            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                                Amount (₹)
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/30 px-3 py-2.5 text-base font-semibold outline-none transition-all focus:border-indigo-600 focus:bg-white"
                                {...register("amount", { valueAsNumber: true })}
                            />
                            {errors.amount && (
                                <p className="mt-1 text-[11px] text-red-500">{errors.amount.message}</p>
                            )}
                        </div>
                        
                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3f3fdb] py-3 text-sm font-bold text-white transition-all hover:bg-[#3232b5] disabled:bg-indigo-300"
                        >
                            <Send size={16} />
                            {isSubmitting ? "Sending...": "Send Money"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}