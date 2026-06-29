"use client";

import { useEffect, useState } from "react";
import { getPortfolioInsights } from "@/services/portfolio/portfolio-service";
import BarChart from "@/components/charts/BarChart";
import DoughnutChart from "@/components/charts/DoughnutChart";
import BoroughFilter from "@/components/filters/BoroughFilter";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const TEAL  = "#0E7490";

function ScoreBadge({ score }: { score: number }) {
  const cfg = score >= 80
    ? { bg: "#ECFDF5", color: "#059669", label: "High" }
    : score >= 60
    ? { bg: "#FFFBEB", color: "#D97706", label: "Moderate" }
    : { bg: "#FEF2F2", color: "#DC2626", label: "High Risk" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 99, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio]         = useState<any>(null);
  const [selectedBorough, setSelectedBorough] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    getPortfolioInsights().then(setPortfolio);
  }, []);

  if (!portfolio) {
    return (
      <div style={{ ...sans, display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #EAF3DE", borderTop: "3px solid #A3E635", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Loading portfolio…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const boroughs = Object.keys(portfolio.boroughDistribution);
  const assessments = selectedBorough === ""
    ? portfolio.latestAssessments
    : portfolio.latestAssessments.filter((a: any) => a.projects?.borough === selectedBorough);

  const kpis = [
    { label: "Total Projects",   value: portfolio.totalProjects,   sub: "In portfolio",       accent: "#A3E635", bg: "#F2FCE4", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
    { label: "Assessments Run",  value: portfolio.totalAssessments, sub: "Across all sites",   accent: TEAL,      bg: "#F0F9FF", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg> },
    { label: "Average Score",    value: portfolio.averageScore,    sub: "Portfolio average",   accent: "#8B5CF6", bg: "#F5F3FF", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { label: "Avg. Approval",    value: `${portfolio.averageProbability}%`, sub: "Estimated likelihood", accent: "#10B981", bg: "#ECFDF5", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ];

  return (
    <div style={{ ...sans, maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ ...serif, fontSize: 32, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", margin: "0 0 4px" }}>Portfolio Analytics</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Portfolio-wide planning intelligence across your sites</p>
        </div>
        {/* <BoroughFilter boroughs={boroughs} value={selectedBorough} onChange={setSelectedBorough} /> */}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{
            background: "#fff", border: "1px solid #E8EDF2", borderRadius: 12, padding: "18px 20px",
            position: "relative", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: k.accent, borderRadius: "12px 0 0 12px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#64748B", margin: 0, textTransform: "uppercase", letterSpacing: "0.6px" }}>{k.label}</p>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{k.icon}</div>
            </div>
            <p style={{ ...serif, fontSize: 32, fontWeight: 600, color: "#0D2137", margin: "0 0 2px", lineHeight: 1 }}>{k.value}</p>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Highest risk + Best opportunity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          {
            title: "⚠️  Highest Risk Site", data: portfolio.highestRisk,
            scoreBg: "#FEF2F2", scoreColor: "#DC2626",
            bg: "#fff", border: "1px solid #FECACA",
          },
          {
            title: "⭐  Best Opportunity", data: portfolio.bestOpportunity,
            scoreBg: "#ECFDF5", scoreColor: "#059669",
            bg: "#fff", border: "1px solid #A7F3D0",
          },
        ].map((card) => (
          <div key={card.title} style={{ background: card.bg, border: card.border, borderRadius: 12, padding: "20px 22px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#64748B", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{card.title}</p>
            {card.data ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#0D2137", margin: "0 0 4px" }}>{card.data.projects?.address}</p>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 4px" }}>{card.data.projects?.borough} · {card.data.projects?.project_type}</p>
                  <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Probability: {card.data.approval_probability}%</p>
                </div>
                <div style={{ padding: "10px 14px", background: card.scoreBg, borderRadius: 10, textAlign: "center" }}>
                  <p style={{ ...serif, fontSize: 28, fontWeight: 600, color: card.scoreColor, margin: "0 0 2px", lineHeight: 1 }}>{card.data.score}</p>
                  <p style={{ fontSize: 10, color: card.scoreColor, margin: 0, opacity: 0.7 }}>score</p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No assessments available.</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>

        {/* Borough doughnut */}
        <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 12, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", margin: "0 0 4px" }}>Borough Distribution</h2>
          <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 16px" }}>Projects per borough</p>
          <div style={{ height: 200 }}>
            <DoughnutChart labels={Object.keys(portfolio.boroughDistribution)} values={Object.values(portfolio.boroughDistribution)} />
          </div>
        </div>

        {/* Type doughnut */}
        <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 12, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", margin: "0 0 4px" }}>Project Type Mix</h2>
          <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 16px" }}>Projects by type</p>
          <div style={{ height: 200 }}>
            <DoughnutChart labels={Object.keys(portfolio.typeDistribution)} values={Object.values(portfolio.typeDistribution)} />
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 12, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", margin: "0 0 4px" }}>Portfolio Scores</h2>
          <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 16px" }}>Assessment score per site</p>
          <div style={{ height: 260 }}>
            <BarChart
              labels={portfolio.latestAssessments.map((a: any) => a.projects?.address?.split(",")[0] ?? "—")}
              values={portfolio.latestAssessments.map((a: any) => a.score)}
              label="Score"
            />
          </div>
        </div>
      </div>

      {/* Portfolio table */}
      <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0D2137", margin: "0 0 2px" }}>
              Portfolio Projects {selectedBorough && <span style={{ color: TEAL }}>— {selectedBorough}</span>}
            </h2>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>{assessments.length} site{assessments.length !== 1 ? "s" : ""} shown</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.7fr 100px 90px", padding: "10px 24px", background: "#FAFBFC", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", borderBottom: "1px solid #F1F5F9" }}>
          <span>Address</span><span>Borough</span><span>Type</span><span>Score</span><span>Approval</span><span>Risk</span>
        </div>

        {assessments.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>No sites match this filter.</p>
          </div>
        )}

        {assessments.map((a: any, i: number) => (
          <div key={a.id} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.7fr 100px 90px",
            padding: "14px 24px", alignItems: "center",
            borderBottom: i < assessments.length - 1 ? "1px solid #F8FAFC" : "none",
            transition: "background 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFC")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", margin: 0 }}>{a.projects?.address}</p>
            <span style={{ fontSize: 12, color: "#64748B" }}>{a.projects?.borough}</span>
            <span style={{ fontSize: 12, color: "#64748B" }}>{a.projects?.project_type}</span>
            <span style={{ ...serif, fontSize: 20, fontWeight: 600, color: "#0D2137" }}>{a.score}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: a.approval_probability >= 70 ? "#059669" : a.approval_probability >= 50 ? "#D97706" : "#DC2626" }}>
              {a.approval_probability}%
            </span>
            <ScoreBadge score={a.score} />
          </div>
        ))}
      </div>
    </div>
  );
}
