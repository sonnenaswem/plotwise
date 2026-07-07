"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboard/dashboard-service";
import ScoreDistributionChart from "@/components/dashboard/ScoreDistributionChart";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };

function ScoreBadge({ score }: { score: number }) {
  const cfg =
    score >= 80 ? { bg: "#ECFDF5", color: "#059669", label: "High",     dot: "#059669" } :
    score >= 60 ? { bg: "#FFFBEB", color: "#D97706", label: "Moderate", dot: "#D97706" } :
                  { bg: "#FEF2F2", color: "#DC2626", label: "High Risk", dot: "#DC2626" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, background:cfg.bg, color:cfg.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />
      {cfg.label}
    </span>
  );
}

function MiniBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 80 ? "#A3E635" : value >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ width:56, height:4, background:"#F1F5F9", borderRadius:2, overflow:"hidden" }}>
      <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:2, transition:"width 0.6s ease" }} />
    </div>
  );
}

const KPI_CONFIG = (stats: any) => [
  {
    label: "Total Projects", value: stats.totalProjects, sub: "Active portfolio",
    accent: "#A3E635", lightBg: "#F2FCE4",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    label: "Total Assessments", value: stats.totalAssessments, sub: "Risk reports run",
    accent: "#6366F1", lightBg: "#EEF2FF",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  },
  {
    label: "Average Score", value: stats.averageScore, sub: "Portfolio average",
    accent: "#8B5CF6", lightBg: "#F5F3FF",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    label: "Avg. Approval Rate", value: `${stats.averageProbability}%`, sub: "Estimated likelihood",
    accent: "#0EA5E9", lightBg: "#F0F9FF",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    label: "High Risk Sites", value: stats.highRisk, sub: "Score below 60",
    accent: "#EF4444", lightBg: "#FEF2F2",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    label: "Lower Risk Sites", value: stats.mediumRisk + stats.lowRisk, sub: "Score 60 and above",
    accent: "#10B981", lightBg: "#ECFDF5",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
];

export default function DashboardPage() {
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    getDashboardStats()
      .then((result) => {
        setStats(result);
      })
      .catch((error) => {
        console.error("Dashboard loading failed:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The dashboard could not be loaded."
        );
      })
      .finally(() => {
        setLoading(false);
      });
      }, []);

  if (errorMessage) {
    return (
      <div
        style={{
          ...sans,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            border: "1px solid #FECACA",
            background: "#FEF2F2",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#991B1B",
              margin: "0 0 6px",
            }}
          >
            Dashboard could not be loaded
          </h2>

          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: "#B91C1C",
              margin: 0,
            }}
          >
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div style={{ ...sans, display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:14 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #EAF3DE", borderTop:"3px solid #A3E635", animation:"spin 0.8s linear infinite" }} />
        <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>Loading dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const kpis = KPI_CONFIG(stats);

  return (
    <>
      <style>{`
        /* ── KPI card hover ── */
        .kpi-card {
          background:#fff; border:1px solid #E8EDF2; border-radius:14px;
          padding:20px 22px; display:flex; flex-direction:column; gap:16px;
          box-shadow:0 1px 3px rgba(0,0,0,0.04);
          position:relative; overflow:hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          cursor: default;
        }
        .kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.09);
          border-color: #D9E2EC;
        }
        .kpi-card:hover .kpi-icon-box { transform: scale(1.08); }
        .kpi-icon-box { transition: transform 0.2s ease; }

        /* ── Row hover (table) ── */
        .assess-row { transition: background 0.15s; }
        .assess-row:hover { background: #FAFBFC; }

        /* ── Responsive grids ── */
        .dash-wrap { max-width: 1200px; }
        .kpi-grid  { display:grid; grid-template-columns: repeat(3,1fr); gap:16px; margin-bottom:24px; }
        .chart-row { display:grid; grid-template-columns: 1fr 280px; gap:16px; margin-bottom:24px; }
        .dash-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; gap:12px; flex-wrap: wrap; }

        /* Table columns shrink gracefully */
        .table-head, .assess-row {
          display:grid; grid-template-columns: 2.2fr 0.8fr 100px 120px 100px;
          align-items:center;
        }

        @media (max-width: 1024px) {
          .kpi-grid  { grid-template-columns: repeat(2,1fr) !important; }
          .chart-row { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr !important; }
          .dash-header { flex-direction: column; align-items: stretch !important; }
          .dash-actions { width: 100%; }
          .dash-actions a, .dash-actions button { flex:1; text-align:center; }

          /* Table → card layout on mobile */
          .table-head { display: none !important; }
          .assess-row {
            grid-template-columns: 1fr !important;
            grid-template-areas:
              "addr"
              "meta"
              "actions";
            row-gap: 10px;
            padding: 16px !important;
            border: 1px solid #F1F5F9;
            border-radius: 10px;
            margin-bottom: 10px;
          }
          .assess-row > div:nth-child(1) { grid-area: addr; }
          .row-meta-mobile {
            grid-area: meta;
            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
          }
          .row-action-mobile { grid-area: actions; display: flex; justify-content: flex-end; }
        }
      `}</style>

      <div style={{ ...sans }} className="dash-wrap">

        {/* ── Header ── */}
        <div className="dash-header">
          <div>
            <h1 style={{ ...serif, fontSize:28, fontWeight:300, color:"#0D2137", letterSpacing:"-0.5px", margin:"0 0 4px" }}>Dashboard</h1>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>PlotWize Planning Intelligence — Greater London</p>
          </div>
          <div className="dash-actions" style={{ display:"flex", gap:10 }}>
            <a href="/projects" style={{ fontSize:13, fontWeight:600, color:"#0B1628", background:"#A3E635", border:"none", borderRadius:8, padding:"8px 16px", cursor:"pointer", textDecoration:"none", whiteSpace:"nowrap" }}>
              + New Project
            </a>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className="kpi-card">
              <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:k.accent, borderRadius:"14px 0 0 14px" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <p style={{ fontSize:12, fontWeight:600, color:"#64748B", margin:0, textTransform:"uppercase", letterSpacing:"0.6px" }}>{k.label}</p>
                <div className="kpi-icon-box" style={{ width:36, height:36, borderRadius:10, background:k.lightBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {k.icon}
                </div>
              </div>
              <div>
                <p style={{ ...serif, fontSize:34, fontWeight:600, color:"#0D2137", margin:"0 0 4px", lineHeight:1 }}>{k.value}</p>
                <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Portfolio Risk ── */}
        <div className="chart-row">
          <div style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:14, padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", minWidth:0 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:600, color:"#0D2137", margin:"0 0 3px" }}>Score Distribution</h2>
                <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>Risk score spread across recent assessments</p>
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {[
                  { label:"High (80+)",   color:"#A3E635" },
                  { label:"Moderate",     color:"#F59E0B" },
                  { label:"High Risk",    color:"#EF4444" },
                ].map((leg) => (
                  <div key={leg.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:leg.color, display:"inline-block" }} />
                    <span style={{ fontSize:11, color:"#94A3B8" }}>{leg.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ScoreDistributionChart assessments={stats.recentAssessments} />
          </div>

          <div style={{ background:"#0D2137", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", display:"flex", flexDirection:"column", gap:18 }}>
            <div>
              <h2 style={{ fontSize:14, fontWeight:600, color:"#fff", margin:"0 0 3px" }}>Portfolio Risk</h2>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Current breakdown</p>
            </div>

            {[
              { label:"High approval", value: stats.lowRisk,    color:"#A3E635", pct: Math.round((stats.lowRisk / Math.max(stats.totalAssessments,1))*100) },
              { label:"Moderate risk", value: stats.mediumRisk, color:"#F59E0B", pct: Math.round((stats.mediumRisk / Math.max(stats.totalAssessments,1))*100) },
              { label:"High risk",     value: stats.highRisk,   color:"#EF4444", pct: Math.round((stats.highRisk / Math.max(stats.totalAssessments,1))*100) },
            ].map((row) => (
              <div key={row.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{row.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{row.value}</span>
                </div>
                <div style={{ height:5, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ width:`${row.pct}%`, height:"100%", background:row.color, borderRadius:3, transition:"width 0.8s ease" }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop:"auto", padding:"14px", background:"rgba(163,230,53,0.08)", border:"1px solid rgba(163,230,53,0.15)", borderRadius:10 }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"0 0 4px" }}>Average score</p>
              <p style={{ ...serif, fontSize:34, fontWeight:600, color:"#A3E635", margin:"0 0 2px", lineHeight:1 }}>{stats.averageScore}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>Out of 100</p>
            </div>
          </div>
        </div>

        {/* ── Recent Assessments ── */}
        <div style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px", borderBottom:"1px solid #F1F5F9", flexWrap:"wrap", gap:10 }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:600, color:"#0D2137", margin:"0 0 2px" }}>Recent Assessments</h2>
              <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>Latest planning risk reports across your portfolio</p>
            </div>
            <a href="/assessments" style={{ fontSize:12, fontWeight:600, color:"#639922", textDecoration:"none", background:"#EAF3DE", padding:"6px 14px", borderRadius:7, whiteSpace:"nowrap" }}>
              View all →
            </a>
          </div>

          {/* Column headers (hidden on mobile) */}
          <div className="table-head" style={{ padding:"10px 20px", background:"#FAFBFC", fontSize:10, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", color:"#94A3B8", borderBottom:"1px solid #F1F5F9" }}>
            <span>Property</span>
            <span>Score</span>
            <span>Risk</span>
            <span>Likelihood</span>
            <span style={{ textAlign:"right" }}>Action</span>
          </div>

          {stats.recentAssessments.length === 0 && (
            <div style={{ padding:"48px 20px", textAlign:"center" }}>
              <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>No assessments yet. Run your first assessment to see results here.</p>
            </div>
          )}

          <div style={{ padding: stats.recentAssessments.length ? "0 20px" : 0 }}>
            {stats.recentAssessments.map((a: any, i: number) => (
              <div key={a.id} className="assess-row" style={{
                padding:"16px 0",
                borderBottom: i < stats.recentAssessments.length - 1 ? "1px solid #F8FAFC" : "none",
              }}>
                {/* Address */}
                <div style={{ display:"flex", alignItems:"center", gap:12, minWidth:0 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:"#F1F5F9", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                    </svg>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"#0D2137", margin:"0 0 2px", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.projects?.address ?? "—"}</p>
                    <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{a.projects?.borough ?? "London"} · {a.projects?.project_type ?? ""}</p>
                  </div>
                </div>

                {/* Score (desktop col) */}
                <div className="desktop-only-col" style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <span style={{ ...serif, fontSize:22, fontWeight:600, color:"#0D2137", lineHeight:1 }}>{a.score}</span>
                  <MiniBar value={a.score} />
                </div>

                {/* Risk (desktop col) */}
                <div className="desktop-only-col"><ScoreBadge score={a.score} /></div>

                {/* Likelihood (desktop col) */}
                <span className="desktop-only-col" style={{ fontSize:12, color:"#475569", fontWeight:500 }}>{a.approval_likelihood}</span>

                {/* Action (desktop col) */}
                <div className="desktop-only-col" style={{ display:"flex", justifyContent:"flex-end" }}>
                  <a href={`/reports/${a.id}`} style={{ fontSize:12, fontWeight:600, color:"#639922", textDecoration:"none", padding:"5px 12px", border:"1px solid #D1FAE5", borderRadius:6, background:"#F0FDF4", whiteSpace:"nowrap" }}>
                    View →
                  </a>
                </div>

                {/* Mobile-only stacked meta + action */}
                <div className="row-meta-mobile mobile-only-row">
                  <span style={{ ...serif, fontSize:18, fontWeight:600, color:"#0D2137" }}>{a.score}</span>
                  <ScoreBadge score={a.score} />
                  <span style={{ fontSize:12, color:"#475569" }}>{a.approval_likelihood}</span>
                </div>
                <div className="row-action-mobile mobile-only-row">
                  <a href={`/reports/${a.id}`} style={{ fontSize:12, fontWeight:600, color:"#639922", textDecoration:"none", padding:"6px 14px", border:"1px solid #D1FAE5", borderRadius:6, background:"#F0FDF4" }}>
                    View report →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .mobile-only-row { display: none; }
        @media (max-width: 640px) {
          .desktop-only-col { display: none !important; }
          .mobile-only-row  { display: flex !important; }
        }
      `}</style>
    </>
  );
}
