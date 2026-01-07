// import type { JSX } from "react";
// import { useLocation, Navigate } from "react-router-dom";
// import { IndianRupee } from "lucide-react";

// type P2PResult = {
//     amount: number;
//     receiverphoneNumber: string;
//     status: "COMPLETED" | "FAILED";
//     transactionId: number;
//     typeofTransfer: "P2P";
// };

// export const P2PStatus = (): JSX.Element => {
//     const location = useLocation();
//     const data = location.state as P2PResult | null;

//     // Hard refresh / direct URL access protection
//     if (!data) {
//         return <Navigate to="/dashboard" replace />;
//     }

//     return (
//         <div className="mt-10 text-center">
//             <h1 className="text-lg font-bold text-green-600">
//                 Transfer Successful
//             </h1>

//             <p className="mt-3 text-sm text-gray-600">
//                 <IndianRupee size={14} className="inline mr-1" />
//                 {data.amount} sent to {data.receiverphoneNumber}
//             </p>

//             <p className="mt-1 text-xs text-gray-400">
//                 Transaction ID: {data.transactionId}
//             </p>
//         </div>
//     );
// };
