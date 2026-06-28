"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "@/services/auth/auth-service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    document.body.style.margin  = "0";
    document.body.style.padding = "0";
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  const serif = { fontFamily: "'Fraunces', Georgia, serif" };
  const sans  = { fontFamily: "'Inter', system-ui, sans-serif" };
  const heroBg = "#0D2137";

  const stats = [
    { value: "32,000+", label: "Planning applications analysed" },
    { value: "98%",     label: "Constraint accuracy rate" },
    { value: "33",      label: "London boroughs covered" },
  ];

  return (
    <div style={{ ...sans, display: "flex", minHeight: "100vh", margin: 0, padding: 0 }}>

      {/* ── LEFT PANEL — Form ── */}
      <div style={{
        width: "45%", minWidth: 380, display: "flex", flexDirection: "column",
        background: "#fff", padding: "0 56px",
      }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center", // centers horizontally
            alignItems: "center",     // centers vertically within its box
            paddingTop: 32,
            paddingBottom: 48,
          }}
        >
          <Link href="/">
            <Image
              src="/logo1.png"
              alt="PlotWise"
              width={280}   // make it bigger
              height={200}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        </div>


        {/* Form area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#639922", margin: "0 0 12px" }}>
            Welcome
          </p>
          <h1 style={{ ...serif, fontSize: 36, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 8px" }}>
            Sign in to your account
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 36px" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#639922", fontWeight: 600, textDecoration: "none" }}>Start your free trial</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%", padding: "12px 14px", fontSize: 14,
                  border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none",
                  color: "#0B1628", background: "#F8FAFC",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#639922")}
                onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: 12, color: "#639922", textDecoration: "none", fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "12px 44px 12px 14px", fontSize: 14,
                    border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none",
                    color: "#0B1628", background: "#F8FAFC",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#639922")}
                  onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    color: "#94A3B8", fontSize: 13, fontWeight: 500,
                  }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: 8, padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
                background: loading ? "#cbd5e1" : "#A3E635",
                color: "#0B1628", border: "none", borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            <span style={{ fontSize: 12, color: "#94A3B8" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          </div>

          <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", margin: 0 }}>
            New to PlotWise?{" "}
            <Link href="/signup" style={{ color: "#639922", fontWeight: 600, textDecoration: "none" }}>
              Create a free account
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL — Brand ── */}
      <div style={{
        flex: 1, background: heroBg,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "64px 56px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative background rings */}
        <div style={{
          position: "absolute", top: -120, right: -120,
          width: 480, height: 480, borderRadius: "50%",
          border: "1px solid rgba(163,230,53,0.08)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 320, height: 320, borderRadius: "50%",
          border: "1px solid rgba(163,230,53,0.1)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 360, height: 360, borderRadius: "50%",
          border: "1px solid rgba(163,230,53,0.06)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 20px" }}>
            Planning intelligence
          </p>
          <h2 style={{ ...serif, fontSize: 44, fontWeight: 300, color: "#fff", letterSpacing: "-1px", lineHeight: 1.1, margin: "0 0 20px", maxWidth: 400 }}>
            Know your risk before you spend a penny
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 380, margin: "0 0 48px" }}>
            PlotWise analyses historical planning decisions, constraint data, and local authority trends
            so you can assess feasibility in minutes — not weeks.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 48 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ ...serif, fontSize: 28, fontWeight: 600, color: "#A3E635", minWidth: 90 }}>{s.value}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: 20,
          }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 12px", fontStyle: "italic" }}>
              &ldquo;PlotWise helped us identify a conservation area constraint that would have cost us
              three months and a failed application. Invaluable before site acquisition.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #A3E635, #3B6D11)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "#0B1628",
              }}>J</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>James T.</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>Property Developer, London</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
