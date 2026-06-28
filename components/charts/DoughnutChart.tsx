"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

/* Distinct, accessible colour palette */
const PALETTE = [
  "#A3E635", // lime
  "#0E7490", // teal
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EF4444", // red
  "#10B981", // emerald
  "#3B82F6", // blue
  "#F97316", // orange
  "#EC4899", // pink
  "#6366F1", // indigo
  "#14B8A6", // teal-2
  "#84CC16", // yellow-green
];

export default function DoughnutChart({
  labels,
  values,
}: {
  labels: string[];
  values: (string | number)[];
}) {
  const nums = values.map(Number);

  const data = {
    labels,
    datasets: [
      {
        data: nums,
        backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: false, // we render a custom legend below
      },
      tooltip: {
        backgroundColor: "#0D2137",
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            const total = nums.reduce((a, b) => a + b, 0);
            const pct   = total ? Math.round((ctx.parsed / total) * 100) : 0;
            return `  ${ctx.label}: ${ctx.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ height: 200 }}>
        <Doughnut data={data} options={options as any} />
      </div>

      {/* Colour-coded legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 120, overflowY: "auto" }}>
        {labels.map((label, i) => {
          const total = nums.reduce((a, b) => a + b, 0);
          const pct   = total ? Math.round((nums[i] / total) * 100) : 0;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0, display: "inline-block" }} />
                <span style={{ color: "#475569" }}>{label}</span>
              </div>
              <span style={{ fontWeight: 600, color: "#0D2137" }}>{nums[i]} <span style={{ color: "#94A3B8", fontWeight: 400 }}>({pct}%)</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
