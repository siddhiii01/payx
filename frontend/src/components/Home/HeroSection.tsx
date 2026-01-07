import type { JSX } from "react";
import { Link } from "react-router-dom";
import {ShieldCheck} from "lucide-react";

export const HeroSection = (): JSX.Element => {
    return (
        <section className="flex flex-col items-center justify-center px-6 py-20 text-center bg-white">
            {/* Badge */}
            <div className="mb-6 flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 border border-indigo-100"> 
                <ShieldCheck size={16} className="text-indigo-600" />
                Secure Digital Payments
            </div>

            {/* Main Headline */}
            <h1 className="max-w-2xl text-2xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                Simple, Secure <br />
                <span className="text-indigo-800">Digital Wallet</span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-base md:text-lg text-slate-500 leading-relaxed mb-10">
                Send, receive, and manage your money with PayX. 
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                    to={"/signup"}
                    className="rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5"
                >
                    Get Started Free
                </Link>
                <Link 
                    to={"/login"}
                    className="rounded-xl bg-slate-50 border border-slate-200 px-8 py-4 text-lg font-semibold text-slate-700 transition-all hover:bg-slate-100"
                >
                    Login to Account
                </Link>
            </div>
        </section>
    );
}