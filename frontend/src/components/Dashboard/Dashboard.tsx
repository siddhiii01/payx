import type { JSX } from "react";
import { Navbar } from "../Layout/Navbar";
import { BalanceData } from "./BalanceData";
import { QuickActions } from "./QuickActions";
import { Transactions } from "./Transactions";

export const Dashboard = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Shared container — everything inside this will have the same max-width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top section: Balance + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <BalanceData />
          </div>
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
        </div>

        {/* Transactions section — same container, same width */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing your latest wallet activity
            </p>
          </div>

          <Transactions />
        </div>
      </div>
    </div>
  );
};