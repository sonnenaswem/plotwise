"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/services/projects/project-service";
import { createAssessment, getAssessments } from "@/services/assessments/assessment-service";
import { generateAssessment } from "@/lib/risk-engine";
import { getPlanningConstraints } from "@/services/planning-constraints/planning-constraint-service";
import { getSimilarApplications } from "@/services/planning-applications/planning-application-service";
import { createClient } from "@/lib/supabase/client";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };

// const ORGANIZATION_ID = "29e9ac31-c3b5-484d-96ba-9fb73eb060c1";

function ScoreBadge({ score }: { score: number }) {
  const cfg =
    score >= 80 ? { bg:"#ECFDF5", color:"#059669", label:"High Approval",  dot:"#059669" } :
    score >= 60 ? { bg:"#FFFBEB", color:"#D97706", label:"Moderate",       dot:"#D97706" } :
                  { bg:"#FEF2F2", color:"#DC2626", label:"High Risk",       dot:"#DC2626" };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:600, padding:"4px 10px", borderRadius:99, background:cfg.bg, color:cfg.color }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot, display:"inline-block" }} />
      {cfg.label}
    </span>
  );
}

export default function AssessmentsPage() {
  const [projects, setProjects]               = useState<any[]>([]);
  const [assessments, setAssessments]         = useState<any[]>([]);
  const [similarApplications, setSimilar]     = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [running, setRunning]                 = useState(false);
  const [justRan, setJustRan]                 = useState<string | null>(null);

  async function loadData() {
    const supabase =
      createClient();


      const {
        data:{
          user
        }
      } =
        await supabase.auth.getUser();


      if (!user) return;


      const [pr, ar] =
        await Promise.all([
          getProjects(user.id),
          getAssessments()
        ]);
    setProjects(pr.data);
    setAssessments(ar.data);
  }

  useEffect(() => { loadData(); }, []);

  async function runAssessment() {
    const project = projects.find((p) => p.id === selectedProject);
    if (!project) return;
    if (!project.borough) { alert("This project has no borough assigned."); return; }
    setRunning(true);
    const constraintResult = await getPlanningConstraints(project.borough);
    const constraints      = constraintResult.data;
    const penalties        = constraints.map((c: any) => c.risk_penalty);
    const names            = constraints.map((c: any) => c.constraint_type);
    const applicationResult = await getSimilarApplications(project.borough, project.project_type);
    setSimilar(applicationResult.data);
    const approved = applicationResult.data.filter((i: any) => i.decision === "Approved").length;
    const refused  = applicationResult.data.filter((i: any) => i.decision === "Refused").length;
    const result   = generateAssessment(project.project_type, penalties, names, approved, refused);
    await createAssessment(project.id, result.score, result.approvalLikelihood, result.approvalProbability, result.summary, result.scoreBreakdown);
    setJustRan(project.id);
    await loadData();
    setRunning(false);
  }

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  return (
    <div style={{ ...sans, maxWidth:1100 }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ ...serif, fontSize:32, fontWeight:300, color:"#0D2137", letterSpacing:"-0.5px", margin:"0 0 4px" }}>Assessments</h1>
        <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>Generate and review planning risk assessments</p>
      </div>

      {/* Run assessment panel */}
      <div style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:14, padding:24, marginBottom:24, boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <h2 style={{ fontSize:15, fontWeight:600, color:"#0D2137", margin:"0 0 3px" }}>Run New Assessment</h2>
            <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>Select a project to analyse its planning risk profile</p>
          </div>
          {/* Risk engine badge */}
          <span style={{ fontSize:11, fontWeight:600, color:"#639922", background:"#EAF3DE", padding:"4px 10px", borderRadius:99, border:"1px solid #D1FAE5" }}>
            ⚡ Rule-based engine
          </span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12, alignItems:"flex-end" }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ width:"100%", padding:"11px 13px", fontSize:13, border:"1.5px solid #E2E8F0", borderRadius:8, outline:"none", color:selectedProject ? "#0B1628" : "#94A3B8", background:"#F8FAFC", boxSizing:"border-box" as const, fontFamily:"'Inter', system-ui, sans-serif" }}
            >
              <option value="">Choose a project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.address} — {p.borough}</option>)}
            </select>
          </div>
          <button
            onClick={runAssessment}
            disabled={!selectedProject || running}
            style={{
              fontSize:13, fontWeight:700, padding:"11px 22px",
              background: (!selectedProject || running) ? "#CBD5E1" : "#A3E635",
              color:"#0B1628", border:"none", borderRadius:8,
              cursor: (!selectedProject || running) ? "not-allowed" : "pointer",
              whiteSpace:"nowrap" as const,
            }}
          >
            {running ? "Running…" : "Run Assessment"}
          </button>
        </div>

        {/* Project preview */}
        {selectedProjectData && (
          <div style={{ marginTop:16, padding:"12px 14px", background:"#F8FAFC", borderRadius:8, border:"1px solid #E2E8F0", display:"flex", gap:24 }}>
            {[
              { label:"Address",  val: selectedProjectData.address },
              { label:"Borough",  val: selectedProjectData.borough },
              { label:"Type",     val: selectedProjectData.project_type },
            ].map((f) => (
              <div key={f.label}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", color:"#94A3B8", margin:"0 0 2px" }}>{f.label}</p>
                <p style={{ fontSize:13, fontWeight:500, color:"#0D2137", margin:0 }}>{f.val}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessments list */}
      <div style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ padding:"18px 24px", borderBottom:"1px solid #F1F5F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <h2 style={{ fontSize:14, fontWeight:600, color:"#0D2137", margin:"0 0 2px" }}>Assessment History</h2>
            <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{assessments.length} assessment{assessments.length !== 1 ? "s" : ""} total</p>
          </div>
        </div>

        {/* Col headers */}
        <div style={{
          display:"grid", gridTemplateColumns:"2fr 0.7fr 110px 120px 110px 80px",
          padding:"10px 24px", background:"#FAFBFC",
          fontSize:10, fontWeight:700, letterSpacing:"0.8px",
          textTransform:"uppercase", color:"#94A3B8",
          borderBottom:"1px solid #F1F5F9",
        }}>
          <span>Property</span><span>Score</span><span>Risk</span><span>Likelihood</span><span>Probability</span><span style={{ textAlign:"right" }}>Report</span>
        </div>

        {assessments.length === 0 && (
          <div style={{ padding:"56px 24px", textAlign:"center" }}>
            <div style={{ width:48, height:48, background:"#F2FCE4", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>
              </svg>
            </div>
            <p style={{ fontSize:14, fontWeight:600, color:"#0D2137", margin:"0 0 4px" }}>No assessments yet</p>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Select a project above and run your first assessment.</p>
          </div>
        )}

        {assessments.map((a, i) => (
          <div key={a.id} style={{
            display:"grid", gridTemplateColumns:"2fr 0.7fr 110px 120px 110px 80px",
            padding:"15px 24px", alignItems:"center",
            borderBottom: i < assessments.length - 1 ? "1px solid #F8FAFC" : "none",
            background: justRan && a.project_id === justRan && i === 0 ? "#FAFFF5" : "transparent",
            transition:"background 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background="#FAFBFC")}
            onMouseLeave={(e) => (e.currentTarget.style.background="transparent")}
          >
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:8, background:"#EAF3DE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#639922" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#0D2137", margin:"0 0 2px" }}>{a.projects?.address ?? "—"}</p>
                <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{a.projects?.borough ?? ""}</p>
              </div>
            </div>

            <span style={{ ...serif, fontSize:22, fontWeight:600, color:"#0D2137" }}>{a.score}</span>
            <ScoreBadge score={a.score} />
            <span style={{ fontSize:12, color:"#475569" }}>{a.approval_likelihood}</span>
            <span style={{ fontSize:12, color:"#475569" }}>{a.approval_probability}%</span>

            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <a href={`/reports/${a.id}`} style={{ fontSize:12, fontWeight:600, color:"#639922", textDecoration:"none", padding:"5px 12px", border:"1px solid #D1FAE5", borderRadius:6, background:"#F0FDF4" }}>
                View →
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Similar applications (shown after run) */}
      {similarApplications.length > 0 && (
        <div style={{ background:"#fff", border:"1px solid #E8EDF2", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 3px rgba(0,0,0,0.04)", marginTop:24 }}>
          <div style={{ padding:"18px 24px", borderBottom:"1px solid #F1F5F9" }}>
            <h2 style={{ fontSize:14, fontWeight:600, color:"#0D2137", margin:"0 0 2px" }}>Similar Applications Found</h2>
            <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>{similarApplications.length} comparable applications from the last assessment</p>
          </div>
          {similarApplications.map((app, i) => (
            <div key={app.id} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"12px 24px", fontSize:13,
              borderBottom: i < similarApplications.length - 1 ? "1px solid #F8FAFC" : "none",
            }}>
              <span style={{ color:"#475569" }}>{app.address}</span>
              <span style={{ fontWeight:600, color: app.decision === "Approved" ? "#16A34A" : "#DC2626", fontSize:12 }}>
                {app.decision}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
