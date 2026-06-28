"use client";

import { use, useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getAssessmentById } from "@/services/reports/report-service";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const TEAL  = "#0E7490";

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "15px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC", display: "flex", alignItems: "center", gap: 8 }}>
        {icon && <span>{icon}</span>}
        <h2 style={{ fontSize: 11, fontWeight: 700, color: "#0D2137", margin: 0, textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</h2>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #F8FAFC" }}>
      <span style={{ fontSize: 13, color: "#64748B" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#0D2137" }}>{value}</span>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#A3E635" : score >= 60 ? "#F59E0B" : "#EF4444";
  const label = score >= 80 ? "High Likelihood of Approval" : score >= 60 ? "Moderate Likelihood of Approval" : "Higher Planning Risk";
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform="rotate(-90 68 68)" style={{ transition: "stroke-dasharray 1.2s ease" }} />
        <text x="68" y="62" textAnchor="middle" fill="#fff" fontSize="34" fontWeight="700" fontFamily="'Fraunces', Georgia, serif">{score}</text>
        <text x="68" y="80" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="12" fontFamily="'Inter', system-ui, sans-serif">/ 100</text>
      </svg>
      <span style={{ fontSize: 13, fontWeight: 600, color, textAlign: "center", maxWidth: 180, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }          = use(params);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    getAssessmentById(id).then((r) => setReport(r.data));
  }, [id]);

  async function exportPdf() {
    const el = document.getElementById("report-content");
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#F8FAFC" });
    const img    = canvas.toDataURL("image/png");
    const pdf    = new jsPDF("p", "mm", "a4");
    const pw     = pdf.internal.pageSize.getWidth();
    const ph     = pdf.internal.pageSize.getHeight();
    const ih     = (canvas.height * pw) / canvas.width;
    let left = ih, pos = 0;
    pdf.addImage(img, "PNG", 0, pos, pw, ih);
    left -= ph;
    while (left > 0) { pos = left - ih; pdf.addPage(); pdf.addImage(img, "PNG", 0, pos, pw, ih); left -= ph; }
    pdf.save("PlotWise-Assessment-Report.pdf");
  }

  if (!report) {
    return (
      <div style={{ ...sans, display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #EAF3DE", borderTop: "3px solid #A3E635", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Loading report…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const recommendation =
    report.score >= 80 ? "Strong likelihood of approval. Proceed with confidence while maintaining full compliance with local planning policy. Ensure design quality is maintained throughout." :
    report.score >= 60 ? "Reasonable planning prospects. Review design details carefully before submission and consider pre-application advice to strengthen your case." :
    report.score >= 40 ? "Planning risks identified. Consider design revisions and pre-application engagement with the local authority before proceeding to formal submission." :
                         "Significant planning risks detected. Professional planning advice is strongly recommended before committing further resources to this site.";

  const scoreColor = report.score >= 80 ? "#A3E635" : report.score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div style={{ ...sans, maxWidth: 920 }}>

      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: TEAL, margin: "0 0 6px" }}>
            Planning Assessment Report
          </p>
          <h1 style={{ ...serif, fontSize: 30, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", margin: "0 0 4px" }}>
            {report.projects?.address ?? "Assessment Report"}
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
            {report.projects?.borough} · {report.projects?.project_type}
          </p>
        </div>
        <button onClick={exportPdf} style={{
          display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700,
          color: "#0B1628", background: "#A3E635", border: "none", borderRadius: 8,
          padding: "10px 18px", cursor: "pointer", flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export PDF
        </button>
      </div>

      <div id="report-content" style={{ background: "#F8FAFC", padding: 24, borderRadius: 16 }}>

        {/* ── PDF HEADER (shows in download) ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #E8EDF2" }}>
          <div>
            <p style={{ ...serif, fontSize: 22, fontWeight: 600, color: "#0D2137", margin: "0 0 2px" }}>
              Plot<span style={{ color: TEAL }}>Wise</span>
            </p>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: 0, letterSpacing: "0.5px" }}>PLANNING INTELLIGENCE FOR BETTER DECISIONS</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 2px" }}>Report generated</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#0D2137", margin: 0 }}>{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </div>

        {/* ── HERO SCORE CARD ── */}
        <div style={{
          background: `linear-gradient(135deg, #0D2137 0%, ${TEAL} 100%)`,
          borderRadius: 16, padding: "32px 36px", marginBottom: 16,
          display: "grid", gridTemplateColumns: "auto 1fr", gap: 40, alignItems: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 20, bottom: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)", pointerEvents: "none" }} />

          <ScoreGauge score={report.score} />

          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.4px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 10px" }}>Assessment Summary</p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 460 }}>{report.summary}</p>

            <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
              {[
                { label: "Approval Probability", value: `${report.approval_probability}%`, color: scoreColor },
                { label: "Likelihood",           value: report.approval_likelihood,        color: "#fff" },
                { label: "Confidence",           value: report.confidence,                 color: "#fff" },
              ].map((f) => (
                <div key={f.label}>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{f.label}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: f.color, margin: 0 }}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROPERTY INFO ── */}
        <Section title="Property Information" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>}>
          <InfoRow label="Property Address" value={report.projects?.address ?? "—"} />
          <InfoRow label="Borough"          value={report.projects?.borough ?? "—"} />
          <InfoRow label="Project Type"     value={report.projects?.project_type ?? "—"} />
        </Section>

        {/* ── RISK BREAKDOWN ── */}
        <Section title="Risk Score Breakdown" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}>
          <div style={{ marginBottom: 12 }}>
            {report.score_breakdown?.map((item: any, i: number) => {
              const positive = item.impact > 0;
              const neutral  = item.impact === 0;
              return (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 0", borderBottom: "1px solid #F8FAFC",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: positive ? "#A3E635" : neutral ? "#94A3B8" : "#EF4444" }} />
                    <span style={{ fontSize: 13, color: "#475569" }}>{item.reason}</span>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 700, minWidth: 48, textAlign: "right",
                    color: positive ? "#16A34A" : neutral ? "#64748B" : "#DC2626",
                  }}>
                    {item.impact > 0 ? `+${item.impact}` : item.impact}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#0D2137", borderRadius: 10, marginTop: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Final Planning Risk Score</span>
            <span style={{ ...serif, fontSize: 32, fontWeight: 700, color: scoreColor }}>{report.score}</span>
          </div>
        </Section>

        {/* ── PLANNING CONSTRAINTS ── */}
        <Section title="Planning Constraints" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>}>
          {report.constraints?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {report.constraints.map((c: any) => (
                <div key={c.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
                  borderLeft: "3px solid #EF4444",
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0D2137", margin: "0 0 2px" }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>{c.constraint_type}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#DC2626" }}>−{Math.abs(c.risk_penalty)} pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#ECFDF5", borderRadius: 10, border: "1px solid #A7F3D0", borderLeft: "3px solid #10B981" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <p style={{ fontSize: 13, color: "#059669", fontWeight: 600, margin: 0 }}>No planning constraints identified for this site</p>
            </div>
          )}
        </Section>

        {/* ── HISTORICAL + CONFIDENCE ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "15px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: "#0D2137", margin: 0, textTransform: "uppercase", letterSpacing: "0.8px" }}>Historical Approval Rate</h2>
            </div>
            <div style={{ padding: "20px 24px" }}>
              {report.approvalRate !== null ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { label: "Approval rate", value: `${report.approvalRate}%`, color: "#059669", bg: "#ECFDF5" },
                    { label: "Approved",      value: report.approvedCount,      color: "#059669", bg: "#F0FDF4" },
                    { label: "Refused",       value: report.refusedCount,       color: "#DC2626", bg: "#FEF2F2" },
                  ].map((s) => (
                    <div key={s.label} style={{ padding: "12px", background: s.bg, borderRadius: 8, textAlign: "center" }}>
                      <p style={{ ...serif, fontSize: 24, fontWeight: 600, color: s.color, margin: "0 0 3px" }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No comparable application history available.</p>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #E8EDF2", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ padding: "15px 24px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFC", display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <h2 style={{ fontSize: 11, fontWeight: 700, color: "#0D2137", margin: 0, textTransform: "uppercase", letterSpacing: "0.8px" }}>Assessment Confidence</h2>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "center", height: "calc(100% - 52px)", boxSizing: "border-box" }}>
              <p style={{ ...serif, fontSize: 32, fontWeight: 600, color: "#0D2137", margin: "0 0 6px" }}>{report.confidence}</p>
              <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5, margin: 0 }}>Based on available planning constraints and comparable application history.</p>
            </div>
          </div>
        </div>

        {/* ── SIMILAR APPLICATIONS ── */}
        <Section title="Similar Nearby Applications" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}>
          {report.similarApplications?.length > 0 ? (
            <div>
              {/* Summary bar */}
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                {(() => {
                  const approved = report.similarApplications.filter((a: any) => a.decision === "Approved").length;
                  const refused  = report.similarApplications.filter((a: any) => a.decision === "Refused").length;
                  const rate     = Math.round((approved / report.similarApplications.length) * 100);
                  return (
                    <>
                      <div style={{ flex: 1, padding: "10px 14px", background: "#ECFDF5", borderRadius: 8, textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: "#059669", margin: "0 0 2px" }}>{approved}</p>
                        <p style={{ fontSize: 11, color: "#064E3B", margin: 0 }}>Approved</p>
                      </div>
                      <div style={{ flex: 1, padding: "10px 14px", background: "#FEF2F2", borderRadius: 8, textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: "#DC2626", margin: "0 0 2px" }}>{refused}</p>
                        <p style={{ fontSize: 11, color: "#7F1D1D", margin: 0 }}>Refused</p>
                      </div>
                      <div style={{ flex: 1, padding: "10px 14px", background: "#F0F9FF", borderRadius: 8, textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: TEAL, margin: "0 0 2px" }}>{rate}%</p>
                        <p style={{ fontSize: 11, color: "#0C4A6E", margin: 0 }}>Local rate</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {report.similarApplications.map((a: any, i: number) => (
                <div key={a.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0", borderBottom: i < report.similarApplications.length - 1 ? "1px solid #F8FAFC" : "none",
                }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>{a.address}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99,
                    color: a.decision === "Approved" ? "#059669" : "#DC2626",
                    background: a.decision === "Approved" ? "#ECFDF5" : "#FEF2F2",
                  }}>{a.decision}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No similar applications found for this area and project type.</p>
          )}
        </Section>

        {/* ── RECOMMENDATION ── */}
        <div style={{ background: `linear-gradient(135deg, #0D2137 0%, ${TEAL} 100%)`, borderRadius: 14, padding: "24px 28px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 99, background: "rgba(163,230,53,0.15)", border: "1px solid rgba(163,230,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3E635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 8px" }}>Recommendation</p>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.65, margin: 0 }}>{recommendation}</p>
            </div>
          </div>
        </div>

        {/* ── DISCLAIMER ── */}
        <div style={{ padding: "16px 20px", background: "#F1F5F9", borderRadius: 10, border: "1px solid #E2E8F0" }}>
          <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.65, margin: 0, textAlign: "center" }}>
            <strong style={{ color: "#64748B" }}>Legal Disclaimer:</strong> This report is generated by PlotWise using publicly available planning data and a rule-based risk scoring model.
            It is for informational purposes only and does not constitute professional planning or legal advice.
            Always consult a qualified planning consultant before making investment or development decisions.
            PlotWise accepts no liability for decisions made based on this report.
          </p>
        </div>

      </div>
    </div>
  );
}
