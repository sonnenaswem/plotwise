"use client";

import { useEffect, useState } from "react";
import { getBoroughInsights } from "@/services/boroughs/borough-service";
import { getPortfolioInsights } from "@/services/portfolio/portfolio-service";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const NAVY  = "#0D2137";
const LIME  = "#A3E635";

/* ── tiny helpers ── */
function StatCard({ label, value, sub, accent, bg, icon }: { label: string; value: string | number; sub: string; accent: string; bg: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent, borderRadius: "12px 0 0 12px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "#64748B", margin: 0, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</p>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      </div>
      <p style={{ ...serif, fontSize: 32, fontWeight: 600, color: NAVY, margin: "0 0 2px", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>{sub}</p>
    </div>
  );
}

function ApprovalBar({ label, rate, total, rank }: { label: string; rate: number; total: number; rank: number }) {
  const color = rate >= 70 ? LIME : rate >= 50 ? "#F59E0B" : "#EF4444";
  const isTop = rank <= 3;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 180px 1fr 56px", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F8FAFC" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: isTop ? "#0E7490" : "#CBD5E1" }}>#{rank}</span>
      <span style={{ fontSize: 13, fontWeight: rank === 1 ? 700 : 500, color: NAVY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${rate}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, textAlign: "right" }}>{rate}%</span>
    </div>
  );
}

