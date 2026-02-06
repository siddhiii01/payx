// src/components/Transactions.tsx
import { useEffect, useState } from "react";
import { ArrowUpDown, ArrowDownUp } from "lucide-react"; // These are the icons you want
import { api } from "../../utils/axios";

type Transaction = {
  id: number;
  type: "ONRAMP" | "P2P_TRANSFER";
  direction: "DEBIT" | "CREDIT";
  amount: number;
  date: string;
  description: string;
  counterparty?: string;
  status: string;
};

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/api/transactions", {
          params: { page, limit: 10 },
        });
        setTransactions(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page]);

  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="px-5 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-100 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="px-5 py-6 text-center text-red-600 text-sm">{error}</div>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.length === 0 ? (
        <div className="px-5 py-10 text-center text-gray-500 text-sm">
          No transactions yet
        </div>
      ) : (
        transactions.map((tx) => (
          <div
            key={tx.id}
            className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition"
          >
            {/* Left: Icon + Text */}
            <div className="flex items-center gap-3">
              {/* Icon Container */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  tx.direction === "CREDIT"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {tx.direction === "CREDIT" ? (
                  <ArrowDownUp size={18} strokeWidth={2.5} />
                ) : (
                  <ArrowUpDown size={18} strokeWidth={2.5} />
                )}
              </div>

              {/* Description */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {tx.description}
                  {tx.counterparty && ` • ${tx.counterparty}`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(tx.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Right: Amount */}
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  tx.direction === "CREDIT" ? "text-green-600" : "text-red-600"
                }`}
              >
                {tx.direction === "CREDIT" ? "+" : "−"}₹
                {tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))
      )}

      {/* Pagination - minimal */}
      {totalPages > 1 && (
        <div className="px-5 py-3 flex items-center justify-center gap-6 text-xs text-gray-500 border-t border-gray-100">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>{page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};