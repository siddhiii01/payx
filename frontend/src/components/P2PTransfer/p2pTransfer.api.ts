import { api } from "../../utils/axios";
import { type Payment } from "shared_schemas"

export const sendP2PPayment = async (data: Payment) => {
    const response = await api.post('/p2ptransfer', data);
    return response.data;
}