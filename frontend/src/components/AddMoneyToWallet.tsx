import {useForm} from "react-hook-form";
import { api } from "../utils/axios";
import z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import type {JSX} from "react";
import {toast} from "react-hot-toast";

const PROVIDERS = ["HDFC", "AXIS", "SBI"] as const;

const moneySchema = z.object({
    amount : z.number()
            .min(1, "Amount must be at least Rs.1")
            .max(20000, "Amount cannot exceed 20,000rs."),
    provider: z.enum(PROVIDERS),
});

type Money = z.infer<typeof moneySchema>;

export const AddMoneyToWallet = (): JSX.Element => {
    const {
        register, 
        handleSubmit,
        formState: {errors, isSubmitting},
        reset
    } = useForm<Money>({resolver: zodResolver(moneySchema)});

    const onSubmit = async (data: Money) => {
        try {
            console.log("Money Added", data, typeof data);
            const response = await api.post(`/addtowallet`,data);
            console.log("Paytm Server response on ramp: ",response.data);

            const { success, paymentUrl } = response.data;
            if(success && paymentUrl){
                toast.success("Redirecting to bank payment...");
                reset();
                // slight delay so user sees feedback
                setTimeout(() => {
                    window.location.href = paymentUrl;
                }, 800); 
            } else {
                toast.error("Failed to initiate payment");
            } 
            console.log(window.location.href)
            reset();
        } catch(error: any){
            console.error("Failed to add money", error);
            toast.error(error?.response?.data?.message ??
                        error?.message ??
                        "Something went wrong. Please try again.")
        }
    }

    return (
        <div className="p-8 bg-gray-50 flex items-center justify-center">
            <div className="w-full bg-white shadow-lg rounded-xl p-8 max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Add Money to PayX Wallet</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5"> 
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <input 
                            type="number"
                            {...register("amount", {
                                valueAsNumber: true
                            })}
                            className="mt-1 w-full px-4 py-2 border rounded-md"
                        />

                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message as string}</p>}
                    </div>
                    <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-gray-700">Choose Your Bank</label>
                        <select {...register("provider")} className="mt-1 w-full px-4 py-2 border rounded-md">
                            <option value="">-- Select Bank --</option>
                            <option value="HDFC">HDFC</option>
                            <option value="AXIS">AXIS</option>
                            <option value="SBI">SBI</option>
                        </select>
                        {errors.provider && <p className="text-red-500 text-sm mt-1">{errors.provider.message as string}</p>}
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                    >
                        {isSubmitting ? "Proceed...": "Proceeding"}
                    </button>

                    
                </form>
            </div>
        </div>
    )
}

