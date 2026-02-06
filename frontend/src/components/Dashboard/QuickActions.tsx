import { Plus, Send, History } from "lucide-react";
import type { JSX } from "react";
import { Link } from "react-router-dom";

export const QuickActions = (): JSX.Element => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Removed mt-20 → this was causing the height mismatch */}

      {/* Formal Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Quick Actions
        </h3>
      </div>

      <div className="flex flex-col">
        {/* Standardized Action Rows */}
        <Link
          to="/addtowallet"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition border-b border-gray-100 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 text-gray-600 p-2 rounded-lg group-hover:bg-green-100 group-hover:text-green-700 transition">
              <Plus size={18} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Add Funds to Wallet</span>
          </div>
        </Link>

        <Link
          to="/p2ptransfer"
          className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition border-b border-gray-100 group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 text-gray-600 p-2 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-700 transition">
              <Send size={18} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Send Money Transfer</span>
          </div>
        </Link>

        {/* View All Transactions Link as a footer action */}
        <Link
          to="/transactions"
          className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-blue-600 hover:text-blue-800 transition bg-gray-50/50"
        >
          <History size={14} />
          VIEW ALL TRANSACTIONS
        </Link>
      </div>
    </div>
  );
};