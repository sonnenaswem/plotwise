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

export default function ScoreDistributionChart({ assessments }: { assessments: any[] }) {
  const high   = assessments.filter((a) => a.score >= 80).length;
  const medium = assessments.filter((a) => a.score >= 60 && a.score < 80).length;
  const low    = assessments.filter((a) => a.score < 60).length;
  const total  = assessments.length || 1;

  const data = {
    labels: ["High Approval (80–100)", "Moderate (60–79)", "High Risk (0–59)"],
    datasets: [
      {
        label: "Assessments",
        data: [high, medium, low],
        backgroundColor: ["rgba(163,230,53,0.85)", "rgba(245,158,11,0.85)", "rgba(239,68,68,0.85)"],
        borderColor:     ["#A3E635",                "#F59E0B",               "#EF4444"],
        borderWidth: 1.5,
        borderRadius: 8,
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
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed.y;
            const pct = Math.round((val / total) * 100);
            return `  ${val} assessment${val !== 1 ? "s" : ""} (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#94A3B8", font: { size: 12, family: "'Inter', system-ui, sans-serif" } },
      },
      y: {
        grid: { color: "#F1F5F9", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: "#94A3B8",
          font: { size: 11, family: "'Inter', system-ui, sans-serif" },
          stepSize: 1,
          callback: (v: any) => (Number.isInteger(v) ? v : ""),
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      {/* Summary pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "High Approval", count: high,   pct: Math.round((high / total) * 100),   color: "#A3E635", bg: "#F2FCE4", text: "#3B6D11" },
          { label: "Moderate",      count: medium, pct: Math.round((medium / total) * 100), color: "#F59E0B", bg: "#FFFBEB", text: "#92400E" },
          { label: "High Risk",     count: low,    pct: Math.round((low / total) * 100),    color: "#EF4444", bg: "#FEF2F2", text: "#991B1B" },
        ].map((s) => (
          <div key={s.label} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
            background: s.bg, borderRadius: 99, border: `1px solid ${s.color}33`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: s.text }}>{s.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: s.text }}>{s.count}</span>
            <span style={{ fontSize: 11, color: s.text, opacity: 0.6 }}>({s.pct}%)</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: 220 }}>
        <Bar data={data} options={options as any} />
      </div>
    </div>
  );
}
