import { useEffect, useState } from "react";
import { api } from "../../utils/axios";
import type { Balance } from "../../types/Balance";

export const useBalance = () => {
    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchBalance() {
        try {
            const res = await api.get("/getBalance");
            if (isMounted) {
            setBalance(res.data.data);
            }
        } catch {
            if (isMounted) {
            setError("Failed to load balance");
            }
        } finally {
            if (isMounted) {
            setLoading(false);
            }
        }
    }

    fetchBalance();

    return () => {
      isMounted = false;
    };
  }, []);
  return { balance, loading, error };
}