function InsightCard({ title, value, detail, color, bg }: { title: string; value: string; detail: string; color: string; bg: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 12, padding: "18px 20px", borderLeft: `3px solid ${color}` }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{title}</p>
      <p style={{ ...serif, fontSize: 26, fontWeight: 600, color, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>{detail}</p>
    </div>
  );
}

export default function TrendsPage() {
  const [boroughs, setBoroughs]   = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<"boroughs"|"types"|"risk">("boroughs");

  useEffect(() => {
    Promise.all([getBoroughInsights(), getPortfolioInsights()]).then(([b, p]) => {
      setBoroughs(b);
      setPortfolio(p);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ ...sans, display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #EAF3DE", borderTop: `3px solid ${LIME}`, animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Loading planning trends…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── derived stats ── */
  const totalApps    = boroughs.reduce((s, b) => s + b.total, 0);
  const totalApproved = boroughs.reduce((s, b) => s + b.approved, 0);
  const totalRefused  = boroughs.reduce((s, b) => s + b.refused, 0);
  const overallRate   = totalApps ? Math.round((totalApproved / totalApps) * 100) : 0;
  const sorted        = [...boroughs].sort((a, b) => b.approvalRate - a.approvalRate);
  const best          = sorted[0];
  const worst         = sorted[sorted.length - 1];

  /* score distribution from portfolio */
  const assessments   = portfolio?.latestAssessments ?? [];
  const highCount     = assessments.filter((a: any) => a.score >= 80).length;
  const modCount      = assessments.filter((a: any) => a.score >= 60 && a.score < 80).length;
  const lowCount      = assessments.filter((a: any) => a.score < 60).length;
  const total         = assessments.length || 1;

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "boroughs", label: "Borough performance" },
    { key: "types",    label: "Risk score breakdown" },
    { key: "risk",     label: "Market insights" },
  ];

  return (
    <div style={{ ...sans, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ ...serif, fontSize: 32, fontWeight: 300, color: NAVY, letterSpacing: "-0.5px", margin: "0 0 4px" }}>Planning Trends</h1>
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Historical planning intelligence across Greater London</p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Total applications"  value={totalApps.toLocaleString()} sub="In London database" accent={LIME} bg="#F2FCE4"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
        <StatCard label="Overall approval rate" value={`${overallRate}%`}  sub="Across all boroughs" accent="#0E7490" bg="#F0F9FF"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E7490" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
        <StatCard label="Total approved"      value={totalApproved.toLocaleString()} sub="Granted planning permission" accent="#10B981" bg="#ECFDF5"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>} />
        <StatCard label="Total refused"       value={totalRefused.toLocaleString()} sub="Planning denied" accent="#EF4444" bg="#FEF2F2"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>} />
      </div>

      {/* Best / Worst spotlight */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #A7F3D0", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>🏆</span>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#059669", margin: 0, textTransform: "uppercase", letterSpacing: "0.6px" }}>Highest approval borough</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ ...serif, fontSize: 22, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{best?.borough}</p>
              <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 2px" }}>{best?.approved} approved of {best?.total} applications</p>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Best performing London borough</p>
            </div>
            <div style={{ textAlign: "center", padding: "10px 16px", background: "#ECFDF5", borderRadius: 10 }}>
              <p style={{ ...serif, fontSize: 36, fontWeight: 700, color: "#059669", margin: "0 0 2px", lineHeight: 1 }}>{best?.approvalRate}%</p>
              <p style={{ fontSize: 11, color: "#059669", margin: 0, opacity: 0.7 }}>approval rate</p>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #FECACA", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", margin: 0, textTransform: "uppercase", letterSpacing: "0.6px" }}>Most challenging borough</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <p style={{ ...serif, fontSize: 22, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{worst?.borough}</p>
              <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 2px" }}>{worst?.refused} refused of {worst?.total} applications</p>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Toughest planning environment</p>
            </div>
            <div style={{ textAlign: "center", padding: "10px 16px", background: "#FEF2F2", borderRadius: 10 }}>
              <p style={{ ...serif, fontSize: 36, fontWeight: 700, color: "#DC2626", margin: "0 0 2px", lineHeight: 1 }}>{worst?.approvalRate}%</p>
              <p style={{ fontSize: 11, color: "#DC2626", margin: 0, opacity: 0.7 }}>approval rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ display: "flex", gap: 4, background: "#F1F5F9", padding: 4, borderRadius: 10, width: "fit-content", marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            fontSize: 12, fontWeight: 600, padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer",
            fontFamily: "'Inter', system-ui, sans-serif",
            background: activeTab === t.key ? "#fff" : "transparent",
            color: activeTab === t.key ? NAVY : "#64748B",
            boxShadow: activeTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab: Borough performance */}
      {activeTab === "boroughs" && (
        <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 2px" }}>Borough Approval Rankings</h2>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>All {sorted.length} London boroughs ranked by historical approval rate</p>
          </div>
          <div style={{ padding: "8px 24px 16px" }}>
            {sorted.map((b, i) => (
              <ApprovalBar key={b.borough} label={b.borough} rate={b.approvalRate} total={b.total} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Risk score breakdown */}
      {activeTab === "types" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Score distribution visualised */}
          <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>Risk Score Distribution</h2>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 20px" }}>Based on {assessments.length} assessments in your portfolio</p>

            {[
              { label: "High approval (80–100)", count: highCount,  color: LIME,      bg: "#F2FCE4", pct: Math.round((highCount / total) * 100) },
              { label: "Moderate (60–79)",       count: modCount,   color: "#F59E0B", bg: "#FFFBEB", pct: Math.round((modCount / total) * 100) },
              { label: "High risk (0–59)",       count: lowCount,   color: "#EF4444", bg: "#FEF2F2", pct: Math.round((lowCount / total) * 100) },
            ].map((row) => (
              <div key={row.label} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: row.color, display: "inline-block" }} />
                    <span style={{ fontSize: 13, color: "#475569" }}>{row.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{row.count}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: row.bg, color: row.color }}>{row.pct}%</span>
                  </div>
                </div>
                <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${row.pct}%`, height: "100%", background: row.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Borough approval rate mini-table */}
          <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 2px" }}>Top 10 Boroughs by Volume</h2>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Highest application volumes across Greater London</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 80px 80px 80px 100px", padding: "10px 24px", background: "#FAFBFC", fontSize: 10, fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", borderBottom: "1px solid #F1F5F9" }}>
              <span>Borough</span><span>Total</span><span>Approved</span><span>Refused</span><span>Rate</span>
            </div>
            {[...boroughs].sort((a, b) => b.total - a.total).slice(0, 10).map((b, i) => (
              <div key={b.borough} style={{
                display: "grid", gridTemplateColumns: "1.8fr 80px 80px 80px 100px",
                padding: "12px 24px", alignItems: "center",
                borderBottom: i < 9 ? "1px solid #F8FAFC" : "none",
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: NAVY }}>{b.borough}</span>
                <span style={{ fontSize: 13, color: "#475569" }}>{b.total}</span>
                <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 500 }}>{b.approved}</span>
                <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>{b.refused}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.approvalRate >= 70 ? "#16A34A" : b.approvalRate >= 50 ? "#D97706" : "#DC2626" }}>{b.approvalRate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Market insights */}
      {activeTab === "risk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            <InsightCard title="London-wide approval rate" value={`${overallRate}%`}
              detail="Historical average across all boroughs and project types"
              color="#0E7490" bg="#F0F9FF" />
            <InsightCard title="Best borough rate" value={best ? `${best.approvalRate}%` : "—"}
              detail={best ? `${best.borough} — highest approval rate in Greater London` : "No data"}
              color="#059669" bg="#ECFDF5" />
            <InsightCard title="Riskiest borough" value={worst ? `${worst.approvalRate}%` : "—"}
              detail={worst ? `${worst.borough} — lowest approval rate in Greater London` : "No data"}
              color="#DC2626" bg="#FEF2F2" />
          </div>

          {/* Strategic guidance */}
          <div style={{ background: NAVY, borderRadius: 14, padding: "28px 32px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: LIME, margin: "0 0 10px" }}>Strategic guidance</p>
            <h2 style={{ ...serif, fontSize: 22, fontWeight: 300, color: "#fff", margin: "0 0 20px", letterSpacing: "-0.3px" }}>
              What the data tells us
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { icon: "📍", title: "Location is paramount", body: `Approval rates vary by up to ${best && worst ? best.approvalRate - worst.approvalRate : "—"}% between London boroughs. Borough selection is the single biggest variable in planning success.` },
                { icon: "📊", title: "Volume signals consistency", body: "High-volume boroughs have more predictable outcomes. Boroughs with large datasets give you stronger comparable evidence for your application." },
                { icon: "⚡", title: "Front-load your risk analysis", body: "The data shows planning constraints are the primary driver of refusals. Checking constraints before acquiring a site saves significant cost." },
                { icon: "🔄", title: "Similar applications matter", body: "Historical decisions in the same area and project type are the strongest predictor of outcome. PlotWise surfaces these automatically." },
              ].map((tip) => (
                <div key={tip.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{tip.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{tip.title}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>{tip.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution table */}
          <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 2px" }}>Borough Risk Bands</h2>
              <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>How each borough falls into approval risk categories</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
              {[
                { label: "Favourable (70%+)",    boroughs: sorted.filter(b => b.approvalRate >= 70),             color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
                { label: "Moderate (50–69%)",    boroughs: sorted.filter(b => b.approvalRate >= 50 && b.approvalRate < 70), color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
                { label: "High risk (<50%)",     boroughs: sorted.filter(b => b.approvalRate < 50),              color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
              ].map((band, bi) => (
                <div key={band.label} style={{ padding: "16px 20px", borderRight: bi < 2 ? "1px solid #F1F5F9" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: band.color, background: band.bg, border: `1px solid ${band.border}`, padding: "3px 8px", borderRadius: 99 }}>{band.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#94A3B8", margin: "0 0 10px" }}>{band.boroughs.length} borough{band.boroughs.length !== 1 ? "s" : ""}</p>
                  {band.boroughs.map(b => (
                    <div key={b.borough} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, borderBottom: "1px solid #F8FAFC" }}>
                      <span style={{ color: "#475569" }}>{b.borough}</span>
                      <span style={{ fontWeight: 600, color: band.color }}>{b.approvalRate}%</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
