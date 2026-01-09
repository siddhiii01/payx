import { useEffect, useState, type JSX } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { api } from "../../utils/axios";

export const Navbar =  (): JSX.Element => {
    const location = useLocation();
    console.log("location", location);
    const isDashboard = location.pathname === "/dashboard"; // Check if the current path is the dashboard

    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        if (!isDashboard) return;

        const fetchUser = async () => {
            try {
                const res = await api.get("/dashboard");
                console.log(res);
                const name = res.data.data; 
                setName(name); // adjust field
            } catch (err) {
                console.error("Failed to fetch user");
            }
        };

        fetchUser();
    }, [isDashboard]);
    
    
  

    return (
        <nav className="w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                
                {/* Logo Section - Visible on all pages */}
                <Link to="/" className="flex items-center gap-1">
                    <div
                        className="rounded-xl"
                        style={{
                            backgroundImage: "url('/payxlogo.png')",
                            width: "40px",
                            height: "40px",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    ></div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        PayX
                    </span>
                </Link>

                {/* Conditional Rendering Logic */}
                {!isDashboard ? (
                    /* HOME PAGE VIEW (Login / Sign Up) */
                    <div className="flex items-center gap-8">
                        <Link 
                            to="/login"
                            className="text-small font-medium text-gray-600 transition-colors hover:text-indigo-600"
                        >
                            Login
                        </Link>
                        <Link 
                            to="/signup"
                            className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                        >
                            Sign Up
                        </Link>
                    </div>
                ) : (
                    /* DASHBOARD VIEW (User / Logout) */
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-lg text-slate-800 font-medium">
                            <User size={14} />
                            <span className="text-sm">{name ?? "Loading..."}</span>
                        </div>

                        <button 
                            className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors font-medium"
                            onClick={() => {/* Handle Logout Logic */}}
                        >
                            <LogOut size={14} />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}