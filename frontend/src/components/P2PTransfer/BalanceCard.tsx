import { useEffect, useState, type JSX } from "react";
import { api } from "../../utils/axios";
import {BadgeIndianRupeeIcon, IndianRupee, IndianRupeeIcon} from "lucide-react";


type GetBalanceResponse = {
    data: {
        email: string,
        amount: number
    }
}

export const BalanceCard = (): JSX.Element => {
    const [balance, setBalance] = useState<GetBalanceResponse['data'] | null>(null);
    
    useEffect(() => {
        const fetchBalance = async () => {
            try{
                const res = await api.get('/getBalance');
                setBalance(res.data.data)
            }catch(error){
                console.error("Failed to fetch balance", error);
            }
        };

        fetchBalance();
    }, []);

    if (!balance) {
        return <div className="p-4">Unable to load balance</div>;
    }
    return (
        <div className="mb-4 flex items-center justify-between rounded-l border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-default">
            
            {/* Left Side */}
            <div className="flex items-center gap-3">
                <div
                    className="rounded-lg flex-shrink-0 bg-[#f0f4ff] flex items-center justify-center"
                    style={{
                        width: "40px", 
                        height: "40px",
                    }}
                >
                    <div 
                        style={{
                            backgroundImage: "url('/payxlogo.png')",
                            width: "22px",
                            height: "22px",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                        }}
                    />
                </div>
                
                <div className="flex flex-col">
                    <p className="text-[11px] font-medium text-slate-500">From</p>
                    <p className="text-[13px] font-semibold text-slate-900 leading-tight">
                        {balance.email}
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="text-right">
                <p className="text-[11px] font-medium text-slate-500">Balance</p>
                <p className="flex items-center justify-end  text-[15px] font-bold text-slate-900 tracking-tight">
                    <IndianRupeeIcon size={11} strokeWidth={4} />
                    <span>{balance.amount.toLocaleString("en-IN")}</span>
                </p>
            </div>
            
        </div>
    );
};