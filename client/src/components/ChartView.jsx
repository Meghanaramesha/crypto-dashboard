import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ChartView({ coinId, days, start, end }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);

        // Base URL
        let url = `http://localhost:5000/api/coins/${coinId}/history`;

        // Collect query params
        let params = [];

        if (days) {
          params.push(`days=${days}`);
        }

        if (start && end) {
          params.push(`start=${start}`);
          params.push(`end=${end}`);
        }

        // Add params to URL
        if (params.length > 0) {
          url += "?" + params.join("&");
        }

        const res = await axios.get(url);
        setHistory(res.data || []);
      } catch (err) {
        console.error("Chart error:", err.message);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [coinId, days, start, end]);

  if (loading) return <p>Loading chart...</p>;
  if (!history || history.length === 0) return <p>No chart data available.</p>;

  const labels = history.map((h) =>
    new Date(h.recorded_date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })
  );

  const prices = history.map((h) => Number(h.price));

  const data = {
    labels,
    datasets: [
      {
        label: "Price (INR)",
        data: prices,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.25)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#e5e7eb" } },
      y: {
        ticks: {
          color: "#e5e7eb",
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default ChartView;
