"use client";

import { useEffect, useState } from "react";

import {
  getProjects,
  type Project,
} from "@/services/projects/project-service";

import {
  createAssessment,
  getAssessments,
  type Assessment,
} from "@/services/assessments/assessment-service";

import { generateAssessment } from "@/lib/risk-engine";

import { getPlanningConstraints } from "@/services/planning-constraints/planning-constraint-service";

import { getSimilarApplications } from "@/services/planning-applications/planning-application-service";

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

type SimilarApplication = {
  id: string;
  address: string;
  decision: string;
};

type PlanningConstraint = {
  risk_penalty: number;
  constraint_type: string;
};

function ScoreBadge({ score }: { score: number }) {
  const config =
    score >= 80
      ? {
          background: "#ECFDF5",
          color: "#059669",
          label: "High Approval",
          dot: "#059669",
        }
      : score >= 60
        ? {
            background: "#FFFBEB",
            color: "#D97706",
            label: "Moderate",
            dot: "#D97706",
          }
        : {
            background: "#FEF2F2",
            color: "#DC2626",
            label: "High Risk",
            dot: "#DC2626",
          };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
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
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: config.dot,
          display: "inline-block",
        }}
      />

      {config.label}
    </span>
  );
}

export default function AssessmentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assessments, setAssessments] = useState<
    Assessment[]
  >([]);

  const [
    similarApplications,
    setSimilarApplications,
  ] = useState<SimilarApplication[]>([]);

  const [selectedProject, setSelectedProject] =
    useState("");

  const [running, setRunning] = useState(false);
  const [pageLoading, setPageLoading] =
    useState(true);

  const [justRan, setJustRan] = useState<
    string | null
  >(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function loadData() {
    const [projectsResult, assessmentsResult] =
      await Promise.all([
        getProjects(),
        getAssessments(),
      ]);

    if (projectsResult.error) {
      throw projectsResult.error;
    }

    if (assessmentsResult.error) {
      throw assessmentsResult.error;
    }

    setProjects(projectsResult.data);
    setAssessments(assessmentsResult.data);
  }

  useEffect(() => {
    async function initializePage() {
      try {
        setErrorMessage("");
        await loadData();
      } catch (error) {
        console.error(
          "Assessment page loading failed:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Assessment data could not be loaded."
        );
      } finally {
        setPageLoading(false);
      }
    }

    void initializePage();
  }, []);

  async function runAssessment() {
    const project = projects.find(
      (item) => item.id === selectedProject
    );

    if (!project) {
      setErrorMessage(
        "Please select a valid project."
      );
      return;
    }

    if (!project.borough) {
      setErrorMessage(
        "This project has no borough assigned."
      );
      return;
    }

    setRunning(true);
    setErrorMessage("");
    setSimilarApplications([]);

    try {
      const constraintResult =
        await getPlanningConstraints(
          project.borough
        );

      if (constraintResult.error) {
        throw new Error(
          constraintResult.error.message
        );
      }

      const constraints =
        (constraintResult.data ??
          []) as PlanningConstraint[];

      const penalties = constraints.map(
        (constraint) =>
          Number(constraint.risk_penalty ?? 0)
      );

      const names = constraints.map(
        (constraint) =>
          constraint.constraint_type
      );

      const applicationResult =
        await getSimilarApplications(
          project.borough,
          project.project_type
        );

      if (applicationResult.error) {
        throw new Error(
          applicationResult.error.message
        );
      }

      const applications =
        (applicationResult.data ??
          []) as SimilarApplication[];

      setSimilarApplications(applications);

      const approved = applications.filter(
        (application) =>
          application.decision
            .trim()
            .toLowerCase() === "approved"
      ).length;

      const refused = applications.filter(
        (application) =>
          application.decision
            .trim()
            .toLowerCase() === "refused"
      ).length;

      const result = generateAssessment(
        project.project_type,
        penalties,
        names,
        approved,
        refused
      );

      const assessmentResult =
        await createAssessment({
          projectId: project.id,
          score: result.score,
          approvalLikelihood:
            result.approvalLikelihood,
          approvalProbability:
            result.approvalProbability,
          summary: result.summary,
          scoreBreakdown:
            result.scoreBreakdown,
        });

      if (assessmentResult.error) {
        throw assessmentResult.error;
      }

      setJustRan(project.id);
      await loadData();
    } catch (error) {
      console.error(
        "Assessment generation failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The assessment could not be completed."
      );
    } finally {
      setRunning(false);
    }
  }

  const selectedProjectData = projects.find(
    (project) => project.id === selectedProject
  );

  if (pageLoading) {
    return (
      <div
        style={{
          ...sans,
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748B",
          fontSize: 14,
        }}
      >
        Loading assessments...
      </div>
    );
  }

  return (
    <>
      <style>{`
        .assessment-page {
          width: 100%;
          max-width: 1100px;
        }

        .assessment-run-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: end;
        }

        .assessment-preview {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .assessment-table-header,
        .assessment-row {
          display: grid;
          grid-template-columns:
            minmax(220px, 2fr)
            minmax(60px, 0.7fr)
            110px
            120px
            110px
            80px;
          align-items: center;
        }

        .assessment-mobile-details {
          display: none;
        }

        .similar-application-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 900px) {
          .assessment-table-header {
            display: none;
          }

          .assessment-history-body {
            padding: 14px;
          }

          .assessment-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 14px;
            padding: 16px !important;
            margin-bottom: 12px;
            border: 1px solid #E8EDF2 !important;
            border-radius: 12px;
            background: #FFFFFF;
          }

          .assessment-row:last-child {
            margin-bottom: 0;
          }

          .assessment-desktop-cell {
            display: none !important;
          }

          .assessment-mobile-details {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
          }

          .assessment-mobile-report {
            width: 100%;
            display: flex;
            justify-content: flex-end;
          }
        }

        @media (max-width: 640px) {
          .assessment-run-panel {
            padding: 18px !important;
          }

          .assessment-run-header {
            flex-direction: column;
            gap: 12px;
          }

          .assessment-run-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .assessment-run-button {
            width: 100%;
          }

          .assessment-preview {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }

          .assessment-history-header {
            padding: 16px !important;
          }

          .similar-application-row {
            align-items: flex-start;
            padding: 14px 16px !important;
          }

          .similar-application-address {
            min-width: 0;
            overflow-wrap: anywhere;
          }
        }
      `}</style>

      <div
        style={sans}
        className="assessment-page"
      >
        <div style={{ marginBottom: 28 }}>
          <h1
            style={{
              ...serif,
              fontSize: 32,
              fontWeight: 300,
              color: "#0D2137",
              letterSpacing: "-0.5px",
              margin: "0 0 4px",
            }}
          >
            Assessments
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#94A3B8",
              margin: 0,
            }}
          >
            Generate and review planning risk
            assessments
          </p>
        </div>

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

        <div
          className="assessment-run-panel"
          style={{
            background: "#fff",
            border: "1px solid #E8EDF2",
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="assessment-run-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#0D2137",
                  margin: "0 0 3px",
                }}
              >
                Run New Assessment
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                  margin: 0,
                }}
              >
                Select a project to analyse its
                planning risk profile
              </p>
            </div>

            <span
              style={{
                width: "fit-content",
                fontSize: 11,
                fontWeight: 600,
                color: "#639922",
                background: "#EAF3DE",
                padding: "4px 10px",
                borderRadius: 99,
                border: "1px solid #D1FAE5",
                whiteSpace: "nowrap",
              }}
            >
              ⚡ Rule-based engine
            </span>
          </div>

          <div className="assessment-run-grid">
            <div>
              <label
                htmlFor="assessment-project"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Select Project
              </label>

              <select
                id="assessment-project"
                value={selectedProject}
                disabled={running}
                onChange={(event) =>
                  setSelectedProject(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "11px 13px",
                  fontSize: 13,
                  border:
                    "1.5px solid #E2E8F0",
                  borderRadius: 8,
                  outline: "none",
                  color: selectedProject
                    ? "#0B1628"
                    : "#94A3B8",
                  background: "#F8FAFC",
                  boxSizing: "border-box",
                  fontFamily:
                    "'Inter', system-ui, sans-serif",
                }}
              >
                <option value="">
                  Choose a project…
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.address} —{" "}
                    {project.borough ?? "No borough"}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="assessment-run-button"
              onClick={() => {
                void runAssessment();
              }}
              disabled={
                !selectedProject || running
              }
              style={{
                fontSize: 13,
                fontWeight: 700,
                padding: "11px 22px",
                background:
                  !selectedProject || running
                    ? "#CBD5E1"
                    : "#A3E635",
                color: "#0B1628",
                border: "none",
                borderRadius: 8,
                cursor:
                  !selectedProject || running
                    ? "not-allowed"
                    : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {running
                ? "Running…"
                : "Run Assessment"}
            </button>
          </div>

          {projects.length === 0 ? (
            <p
              style={{
                margin: "14px 0 0",
                fontSize: 12,
                color: "#B45309",
              }}
            >
              Create a project before running an
              assessment.
            </p>
          ) : null}

          {selectedProjectData ? (
            <div
              className="assessment-preview"
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "#F8FAFC",
                borderRadius: 8,
                border: "1px solid #E2E8F0",
              }}
            >
              {[
                {
                  label: "Address",
                  value:
                    selectedProjectData.address,
                },
                {
                  label: "Borough",
                  value:
                    selectedProjectData.borough ??
                    "Not assigned",
                },
                {
                  label: "Type",
                  value:
                    selectedProjectData.project_type,
                },
              ].map((field) => (
                <div key={field.label}>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                      color: "#94A3B8",
                      margin: "0 0 2px",
                    }}
                  >
                    {field.label}
                  </p>

                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#0D2137",
                      margin: 0,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div
          style={{
            background: "#fff",
            border: "1px solid #E8EDF2",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="assessment-history-header"
            style={{
              padding: "18px 24px",
              borderBottom:
                "1px solid #F1F5F9",
            }}
          >
            <h2
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0D2137",
                margin: "0 0 2px",
              }}
            >
              Assessment History
            </h2>

            <p
              style={{
                fontSize: 12,
                color: "#94A3B8",
                margin: 0,
              }}
            >
              {assessments.length} assessment
              {assessments.length !== 1
                ? "s"
                : ""}{" "}
              total
            </p>
          </div>

          <div
            className="assessment-table-header"
            style={{
              padding: "10px 24px",
              background: "#FAFBFC",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              color: "#94A3B8",
              borderBottom:
                "1px solid #F1F5F9",
            }}
          >
            <span>Property</span>
            <span>Score</span>
            <span>Risk</span>
            <span>Likelihood</span>
            <span>Probability</span>
            <span style={{ textAlign: "right" }}>
              Report
            </span>
          </div>

          {assessments.length === 0 ? (
            <div
              style={{
                padding: "56px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "#F2FCE4",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#639922"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect
                    x="8"
                    y="2"
                    width="8"
                    height="4"
                    rx="1"
                  />
                </svg>
              </div>

              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0D2137",
                  margin: "0 0 4px",
                }}
              >
                No assessments yet
              </p>

              <p
                style={{
                  fontSize: 13,
                  color: "#94A3B8",
                  margin: 0,
                }}
              >
                Select a project above and run your
                first assessment.
              </p>
            </div>
          ) : null}

          <div className="assessment-history-body">
            {assessments.map(
              (assessment, index) => (
                <div
                  key={assessment.id}
                  className="assessment-row"
                  style={{
                    padding: "15px 24px",
                    borderBottom:
                      index <
                      assessments.length - 1
                        ? "1px solid #F8FAFC"
                        : "none",
                    background:
                      justRan &&
                      assessment.project_id ===
                        justRan &&
                      index === 0
                        ? "#FAFFF5"
                        : "transparent",
                    transition:
                      "background 0.15s",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background =
                      "#FAFBFC";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background =
                      justRan &&
                      assessment.project_id ===
                        justRan &&
                      index === 0
                        ? "#FAFFF5"
                        : "transparent";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: "#EAF3DE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#639922"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                        <circle
                          cx="12"
                          cy="9"
                          r="2.5"
                        />
                      </svg>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0D2137",
                          margin: "0 0 2px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {assessment.projects
                          ?.address ?? "—"}
                      </p>

                      <p
                        style={{
                          fontSize: 11,
                          color: "#94A3B8",
                          margin: 0,
                        }}
                      >
                        {assessment.projects
                          ?.borough ?? ""}
                      </p>
                    </div>
                  </div>

                  <span
                    className="assessment-desktop-cell"
                    style={{
                      ...serif,
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#0D2137",
                    }}
                  >
                    {assessment.score}
                  </span>

                  <div className="assessment-desktop-cell">
                    <ScoreBadge
                      score={assessment.score}
                    />
                  </div>

                  <span
                    className="assessment-desktop-cell"
                    style={{
                      fontSize: 12,
                      color: "#475569",
                    }}
                  >
                    {
                      assessment.approval_likelihood
                    }
                  </span>

                  <span
                    className="assessment-desktop-cell"
                    style={{
                      fontSize: 12,
                      color: "#475569",
                    }}
                  >
                    {
                      assessment.approval_probability
                    }
                    %
                  </span>

                  <div
                    className="assessment-desktop-cell"
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <a
                      href={`/reports/${assessment.id}`}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#639922",
                        textDecoration: "none",
                        padding: "5px 12px",
                        border:
                          "1px solid #D1FAE5",
                        borderRadius: 6,
                        background: "#F0FDF4",
                      }}
                    >
                      View →
                    </a>
                  </div>

                  <div className="assessment-mobile-details">
                    <span
                      style={{
                        ...serif,
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#0D2137",
                      }}
                    >
                      {assessment.score}
                    </span>

                    <ScoreBadge
                      score={assessment.score}
                    />

                    <span
                      style={{
                        fontSize: 12,
                        color: "#475569",
                      }}
                    >
                      {
                        assessment.approval_probability
                      }
                      %
                    </span>
                  </div>

                  <div className="assessment-mobile-details">
                    <span
                      style={{
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      Likelihood
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      {
                        assessment.approval_likelihood
                      }
                    </span>
                  </div>

                  <div className="assessment-mobile-details assessment-mobile-report">
                    <a
                      href={`/reports/${assessment.id}`}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#639922",
                        textDecoration: "none",
                        padding: "7px 14px",
                        border:
                          "1px solid #D1FAE5",
                        borderRadius: 6,
                        background: "#F0FDF4",
                      }}
                    >
                      View report →
                    </a>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {similarApplications.length > 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #E8EDF2",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.04)",
              marginTop: 24,
            }}
          >
            <div
              style={{
                padding: "18px 24px",
                borderBottom:
                  "1px solid #F1F5F9",
              }}
            >
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0D2137",
                  margin: "0 0 2px",
                }}
              >
                Similar Applications Found
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: "#94A3B8",
                  margin: 0,
                }}
              >
                {similarApplications.length}{" "}
                comparable applications from the
                last assessment
              </p>
            </div>

            {similarApplications.map(
              (application, index) => {
                const approved =
                  application.decision
                    .trim()
                    .toLowerCase() ===
                  "approved";

                return (
                  <div
                    key={application.id}
                    className="similar-application-row"
                    style={{
                      padding: "12px 24px",
                      fontSize: 13,
                      borderBottom:
                        index <
                        similarApplications.length -
                          1
                          ? "1px solid #F8FAFC"
                          : "none",
                    }}
                  >
                    <span
                      className="similar-application-address"
                      style={{
                        color: "#475569",
                      }}
                    >
                      {application.address}
                    </span>

                    <span
                      style={{
                        fontWeight: 600,
                        color: approved
                          ? "#16A34A"
                          : "#DC2626",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {application.decision}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}