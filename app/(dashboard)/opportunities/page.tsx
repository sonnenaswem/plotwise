"use client";

import { useState, useEffect } from "react";
import { PROJECT_TYPES } from "@/constants/project-types";
import { getOpportunityData } from "@/services/opportunities/opportunity-service";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const TEAL  = "#0E7490";

function RateBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? "#A3E635" : rate >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 80, height: 4, background: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${rate}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{rate}%</span>
    </div>
  );
}

export default function OpportunitiesPage() {
  const [selectedType, setSelectedType] = useState("");
  const [results, setResults]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  async function runSearch() {
    if (!selectedType) return;
    setLoading(true);
    const data = await getOpportunityData(selectedType);
    setResults(data);
    setLoading(false);
    setHasSearched(true);
  }

  const topBorough = results[0] ?? null;

  return (
    <div style={{ ...sans, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ ...serif, fontSize: 32, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", margin: "0 0 4px" }}>Opportunity Finder</h1>
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Identify the highest-approval boroughs for your proposed development type</p>
      </div>

      {/* Search panel */}
      <div style={{ background: `linear-gradient(135deg, #0D2137, ${TEAL})`, borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.4px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 10px" }}>Find your best location</p>
        <h2 style={{ ...serif, fontSize: 22, fontWeight: 300, color: "#fff", letterSpacing: "-0.3px", margin: "0 0 20px" }}>
          Which London boroughs have the highest approval rates for your project type?
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Select project type
            </label>
            <select
              value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 8, outline: "none", color: selectedType ? "#0B1628" : "#64748B", background: "#fff", fontFamily: "'Inter', system-ui, sans-serif", boxSizing: "border-box" as const }}
            >
              <option value="">Choose a project type…</option>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={runSearch} disabled={!selectedType || loading} style={{
            fontSize: 14, fontWeight: 700, padding: "12px 24px",
            background: (!selectedType || loading) ? "rgba(255,255,255,0.2)" : "#A3E635",
            color: (!selectedType || loading) ? "rgba(255,255,255,0.5)" : "#0B1628",
            border: "none", borderRadius: 8, cursor: (!selectedType || loading) ? "not-allowed" : "pointer",
            whiteSpace: "nowrap" as const,
          }}>
            {loading ? "Searching…" : "Find Opportunities →"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #EAF3DE", borderTop: "3px solid #A3E635", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Top recommendation */}
      {!loading && topBorough && (
        <div style={{ background: "#fff", border: "2px solid #A3E635", borderRadius: 14, padding: "22px 24px", marginBottom: 20, boxShadow: "0 4px 16px rgba(163,230,53,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3B6D11", background: "#EAF3DE", padding: "3px 10px", borderRadius: 99 }}>⭐ Top recommendation</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>for {selectedType}</span>
              </div>
              <p style={{ ...serif, fontSize: 28, fontWeight: 600, color: "#0D2137", margin: "0 0 6px", letterSpacing: "-0.3px" }}>{topBorough.borough}</p>
              <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 4px" }}>
                {topBorough.approved} approvals · {topBorough.refused} refusals · {topBorough.total} total applications
              </p>
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
                This borough has the highest historical approval rate for {selectedType} projects in Greater London.
              </p>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0, paddingLeft: 24 }}>
              <p style={{ ...serif, fontSize: 48, fontWeight: 700, color: "#A3E635", margin: "0 0 2px", lineHeight: 1 }}>{topBorough.approvalRate}%</p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>approval rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Results table */}
      {!loading && hasSearched && results.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#0D2137", margin: "0 0 2px" }}>All Boroughs — {selectedType}</h2>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Ranked by historical approval rate</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "32px 2fr 80px 80px 80px 1fr", padding: "10px 24px", background: "#FAFBFC", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", borderBottom: "1px solid #F1F5F9" }}>
            <span>#</span><span>Borough</span><span>Total</span><span>Approved</span><span>Refused</span><span>Approval rate</span>
          </div>

          {results.map((b, i) => (
            <div key={b.borough} style={{
              display: "grid", gridTemplateColumns: "32px 2fr 80px 80px 80px 1fr",
              padding: "14px 24px", alignItems: "center",
              borderBottom: i < results.length - 1 ? "1px solid #F8FAFC" : "none",
              background: i === 0 ? "rgba(163,230,53,0.03)" : "transparent",
              transition: "background 0.15s",
            }}
              onMouseEnter={(e) => { if (i !== 0) e.currentTarget.style.background = "#FAFBFC"; }}
              onMouseLeave={(e) => { if (i !== 0) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? "#639922" : "#CBD5E1" }}>#{i + 1}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: "#0D2137" }}>{b.borough}</span>
                {i === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "#639922", background: "#EAF3DE", padding: "2px 7px", borderRadius: 99 }}>BEST</span>}
              </div>
              <span style={{ fontSize: 13, color: "#475569" }}>{b.total}</span>
              <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 500 }}>{b.approved}</span>
              <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>{b.refused}</span>
              <RateBar rate={b.approvalRate} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state after search */}
      {!loading && hasSearched && results.length === 0 && (
        <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0D2137", margin: "0 0 4px" }}>No data found</p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No historical applications found for {selectedType} in Greater London.</p>
        </div>
      )}

      {/* Pre-search state */}
      {!hasSearched && !loading && (
        <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, background: "#F0F9FF", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#0D2137", margin: "0 0 6px" }}>Select a project type to begin</p>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>We&apos;ll rank all London boroughs by historical approval rate for your chosen project type.</p>
        </div>
      )}
    </div>
  );
}
