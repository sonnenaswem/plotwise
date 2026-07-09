"use client";

import { useEffect, useState } from "react";
import { getBoroughInsights } from "@/services/boroughs/borough-service";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const TEAL  = "#0E7490";

function ApprovalBar({ rate }: { rate: number }) {
  const color = rate >= 70 ? "#A3E635" : rate >= 50 ? "#F59E0B" : "#EF4444";
  return (
    <div className="borough-approval-bar" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0, height: 5, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${rate}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 36, textAlign: "right" }}>{rate}%</span>
    </div>
  );
}

export default function BoroughsPage() {
  const [boroughs, setBoroughs] = useState<any[]>([]);
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState<"rate"|"total"|"name">("rate");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    getBoroughInsights().then(setBoroughs);
  }, []);

  const filtered = boroughs
    .filter((b) => b.borough.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "rate")  return b.approvalRate - a.approvalRate;
      if (sort === "total") return b.total - a.total;
      return a.borough.localeCompare(b.borough);
    });

  const best  = boroughs[0] ?? null;
  const worst = boroughs[boroughs.length - 1] ?? null;

  return (
    <>
      <style>{`
        .boroughs-page,
        .boroughs-page * {
          box-sizing: border-box;
        }

        .boroughs-page {
          width: 100%;
          max-width: 1100px;
          min-width: 0;
        }

        .borough-card,
        .borough-table-card {
          width: 100%;
          min-width: 0;
        }

        .borough-highlight-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .borough-controls {
          width: 100%;
          min-width: 0;
        }

        .borough-search {
          width: 100%;
          min-width: 0;
        }

        .borough-sort-controls {
          max-width: 100%;
        }

        .borough-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .borough-table-inner {
          min-width: 720px;
        }

        .borough-safe-text {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        @media (max-width: 900px) {
          .borough-highlight-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }

        @media (max-width: 700px) {
          .boroughs-page {
            max-width: none;
          }

          .borough-controls {
            align-items: stretch !important;
            flex-direction: column;
          }

          .borough-search {
            max-width: none !important;
          }

          .borough-sort-controls {
            width: 100%;
          }

          .borough-sort-controls button {
            flex: 1 1 0;
            min-width: 0;
            white-space: normal;
          }

          .borough-card-content,
          .borough-card-top {
            align-items: stretch !important;
            flex-direction: column;
            gap: 12px;
          }

          .borough-score {
            text-align: left !important;
          }
        }

        @media (max-width: 560px) {
          .borough-header {
            margin-bottom: 20px !important;
          }

          .borough-header h1 {
            font-size: 28px !important;
          }

          .borough-card {
            padding: 17px !important;
          }

          .borough-table-inner {
            min-width: 680px;
          }
        }
      `}</style>

      <div className="boroughs-page" style={sans}>

      {/* Header */}
      <div className="borough-header" style={{ marginBottom: 28 }}>
        <h1 style={{ ...serif, fontSize: 32, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", margin: "0 0 4px" }}>Borough Intelligence</h1>
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Historical planning approval performance across Greater London</p>
      </div>

      {/* Best / Worst highlight cards */}
      <div className="borough-highlight-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {[
          { title: "Best Performing Borough",   data: best,  border: "#A7F3D0", bg: "linear-gradient(135deg, #ECFDF5, #F0FDF4)", scoreColor: "#059669", tag: "🏆 Top rated" },
          { title: "Lowest Performing Borough", data: worst, border: "#FECACA", bg: "linear-gradient(135deg, #FEF2F2, #FFF5F5)", scoreColor: "#DC2626", tag: "⚠️ Needs caution" },
        ].map((card) => (
          <div className="borough-card" key={card.title} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="borough-card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", margin: 0, textTransform: "uppercase", letterSpacing: "0.6px" }}>{card.title}</p>
              <span style={{ fontSize: 11, fontWeight: 600, color: card.scoreColor, background: "rgba(255,255,255,0.6)", padding: "3px 8px", borderRadius: 99 }}>{card.tag}</span>
            </div>
            {card.data ? (
              <div className="borough-card-content" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14 }}>
                <div className="borough-safe-text">
                  <p style={{ ...serif, fontSize: 22, fontWeight: 600, color: "#0D2137", margin: "0 0 4px" }}>{card.data.borough}</p>
                  <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 2px" }}>{card.data.approved} approved · {card.data.refused} refused</p>
                  <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Total: {card.data.total} applications</p>
                </div>
                <div className="borough-score" style={{ textAlign: "center" }}>
                  <p style={{ ...serif, fontSize: 36, fontWeight: 700, color: card.scoreColor, margin: "0 0 2px", lineHeight: 1 }}>{card.data.approvalRate}%</p>
                  <p style={{ fontSize: 11, color: card.scoreColor, margin: 0, opacity: 0.7 }}>approval rate</p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Loading…</p>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="borough-controls" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
        <div className="borough-search" style={{ position: "relative", flex: 1, maxWidth: 320 }}>
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
        <div className="borough-sort-controls" style={{ display: "flex", gap: 4, background: "#F1F5F9", padding: 4, borderRadius: 8 }}>
          {[["rate","By approval rate"],["total","By volume"],["name","A–Z"]] .map(([key, label]) => (
            <button key={key} onClick={() => setSort(key as any)} style={{
              fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
              background: sort === key ? "#fff" : "transparent",
              color: sort === key ? "#0D2137" : "#64748B",
              boxShadow: sort === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Borough table */}
      <div className="borough-table-card" style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 24 }}>
        <div className="borough-table-scroll">
          <div className="borough-table-inner">
            <div style={{ display: "grid", gridTemplateColumns: "32px 1.8fr 80px 80px 80px 1.2fr", padding: "10px 24px", background: "#FAFBFC", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", borderBottom: "1px solid #F1F5F9" }}>
              <span>#</span><span>Borough</span><span>Total</span><span>Approved</span><span>Refused</span><span>Approval rate</span>
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>No boroughs match your search.</p>
              </div>
            )}

            {filtered.map((b, i) => {
              const rank = boroughs.findIndex((x) => x.borough === b.borough) + 1;
              const isTop = rank <= 3;
              return (
                <div key={b.borough} style={{
                  display: "grid", gridTemplateColumns: "32px 1.8fr 80px 80px 80px 1.2fr",
                  padding: "14px 24px", alignItems: "center",
                  borderBottom: i < filtered.length - 1 ? "1px solid #F8FAFC" : "none",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFBFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: isTop ? TEAL : "#CBD5E1" }}>#{rank}</span>
                  <span className="borough-safe-text" style={{ fontSize: 13, fontWeight: 600, color: "#0D2137" }}>{b.borough}</span>
                  <span style={{ fontSize: 13, color: "#475569" }}>{b.total}</span>
                  <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 500 }}>{b.approved}</span>
                  <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>{b.refused}</span>
                  <ApprovalBar rate={b.approvalRate} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
