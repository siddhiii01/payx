import {useForm, type SubmitHandler} from "react-hook-form";
import axios from "axios";

type AddMoneyFormdata = {
    amount: number
}

export const AddMoneyToWallet = () => {
    const {
        register, 
        handleSubmit,
        formState: {errors, isSubmitting},
        reset,
    } = useForm<AddMoneyFormdata>();

    const onSubmit: SubmitHandler<AddMoneyFormdata> = async (data: any) => {
        try {
            console.log("Money Added", data.amount);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/addmoneytowallet`,
                {
                    amount: data.amount
                }
            );
            console.log(response.data);
            reset(); //clearing the form after success

        } catch(error){
            console.error("Failed to add money", error);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
        <input 
            placeholder="Enter Amount"
            type="number"
            {...register("amount", {
                required: "Amount is required",
                min: {
                    value: 1,
                    message: "Amount must be greater than 0"
                },
                valueAsNumber: true
            })}
        />

        {errors.amount && (<p>{errors.amount.message}</p>)}

        <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding...": "Add Money to Wallet"}
        </button>

        </form>
    )
}