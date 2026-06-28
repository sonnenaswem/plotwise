"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAssessments } from "@/services/assessments/assessment-service";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };

function ScoreBadge({ score }: { score: number }) {
  const cfg =
    score >= 80 ? { bg:"#ECFDF5", color:"#059669", label:"High Approval" } :
    score >= 60 ? { bg:"#FFFBEB", color:"#D97706", label:"Moderate" } :
                  { bg:"#FEF2F2", color:"#DC2626", label:"High Risk" };
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, background:cfg.bg, color:cfg.color }}>
      {cfg.label}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#A3E635" : score >= 60 ? "#F59E0B" : "#EF4444";
  const r = 22, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#F1F5F9" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition:"stroke-dasharray 0.8s ease" }} />
      <text x="28" y="33" textAnchor="middle" fill="#0D2137" fontSize="13" fontWeight="700" fontFamily="'Fraunces', Georgia, serif">{score}</text>
    </svg>
  );
}

export default function ReportsPage() {
  const [reports, setReports]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all"|"high"|"moderate"|"risk">("all");

  useEffect(() => {
    async function load() {
      const result = await getAssessments();
      setReports(result.data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = reports.filter((r) => {
    if (filter === "high")     return r.score >= 80;
    if (filter === "moderate") return r.score >= 60 && r.score < 80;
    if (filter === "risk")     return r.score < 60;
    return true;
  });

  const filterTabs: { key: typeof filter; label: string; count: number }[] = [
    { key:"all",      label:"All reports",   count: reports.length },
    { key:"high",     label:"High approval", count: reports.filter(r => r.score >= 80).length },
    { key:"moderate", label:"Moderate",      count: reports.filter(r => r.score >= 60 && r.score < 80).length },
    { key:"risk",     label:"High risk",     count: reports.filter(r => r.score < 60).length },
  ];

  return (
    <div style={{ ...sans, maxWidth:1100 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ ...serif, fontSize:32, fontWeight:300, color:"#0D2137", letterSpacing:"-0.5px", margin:"0 0 4px" }}>Assessment Reports</h1>
          <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>View and download your planning risk reports</p>
        </div>
      </div>

      {/* Summary KPIs */}
      {!loading && reports.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {filterTabs.map((t) => (
            <div key={t.key} style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:10, padding:"14px 18px" }}>
              <p style={{ fontSize:12, color:"#64748B", margin:"0 0 4px" }}>{t.label}</p>
              <p style={{ ...serif, fontSize:26, fontWeight:600, color:"#0D2137", margin:0 }}>{t.count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:"#F1F5F9", padding:4, borderRadius:10, width:"fit-content" }}>
        {filterTabs.map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            fontSize:12, fontWeight:600, padding:"7px 16px", borderRadius:7, border:"none", cursor:"pointer",
            background: filter === t.key ? "#fff" : "transparent",
            color: filter === t.key ? "#0D2137" : "#64748B",
            boxShadow: filter === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition:"all 0.15s",
          }}>
            {t.label} <span style={{ marginLeft:4, fontSize:11, color: filter === t.key ? "#A3E635" : "#94A3B8", fontWeight:700 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
          <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #EAF3DE", borderTop:"3px solid #A3E635", animation:"spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:14, padding:"64px 24px", textAlign:"center" }}>
          <div style={{ width:52, height:52, background:"#F2FCE4", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p style={{ fontSize:15, fontWeight:600, color:"#0D2137", margin:"0 0 6px" }}>No reports found</p>
          <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>
            {filter === "all" ? "Run assessments on your projects to generate reports." : "No reports match this filter."}
          </p>
          {filter === "all" && (
            <Link href="/assessments" style={{ fontSize:13, fontWeight:600, color:"#0B1628", background:"#A3E635", padding:"9px 20px", borderRadius:8, textDecoration:"none" }}>
              Go to Assessments
            </Link>
          )}
        </div>
      )}

      {/* Reports grid */}
      {!loading && filtered.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.map((report) => (
            <div key={report.id} style={{
              background:"#fff", border:"1px solid #E8EDF2", borderRadius:14,
              padding:"20px 24px", display:"grid", gridTemplateColumns:"56px 1fr auto auto",
              gap:16, alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
              transition:"box-shadow 0.15s, transform 0.15s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="none"; }}
            >
              {/* Score ring */}
              <ScoreRing score={report.score} />

              {/* Info */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:"#0D2137", margin:0 }}>{report.projects?.address ?? "Unknown address"}</p>
                  <ScoreBadge score={report.score} />
                </div>
                <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 6px" }}>
                  {report.projects?.borough ?? "London"} · {report.projects?.project_type ?? ""}
                </p>
                <p style={{ fontSize:12, color:"#64748B", margin:0 }}>{report.approval_likelihood}</p>
              </div>

              {/* Score bar */}
              <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end", minWidth:80 }}>
                <span style={{ fontSize:11, color:"#94A3B8" }}>Approval probability</span>
                <span style={{ fontSize:18, fontWeight:700, color: report.score >= 80 ? "#16A34A" : report.score >= 60 ? "#D97706" : "#DC2626" }}>
                  {report.approval_probability}%
                </span>
              </div>

              {/* Action */}
              <Link href={`/reports/${report.id}`} style={{
                fontSize:13, fontWeight:600, color:"#0B1628", background:"#A3E635",
                padding:"9px 18px", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap",
              }}>
                View Report →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
