"use client";

import { useEffect, useState } from "react";
import {
  createProject,
  getProjects,
  type Project,
} from "@/services/projects/project-service";
import { PROJECT_TYPES } from "@/constants/project-types";
import { BOROUGHS } from "@/constants/boroughs";

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  fontSize: 13,
  border: "1.5px solid #E2E8F0",
  borderRadius: 8,
  outline: "none",
  color: "#0B1628",
  background: "#F8FAFC",
  boxSizing: "border-box",
  fontFamily: "'Inter', system-ui, sans-serif",
};

function ProjectTypeTag({ type }: { type: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 99,
        background: "#EFF6FF",
        color: "#2563EB",
      }}
    >
      {type}
    </span>
  );
}

export default function ProjectsPage() {
  const [address, setAddress] = useState("");

  const [projectType, setProjectType] = useState<string>(
    PROJECT_TYPES[0] ?? ""
  );

  const [borough, setBorough] = useState<string>(
    BOROUGHS[0] ?? ""
  );

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadProjects() {
    setErrorMessage("");

    const result = await getProjects();

    if (result.error) {
      setErrorMessage(result.error.message);
      setProjects([]);
      return;
    }

    setProjects(result.data);
  }

  useEffect(() => {
    async function init() {
      try {
        await loadProjects();
      } finally {
        setPageLoading(false);
      }
    }

    void init();
  }, []);

  async function handleCreate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const result = await createProject({
        address,
        borough,
        projectType,
      });

      if (result.error) {
        setErrorMessage(result.error.message);
        return;
      }

      setAddress("");
      setBorough(BOROUGHS[0] ?? "");
      setProjectType(PROJECT_TYPES[0] ?? "");
      setFormOpen(false);

      await loadProjects();
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div
        style={{
          ...sans,
          display: "flex",
          minHeight: "50vh",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748B",
          fontSize: 14,
        }}
      >
        Loading projects...
      </div>
    );
  }

  return (
    <div
      style={{
        ...sans,
        maxWidth: 1100,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
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
            Projects
          </h1>

          <p
            style={{
              fontSize: 14,
              color: "#94A3B8",
              margin: 0,
            }}
          >
            Manage your planning project portfolio
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen((current) => !current)}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#0B1628",
            background: "#A3E635",
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          {formOpen ? "Cancel" : "+ New Project"}
        </button>
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
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      {formOpen ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #E8EDF2",
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#0D2137",
              margin: "0 0 20px",
            }}
          >
            New Project
          </h2>

          <form
            onSubmit={handleCreate}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <label
                htmlFor="project-address"
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
                Property Address
              </label>

              <input
                id="project-address"
                style={inputStyle}
                placeholder="e.g. 12 Ladbroke Grove, London W11 2NX"
                value={address}
                required
                disabled={loading}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                onFocus={(event) => {
                  event.currentTarget.style.borderColor =
                    "#639922";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor =
                    "#E2E8F0";
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label
                  htmlFor="project-borough"
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
                  Borough
                </label>

                <select
                  id="project-borough"
                  style={inputStyle}
                  value={borough}
                  disabled={loading}
                  onChange={(event) =>
                    setBorough(event.target.value)
                  }
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor =
                      "#639922";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor =
                      "#E2E8F0";
                  }}
                >
                  {BOROUGHS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="project-type"
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
                  Project Type
                </label>

                <select
                  id="project-type"
                  style={inputStyle}
                  value={projectType}
                  disabled={loading}
                  onChange={(event) =>
                    setProjectType(event.target.value)
                  }
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor =
                      "#639922";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor =
                      "#E2E8F0";
                  }}
                >
                  {PROJECT_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                paddingTop: 4,
              }}
            >
              <button
                type="button"
                disabled={loading}
                onClick={() => setFormOpen(false)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748B",
                  background: "#F1F5F9",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0B1628",
                  background: loading
                    ? "#CBD5E1"
                    : "#A3E635",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Total Projects",
            value: projects.length,
          },
          {
            label: "Boroughs",
            value: new Set(
              projects
                .map((project) => project.borough)
                .filter(
                  (value): value is string =>
                    typeof value === "string" &&
                    value.length > 0
                )
            ).size,
          },
          {
            label: "Project Types",
            value: new Set(
              projects.map(
                (project) => project.project_type
              )
            ).size,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#fff",
              border: "1px solid #E8EDF2",
              borderRadius: 10,
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#64748B",
              }}
            >
              {stat.label}
            </span>

            <span
              style={{
                ...serif,
                fontSize: 22,
                fontWeight: 600,
                color: "#0D2137",
              }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #E8EDF2",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <h2
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#0D2137",
              margin: 0,
            }}
          >
            All Projects
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 100px",
            padding: "10px 24px",
            background: "#FAFBFC",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            color: "#94A3B8",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <span>Address</span>
          <span>Borough</span>
          <span>Project Type</span>
          <span style={{ textAlign: "right" }}>Added</span>
        </div>

        {projects.length === 0 ? (
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
                background: "#F1F5F9",
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
                stroke="#94A3B8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
              No projects yet
            </p>

            <p
              style={{
                fontSize: 13,
                color: "#94A3B8",
                margin: "0 0 16px",
              }}
            >
              Create your first project to start assessing
              planning risk.
            </p>

            <button
              type="button"
              onClick={() => setFormOpen(true)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0B1628",
                background: "#A3E635",
                border: "none",
                borderRadius: 8,
                padding: "9px 18px",
                cursor: "pointer",
              }}
            >
              + New Project
            </button>
          </div>
        ) : null}

        {projects.map((project, index) => (
          <div
            key={project.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 100px",
              padding: "16px 24px",
              alignItems: "center",
              borderBottom:
                index < projects.length - 1
                  ? "1px solid #F8FAFC"
                  : "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                "#FAFBFC";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                "transparent";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: "#EFF6FF",
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
                  stroke="#2563EB"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>

              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0D2137",
                  margin: 0,
                }}
              >
                {project.address}
              </p>
            </div>

            <span
              style={{
                fontSize: 13,
                color: "#475569",
              }}
            >
              {project.borough ?? "—"}
            </span>

            <ProjectTypeTag type={project.project_type} />

            <span
              style={{
                fontSize: 12,
                color: "#94A3B8",
                textAlign: "right",
              }}
            >
              {project.created_at
                ? new Date(
                    project.created_at
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}