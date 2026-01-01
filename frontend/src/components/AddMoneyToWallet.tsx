import {useForm} from "react-hook-form";
import { api } from "../utils/axios";
import z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import {useState, type JSX} from "react";


const PROVIDERS = ["HDFC", "AXIS", "SBI"] as const;

const moneySchema = z.object({
    amount : z.number().min(1, "Amount must be at least Rs.1").max(10000, "Amount cannot exceed 10,000rs."),
    provider: z.enum(PROVIDERS),
});

type Money = z.infer<typeof moneySchema>;

export const AddMoneyToWallet = (): JSX.Element => {
    const {
        register, 
        handleSubmit,
        formState: {errors, isSubmitting},
        reset,
    } = useForm<Money>({resolver: zodResolver(moneySchema)});

    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [redirecting, setRedirecting] = useState(false);

    const onSubmit = async (data: Money) => {
        try {
            setErrorMsg(null);
            setRedirecting(false);

            console.log("Money Added", data, typeof data);
            const response = await api.post(`/addmoneytowallet`,data);
            console.log("Paytm Server response on ramp: ",response.data);

            const { success, paymentUrl } = response.data;
            if(success && paymentUrl){
                setRedirecting(true); // Show "Redirecting to bank..."
                setTimeout(() => {
                    window.location.href = paymentUrl;
                }, 1000); // Give user time to see message
            }else {
                setErrorMsg("Failed to get payment URL");
            }
            console.log(window.location.href)
            

        } catch(error: any){
            setRedirecting(false);
            console.error("Failed to add money", error);
            setErrorMsg(error.response?.data?.message || "Failed to initiate payment");
        }
    }

    return (

        <div className="p-8 bg-gray-50 flex items-center justify-center">
            <div className="w-full bg-white shadow-lg rounded-xl p-8 max-w-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Add Money to PayX Wallet</h2>
                {errorMsg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {errorMsg}
                    </div>
                )}

                {redirecting && (
                    <div className="text-center text-blue-600 mt-4">
                        Redirecting to bank...
                    </div>
                )}

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

