"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createOrganization } from "@/services/organizations/organization-service";

const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
const serif = { fontFamily: "'Fraunces', Georgia, serif" };
const TEAL  = "#0E7490";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,600&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    document.body.style.margin  = "0";
    document.body.style.padding = "0";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expired. Please log in again."); setLoading(false); return; }
    const result = await createOrganization(name, user.id);
    if (result.error) { setError(result.error.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  const benefits = [
    { icon: "🏢", title: "Team collaboration",   body: "Invite team members and share projects across your organisation." },
    { icon: "📊", title: "Shared assessments",   body: "All planning risk assessments are visible to your whole team." },
    { icon: "🔐", title: "Role-based access",    body: "Owners, admins, and members each get the right level of access." },
    { icon: "📄", title: "Central reporting",    body: "All reports stored in one place for your entire portfolio." },
  ];

  return (
    <div style={{ ...sans, display: "flex", minHeight: "100vh", margin: 0, padding: 0 }}>

      {/* ── LEFT — Brand panel ── */}
      <div style={{
        width: "42%", background: `linear-gradient(160deg, #0D2137 0%, ${TEAL} 100%)`,
        display: "flex", flexDirection: "column", padding: "40px 52px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Rings */}
        {[{ s: 440, t: -120, r: -120, o: 0.07 }, { s: 280, t: -50, r: -50, o: 0.1 }, { s: 300, b: -100, l: -80, o: 0.06 }].map((r, i) => (
          <div key={i} style={{ position: "absolute", width: r.s, height: r.s, borderRadius: "50%", border: `1px solid rgba(255,255,255,${r.o})`, top: r.t, right: r.r, bottom: r.b, left: r.l, pointerEvents: "none" }} />
        ))}

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, marginBottom: "auto" }}>
          <Link href="/"><Image src="/logo1.png" alt="PlotWise" width={130} height={44} style={{ objectFit: "contain" }} /></Link>
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, marginTop: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 14px" }}>
            One last step
          </p>
          <h2 style={{ ...serif, fontSize: 38, fontWeight: 300, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.12, margin: "0 0 16px", maxWidth: 340 }}>
            Set up your organisation
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 340, margin: "0 0 36px" }}>
            Your organisation is the hub for your team, projects, and assessments. You can invite colleagues after setup.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {benefits.map((b) => (
              <div key={b.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {b.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 2px" }}>{b.title}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ position: "relative", zIndex: 1, marginTop: 40, display: "flex", alignItems: "center", gap: 8 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ height: 3, borderRadius: 2, background: s <= 3 ? (s === 3 ? "#A3E635" : "rgba(255,255,255,0.3)") : "rgba(255,255,255,0.1)", flex: s === 3 ? 2 : 1 }} />
          ))}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>Step 3 of 3</span>
        </div>
      </div>

      {/* ── RIGHT — Form ── */}
      <div style={{ flex: 1, background: "#fff", display: "flex", flexDirection: "column", padding: "0 60px" }}>
        <div style={{ paddingTop: 40, paddingBottom: 32, display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 13, color: "#64748B" }}>
            Wrong account?{" "}
            <Link href="/login" style={{ color: "#639922", fontWeight: 600, textDecoration: "none" }}>Sign out</Link>
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 64, maxWidth: 420, width: "100%" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#639922", margin: "0 0 12px" }}>
            Organisation setup
          </p>
          <h1 style={{ ...serif, fontSize: 32, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 8px" }}>
            Name your organisation
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 32px", lineHeight: 1.6 }}>
            This is usually your company name. You can always change it later in settings.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Organisation name
              </label>
              <input
                value={name} required
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Property Group"
                style={{
                  width: "100%", padding: "12px 14px", fontSize: 14,
                  border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none",
                  color: "#0B1628", background: "#F8FAFC", boxSizing: "border-box" as const,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#639922")}
                onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
              />
              <p style={{ fontSize: 11, color: "#94A3B8", margin: "6px 0 0" }}>
                This name will appear on reports and shared workspaces.
              </p>
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !name.trim()} style={{
              width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
              background: (loading || !name.trim()) ? "#CBD5E1" : "#A3E635",
              color: "#0B1628", border: "none", borderRadius: 8,
              cursor: (loading || !name.trim()) ? "not-allowed" : "pointer",
            }}>
              {loading ? "Creating organisation…" : "Create organisation & continue →"}
            </button>

            <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", margin: 0, lineHeight: 1.6 }}>
              You&apos;ll be taken to your dashboard immediately after. Team members can be invited from Settings.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
