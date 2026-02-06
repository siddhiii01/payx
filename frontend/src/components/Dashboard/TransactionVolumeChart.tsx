// src/components/TransactionVolumeChart.tsx
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { api } from "../../utils/axios";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartData = {
  labels: string[];
  moneyIn: number[];
  moneyOut: number[];
};

type TimeRange = 7 | 30 | 90;

export const TransactionVolumeChart = () => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>(7);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/chart/volume", {
          params: { days: range },
        });
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load chart:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-80 animate-pulse" />
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
        No transaction data available
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Money In",
        data: data.moneyIn,
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96, 165, 250, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 10,
      },
      {
        label: "Money Out",
        data: data.moneyOut,
        borderColor: "#34d399",
        backgroundColor: "rgba(52, 211, 153, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        align: "center" as const,
        labels: {
          font: { 
            size: 12,
            family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          color: '#6b7280',
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ₹${value.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { 
          display: false,
          drawBorder: false,
        },
        ticks: { 
          font: { size: 11 },
          color: '#9ca3af',
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: { 
          color: "#f3f4f6",
          drawBorder: false,
        },
        ticks: {
          callback: (value: any) => {
            const numValue = Number(value);
            if (numValue >= 1000) {
              return `₹${(numValue / 1000).toFixed(0)}K`;
            }
            return `₹${numValue}`;
          },
          font: { size: 11 },
          color: '#9ca3af',
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Transaction Volume</h2>
        <div className="flex gap-2">
          {([7, 30, 90] as TimeRange[]).map((days) => (
            <button
              key={days}
              onClick={() => setRange(days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                range === days
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Last {days} days
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};