import type { JSX } from "react";
import { ArrowLeft } from "lucide-react";

interface P2PHeaderProps {
  onBack: () => void;
}

export const P2PHeader = ({ onBack }: P2PHeaderProps): JSX.Element => {
    return (
        <header className="w-full border-b border-gray-100 bg-white py-4">
            {/* Centering Container */}
            <div className="flex items-center justify-start gap-4 pl-20 md:pl-40 lg:pl-80">
                
                {/* Back Navigation Button */}
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Go Back"
                    className="rounded-full p-2 text-slate-900 transition-colors hover:bg-slate-50"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Text Content Section */}
                <div className="flex flex-col">
                    <p className="text-base font-bold tracking-tight text-slate-800">
                        P2P Transfer
                    </p>
                    <p className="text-xs font-normal text-slate-500">
                        Send money to PayX users
                    </p>
                </div>
                
            </div>
        </header>
    );
}