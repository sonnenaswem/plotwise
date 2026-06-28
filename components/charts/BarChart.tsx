"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/* Score-based colour: green ≥ 70, amber 50–69, red < 50 */
function scoreColor(value: number, alpha = 1) {
  if (value >= 70) return `rgba(163,230,53,${alpha})`;
  if (value >= 50) return `rgba(245,158,11,${alpha})`;
  return `rgba(239,68,68,${alpha})`;
}

export default function BarChart({
  labels,
  values,
  label = "Score",
}: {
  labels: string[];
  values: number[];
  label?: string;
}) {
  const data = {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: values.map((v) => scoreColor(v, 0.85)),
        borderColor:     values.map((v) => scoreColor(v, 1)),
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0D2137",
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => `  Score: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#94A3B8",
          font: { size: 11, family: "'Inter', system-ui, sans-serif" },
          maxRotation: 35,
          minRotation: 0,
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "#F1F5F9" },
        border: { display: false },
        ticks: {
          color: "#94A3B8",
          font: { size: 11, family: "'Inter', system-ui, sans-serif" },
          stepSize: 20,
        },
      },
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Colour legend */}
      <div style={{ display: "flex", gap: 14 }}>
        {[
          { label: "High (70+)",   color: "rgba(163,230,53,0.85)" },
          { label: "Moderate",     color: "rgba(245,158,11,0.85)" },
          { label: "High Risk",    color: "rgba(239,68,68,0.85)"  },
        ].map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#94A3B8" }}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 220 }}>
        <Bar data={data} options={options as any} />
      </div>
    </div>
  );
}
