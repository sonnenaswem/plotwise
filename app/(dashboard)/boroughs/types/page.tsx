"use client";

import { useEffect, useState } from "react";
import { getBoroughProjectTypeInsights } from "@/services/boroughs/borough-service";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const TEAL  = "#0E7490";

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? "#A3E635" : rate >= 50 ? "#F59E0B" : "#EF4444";
  const bg    = rate >= 70 ? "#F2FCE4"  : rate >= 50 ? "#FFFBEB"  : "#FEF2F2";
  const text  = rate >= 70 ? "#3B6D11"  : rate >= 50 ? "#92400E"  : "#991B1B";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
      <div style={{ flex: 1, height: 4, background: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${rate}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: bg, color: text, minWidth: 40, textAlign: "center" }}>
        {rate}%
      </span>
    </div>
  );
}

export default function BoroughTypePage() {
  const [data, setData]       = useState<any[]>([]);
  const [search, setSearch]   = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    getBoroughProjectTypeInsights().then(setData);
  }, []);

  const filtered = data.filter((b) => b.borough.toLowerCase().includes(search.toLowerCase()));

  function toggle(borough: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(borough) ? next.delete(borough) : next.add(borough);
      return next;
    });
  }

  return (
    <div style={{ ...sans, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ ...serif, fontSize: 32, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", margin: "0 0 4px" }}>Project Type Intelligence</h1>
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Historical approval rates by borough and project type across Greater London</p>
      </div>

      {/* Search + count */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", maxWidth: 320 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search boroughs…"
            style={{ width: "100%", padding: "9px 12px 9px 36px", fontSize: 13, border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none", background: "#fff", boxSizing: "border-box" as const, fontFamily: "'Inter', system-ui, sans-serif", color: "#0B1628" }}
            onFocus={(e) => (e.target.style.borderColor = TEAL)} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setExpanded(new Set(data.map((b) => b.borough)))} style={{ fontSize: 12, fontWeight: 600, color: TEAL, background: "#F0F9FF", border: `1px solid ${TEAL}33`, borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>Expand all</button>
          <button onClick={() => setExpanded(new Set())} style={{ fontSize: 12, fontWeight: 600, color: "#64748B", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 7, padding: "6px 14px", cursor: "pointer" }}>Collapse all</button>
        </div>
      </div>

      {/* Borough accordion cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((borough) => {
          const isOpen = expanded.has(borough.borough);
          const best   = [...borough.projectTypes].sort((a: any, b: any) => b.approvalRate - a.approvalRate)[0];
          return (
            <div key={borough.borough} style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              {/* Accordion header */}
              <button onClick={() => toggle(borough.borough)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "#F0F9FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#0D2137", margin: "0 0 2px" }}>{borough.borough}</p>
                    <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
                      {borough.projectTypes.length} project type{borough.projectTypes.length !== 1 ? "s" : ""}
                      {best && <span style={{ color: "#639922", marginLeft: 8 }}>· Best: {best.projectType} ({best.approvalRate}%)</span>}
                    </p>
                  </div>
                </div>
                <svg style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Expanded rows */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #F1F5F9" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", padding: "8px 22px", background: "#FAFBFC", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", borderBottom: "1px solid #F1F5F9" }}>
                    <span>Project Type</span><span>Approval Rate</span>
                  </div>
                  {[...borough.projectTypes]
                    .sort((a: any, b: any) => b.approvalRate - a.approvalRate)
                    .map((type: any, i: number, arr: any[]) => (
                    <div key={type.projectType} style={{
                      display: "grid", gridTemplateColumns: "2fr 1fr", padding: "12px 22px", alignItems: "center",
                      borderBottom: i < arr.length - 1 ? "1px solid #F8FAFC" : "none",
                      transition: "background 0.15s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{type.projectType}</span>
                      <RateBar rate={type.approvalRate} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !data.length && (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #EAF3DE", borderTop: "3px solid #A3E635", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
    </div>
  );
}
