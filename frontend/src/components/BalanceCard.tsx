import type { JSX } from "react";
import { IndianRupeeIcon } from "lucide-react";
import {type Balance} from "../types/Balance"


export const BalanceCard = ({email, amount}: Balance): JSX.Element => {
    return (
        <div className="mb-4 flex items-center justify-between rounded-l border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-md cursor-default">
        
        {/* Left Side */}
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#f0f4ff] flex items-center justify-center flex-shrink-0">
            <div
                className="h-[22px] w-[22px] bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: "url('/payxlogo.png')" }}
            />
            </div>

            <div>
            <p className="text-[11px] font-medium text-slate-500">From</p>
            <p className="text-[13px] font-semibold text-slate-900 leading-tight">
                {email}
            </p>
            </div>
        </div>

        {/* Right Side */}
        <div className="text-right">
            <p className="text-[11px] font-medium text-slate-500">Balance</p>
            <p className="flex items-center justify-end text-[15px] font-bold text-slate-900">
            <IndianRupeeIcon size={11} strokeWidth={4} />
            <span>{amount.toLocaleString("en-IN")}</span>
            </p>
        </div>
        </div>
    );
}