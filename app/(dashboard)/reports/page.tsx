"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  getAssessments,
  type Assessment,
} from "@/services/assessments/assessment-service";

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

type ReportFilter =
  | "all"
  | "high"
  | "moderate"
  | "risk";

function ScoreBadge({ score }: { score: number }) {
  const config =
    score >= 80
      ? {
          background: "#ECFDF5",
          color: "#059669",
          label: "High Approval",
        }
      : score >= 60
        ? {
            background: "#FFFBEB",
            color: "#D97706",
            label: "Moderate",
          }
        : {
            background: "#FEF2F2",
            color: "#DC2626",
            label: "High Risk",
          };

  return (
    <span
      style={{
        display: "inline-flex",
        width: "fit-content",
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 99,
        background: config.background,
        color: config.color,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const safeScore = Math.max(
    0,
    Math.min(100, Number(score) || 0)
  );

  const color =
    safeScore >= 80
      ? "#A3E635"
      : safeScore >= 60
        ? "#F59E0B"
        : "#EF4444";

  const radius = 22;
  const circumference =
    2 * Math.PI * radius;

  const dash =
    (safeScore / 100) * circumference;

  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      aria-label={`Assessment score ${safeScore}`}
      role="img"
    >
      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke="#F1F5F9"
        strokeWidth="4"
      />

      <circle
        cx="28"
        cy="28"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${
          circumference - dash
        }`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{
          transition:
            "stroke-dasharray 0.8s ease",
        }}
      />

      <text
        x="28"
        y="33"
        textAnchor="middle"
        fill="#0D2137"
        fontSize="13"
        fontWeight="700"
        fontFamily="'Fraunces', Georgia, serif"
      >
        {safeScore}
      </text>
    </svg>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<
    Assessment[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [filter, setFilter] =
    useState<ReportFilter>("all");

  useEffect(() => {
    async function loadReports() {
      try {
        setErrorMessage("");

        const result =
          await getAssessments();

        if (result.error) {
          throw result.error;
        }

        setReports(result.data);
      } catch (error) {
        console.error(
          "Reports loading failed:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Reports could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (filter === "high") {
        return report.score >= 80;
      }

      if (filter === "moderate") {
        return (
          report.score >= 60 &&
          report.score < 80
        );
      }

      if (filter === "risk") {
        return report.score < 60;
      }

      return true;
    });
  }, [filter, reports]);

  const filterTabs: Array<{
    key: ReportFilter;
    label: string;
    count: number;
  }> = [
    {
      key: "all",
      label: "All reports",
      count: reports.length,
    },
    {
      key: "high",
      label: "High approval",
      count: reports.filter(
        (report) => report.score >= 80
      ).length,
    },
    {
      key: "moderate",
      label: "Moderate",
      count: reports.filter(
        (report) =>
          report.score >= 60 &&
          report.score < 80
      ).length,
    },
    {
      key: "risk",
      label: "High risk",
      count: reports.filter(
        (report) => report.score < 60
      ).length,
    },
  ];

  return (
    <>
      <style>{`
        .reports-page {
          width: 100%;
          max-width: 1100px;
        }

        .reports-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .reports-filter-scroll {
          max-width: 100%;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: thin;
        }

        .reports-filter-tabs {
          display: flex;
          width: max-content;
          min-width: min-content;
          gap: 4px;
          padding: 4px;
          border-radius: 10px;
          background: #F1F5F9;
        }

        .report-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .report-list-card {
          display: grid;
          grid-template-columns:
            56px
            minmax(0, 1fr)
            auto
            auto;
          gap: 16px;
          align-items: center;
        }

        .report-card-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .report-probability {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          min-width: 100px;
        }

        @media (max-width: 900px) {
          .reports-summary-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .report-list-card {
            grid-template-columns:
              56px
              minmax(0, 1fr)
              auto;
            grid-template-areas:
              "ring info probability"
              "ring action action";
          }

          .report-score-ring {
            grid-area: ring;
          }

          .report-info {
            grid-area: info;
          }

          .report-probability {
            grid-area: probability;
          }

          .report-action {
            grid-area: action;
            justify-self: end;
          }
        }

        @media (max-width: 640px) {
          .reports-page-title {
            font-size: 28px !important;
          }

          .reports-summary-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .reports-summary-card {
            padding: 14px !important;
          }

          .report-list-card {
            grid-template-columns:
              48px
              minmax(0, 1fr);
            grid-template-areas:
              "ring info"
              "probability probability"
              "action action";
            padding: 18px !important;
            gap: 14px;
          }

          .report-probability {
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid #F1F5F9;
          }

          .report-action {
            width: 100%;
          }

          .report-action-link {
            display: flex !important;
            width: 100%;
            justify-content: center;
            box-sizing: border-box;
          }
        }

        @media (max-width: 400px) {
          .reports-summary-grid {
            grid-template-columns:
              minmax(0, 1fr);
          }
        }
      `}</style>

      <main
        className="reports-page"
        style={sans}
      >
        <header
          style={{
            marginBottom: 28,
          }}
        >
          <h1
            className="reports-page-title"
            style={{
              ...serif,
              fontSize: 32,
              fontWeight: 300,
              color: "#0D2137",
              letterSpacing: "-0.5px",
              margin: "0 0 4px",
            }}
          >
            Assessment Reports
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#94A3B8",
              margin: 0,
            }}
          >
            View and download your planning risk
            reports
          </p>
        </header>

        {errorMessage ? (
          <div
            role="alert"
            style={{
              marginBottom: 20,
              padding: "12px 14px",
              border: "1px solid #FECACA",
              borderRadius: 8,
              background: "#FEF2F2",
              color: "#B91C1C",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        {!loading && reports.length > 0 ? (
          <section className="reports-summary-grid">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className="reports-summary-card"
                onClick={() =>
                  setFilter(tab.key)
                }
                style={{
                  padding: "14px 18px",
                  textAlign: "left",
                  border:
                    filter === tab.key
                      ? "1px solid #A3E635"
                      : "1px solid #E8EDF2",
                  borderRadius: 10,
                  background:
                    filter === tab.key
                      ? "#FAFFF5"
                      : "#FFFFFF",
                  cursor: "pointer",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.03)",
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    color: "#64748B",
                    margin: "0 0 4px",
                  }}
                >
                  {tab.label}
                </p>

                <p
                  style={{
                    ...serif,
                    fontSize: 26,
                    fontWeight: 600,
                    color: "#0D2137",
                    margin: 0,
                  }}
                >
                  {tab.count}
                </p>
              </button>
            ))}
          </section>
        ) : null}

        <div
          className="reports-filter-scroll"
          style={{
            marginBottom: 20,
          }}
        >
          <div className="reports-filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  setFilter(tab.key)
                }
                aria-pressed={
                  filter === tab.key
                }
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "7px 16px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  background:
                    filter === tab.key
                      ? "#FFFFFF"
                      : "transparent",
                  color:
                    filter === tab.key
                      ? "#0D2137"
                      : "#64748B",
                  boxShadow:
                    filter === tab.key
                      ? "0 1px 3px rgba(0,0,0,0.08)"
                      : "none",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}

                <span
                  style={{
                    marginLeft: 4,
                    fontSize: 11,
                    color:
                      filter === tab.key
                        ? "#639922"
                        : "#94A3B8",
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px 0",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border:
                  "3px solid #EAF3DE",
                borderTop:
                  "3px solid #A3E635",
                animation:
                  "report-spin 0.8s linear infinite",
              }}
            />

            <style>{`
              @keyframes report-spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </div>
        ) : null}

        {!loading &&
        filteredReports.length === 0 ? (
          <section
            style={{
              padding: "64px 24px",
              textAlign: "center",
              border: "1px solid #E8EDF2",
              borderRadius: 14,
              background: "#FFFFFF",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                borderRadius: 14,
                background: "#F2FCE4",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#639922"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>

            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#0D2137",
                margin: "0 0 6px",
              }}
            >
              No reports found
            </p>

            <p
              style={{
                fontSize: 13,
                color: "#94A3B8",
                margin: "0 0 20px",
              }}
            >
              {filter === "all"
                ? "Run assessments on your projects to generate reports."
                : "No reports match this filter."}
            </p>

            {filter === "all" ? (
              <Link
                href="/assessments"
                style={{
                  display: "inline-flex",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0B1628",
                  background: "#A3E635",
                  padding: "9px 20px",
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Go to Assessments
              </Link>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setFilter("all")
                }
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#475569",
                  background: "#F1F5F9",
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Clear filter
              </button>
            )}
          </section>
        ) : null}

        {!loading &&
        filteredReports.length > 0 ? (
          <section className="report-list">
            {filteredReports.map((report) => (
              <article
                key={report.id}
                className="report-list-card"
                style={{
                  padding: "20px 24px",
                  border:
                    "1px solid #E8EDF2",
                  borderRadius: 14,
                  background: "#FFFFFF",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.04)",
                  transition:
                    "box-shadow 0.15s, transform 0.15s",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.08)";

                  event.currentTarget.style.transform =
                    "translateY(-1px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.04)";

                  event.currentTarget.style.transform =
                    "none";
                }}
              >
                <div className="report-score-ring">
                  <ScoreRing
                    score={report.score}
                  />
                </div>

                <div
                  className="report-info"
                  style={{
                    minWidth: 0,
                  }}
                >
                  <div className="report-card-heading">
                    <p
                      style={{
                        minWidth: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0D2137",
                        margin: 0,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {report.projects
                        ?.address ??
                        "Unknown address"}
                    </p>

                    <ScoreBadge
                      score={report.score}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 12,
                      color: "#94A3B8",
                      margin: "4px 0 6px",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {report.projects?.borough ??
                      "Borough unavailable"}{" "}
                    ·{" "}
                    {report.projects
                      ?.project_type ??
                      "Project type unavailable"}
                  </p>

                  <p
                    style={{
                      fontSize: 12,
                      color: "#64748B",
                      margin: 0,
                    }}
                  >
                    {
                      report.approval_likelihood
                    }
                  </p>
                </div>

                <div className="report-probability">
                  <span
                    style={{
                      fontSize: 11,
                      color: "#94A3B8",
                    }}
                  >
                    Approval probability
                  </span>

                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color:
                        report.score >= 80
                          ? "#16A34A"
                          : report.score >=
                              60
                            ? "#D97706"
                            : "#DC2626",
                    }}
                  >
                    {
                      report.approval_probability
                    }
                    %
                  </span>
                </div>

                <div className="report-action">
                  <Link
                    className="report-action-link"
                    href={`/reports/${report.id}`}
                    style={{
                      display: "inline-flex",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0B1628",
                      background: "#A3E635",
                      padding: "9px 18px",
                      borderRadius: 8,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Report →
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>
    </>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getAssessments } from "@/services/assessments/assessment-service";

// const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
// const serif = { fontFamily: "'Fraunces', Georgia, serif" };

// function ScoreBadge({ score }: { score: number }) {
//   const cfg =
//     score >= 80 ? { bg:"#ECFDF5", color:"#059669", label:"High Approval" } :
//     score >= 60 ? { bg:"#FFFBEB", color:"#D97706", label:"Moderate" } :
//                   { bg:"#FEF2F2", color:"#DC2626", label:"High Risk" };
//   return (
//     <span style={{ fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, background:cfg.bg, color:cfg.color }}>
//       {cfg.label}
//     </span>
//   );
// }

// function ScoreRing({ score }: { score: number }) {
//   const color = score >= 80 ? "#A3E635" : score >= 60 ? "#F59E0B" : "#EF4444";
//   const r = 22, circ = 2 * Math.PI * r;
//   const dash = (score / 100) * circ;
//   return (
//     <svg width="56" height="56" viewBox="0 0 56 56">
//       <circle cx="28" cy="28" r={r} fill="none" stroke="#F1F5F9" strokeWidth="4" />
//       <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
//         strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
//         strokeLinecap="round" transform="rotate(-90 28 28)" style={{ transition:"stroke-dasharray 0.8s ease" }} />
//       <text x="28" y="33" textAnchor="middle" fill="#0D2137" fontSize="13" fontWeight="700" fontFamily="'Fraunces', Georgia, serif">{score}</text>
//     </svg>
//   );
// }

// export default function ReportsPage() {
//   const [reports, setReports]   = useState<any[]>([]);
//   const [loading, setLoading]   = useState(true);
//   const [filter, setFilter]     = useState<"all"|"high"|"moderate"|"risk">("all");

//   const [errorMessage, setErrorMessage] =
//     useState("");

//   useEffect(() => {
//     async function load() {
//       try {
//         const result = await getAssessments();

//         if (result.error) {
//           throw result.error;
//         }

//         setReports(result.data);
//       } catch (error) {
//         console.error(
//           "Reports loading failed:",
//           error
//         );

//         setErrorMessage(
//           error instanceof Error
//             ? error.message
//             : "Reports could not be loaded."
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     void load();
//   }, []);

//   const filtered = reports.filter((r) => {
//     if (filter === "high")     return r.score >= 80;
//     if (filter === "moderate") return r.score >= 60 && r.score < 80;
//     if (filter === "risk")     return r.score < 60;
//     return true;
//   });

//   const filterTabs: { key: typeof filter; label: string; count: number }[] = [
//     { key:"all",      label:"All reports",   count: reports.length },
//     { key:"high",     label:"High approval", count: reports.filter(r => r.score >= 80).length },
//     { key:"moderate", label:"Moderate",      count: reports.filter(r => r.score >= 60 && r.score < 80).length },
//     { key:"risk",     label:"High risk",     count: reports.filter(r => r.score < 60).length },
//   ];

//   return (
//     <div style={{ ...sans, maxWidth:1100 }}>

//       {/* Header */}
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
//         <div>
//           <h1 style={{ ...serif, fontSize:32, fontWeight:300, color:"#0D2137", letterSpacing:"-0.5px", margin:"0 0 4px" }}>Assessment Reports</h1>
//           <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>View and download your planning risk reports</p>
//         </div>
//       </div>

//       {/* Summary KPIs */}
//       {!loading && reports.length > 0 && (
//         <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
//           {filterTabs.map((t) => (
//             <div key={t.key} style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:10, padding:"14px 18px" }}>
//               <p style={{ fontSize:12, color:"#64748B", margin:"0 0 4px" }}>{t.label}</p>
//               <p style={{ ...serif, fontSize:26, fontWeight:600, color:"#0D2137", margin:0 }}>{t.count}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Filter tabs */}
//       <div style={{ display:"flex", gap:4, marginBottom:20, background:"#F1F5F9", padding:4, borderRadius:10, width:"fit-content" }}>
//         {filterTabs.map((t) => (
//           <button key={t.key} onClick={() => setFilter(t.key)} style={{
//             fontSize:12, fontWeight:600, padding:"7px 16px", borderRadius:7, border:"none", cursor:"pointer",
//             background: filter === t.key ? "#fff" : "transparent",
//             color: filter === t.key ? "#0D2137" : "#64748B",
//             boxShadow: filter === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
//             transition:"all 0.15s",
//           }}>
//             {t.label} <span style={{ marginLeft:4, fontSize:11, color: filter === t.key ? "#A3E635" : "#94A3B8", fontWeight:700 }}>{t.count}</span>
//           </button>
//         ))}
//       </div>
//       {errorMessage ? (
//         <div
//           role="alert"
//           style={{
//             marginBottom: 20,
//             padding: "12px 14px",
//             border: "1px solid #FECACA",
//             borderRadius: 8,
//             background: "#FEF2F2",
//             color: "#B91C1C",
//             fontSize: 13,
//           }}
//         >
//           {errorMessage}
//         </div>
//       ) : null}

//       {/* Loading */}
//       {loading && (
//         <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
//           <div style={{ width:36, height:36, borderRadius:"50%", border:"3px solid #EAF3DE", borderTop:"3px solid #A3E635", animation:"spin 0.8s linear infinite" }} />
//           <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
//         </div>
//       )}

//       {/* Empty state */}
//       {!loading && filtered.length === 0 && (
//         <div style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:14, padding:"64px 24px", textAlign:"center" }}>
//           <div style={{ width:52, height:52, background:"#F2FCE4", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
//             </svg>
//           </div>
//           <p style={{ fontSize:15, fontWeight:600, color:"#0D2137", margin:"0 0 6px" }}>No reports found</p>
//           <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>
//             {filter === "all" ? "Run assessments on your projects to generate reports." : "No reports match this filter."}
//           </p>
//           {filter === "all" && (
//             <Link href="/assessments" style={{ fontSize:13, fontWeight:600, color:"#0B1628", background:"#A3E635", padding:"9px 20px", borderRadius:8, textDecoration:"none" }}>
//               Go to Assessments
//             </Link>
//           )}
//         </div>
//       )}

//       {/* Reports grid */}
//       {!loading && filtered.length > 0 && (
//         <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
//           {filtered.map((report) => (
//             <div key={report.id} style={{
//               background:"#fff", border:"1px solid #E8EDF2", borderRadius:14,
//               padding:"20px 24px", display:"grid", gridTemplateColumns:"56px 1fr auto auto",
//               gap:16, alignItems:"center", boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
//               transition:"box-shadow 0.15s, transform 0.15s",
//             }}
//               onMouseEnter={(e) => { e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform="translateY(-1px)"; }}
//               onMouseLeave={(e) => { e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform="none"; }}
//             >
//               {/* Score ring */}
//               <ScoreRing score={report.score} />

//               {/* Info */}
//               <div>
//                 <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
//                   <p style={{ fontSize:14, fontWeight:600, color:"#0D2137", margin:0 }}>{report.projects?.address ?? "Unknown address"}</p>
//                   <ScoreBadge score={report.score} />
//                 </div>
//                 <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 6px" }}>
//                   {report.projects?.borough ?? "London"} · {report.projects?.project_type ?? ""}
//                 </p>
//                 <p style={{ fontSize:12, color:"#64748B", margin:0 }}>{report.approval_likelihood}</p>
//               </div>

//               {/* Score bar */}
//               <div style={{ display:"flex", flexDirection:"column", gap:4, alignItems:"flex-end", minWidth:80 }}>
//                 <span style={{ fontSize:11, color:"#94A3B8" }}>Approval probability</span>
//                 <span style={{ fontSize:18, fontWeight:700, color: report.score >= 80 ? "#16A34A" : report.score >= 60 ? "#D97706" : "#DC2626" }}>
//                   {report.approval_probability}%
//                 </span>
//               </div>

//               {/* Action */}
//               <Link href={`/reports/${report.id}`} style={{
//                 fontSize:13, fontWeight:600, color:"#0B1628", background:"#A3E635",
//                 padding:"9px 18px", borderRadius:8, textDecoration:"none", whiteSpace:"nowrap",
//               }}>
//                 View Report →
//               </Link>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
