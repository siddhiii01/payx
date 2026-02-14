import { api } from "../../utils/axios";
// import { type Payment } from "shared_schemas"

type Payment = {
    amount: number;    // rupees (frontend)
    phoneNumber: string;
}

export const sendP2PPayment = async (data: Payment) => {
    return api.post('/p2ptransfer', {
        ...data,
        amount: Math.round(data.amount * 100), // ₹12 → 1200 paise
    });
}