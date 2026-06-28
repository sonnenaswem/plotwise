"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signUp } from "@/services/auth/auth-service";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [strength, setStrength]   = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    document.body.style.margin  = "0";
    document.body.style.padding = "0";
  }, []);

  useEffect(() => {
    let s = 0;
    if (password.length >= 8)           s++;
    if (/[A-Z]/.test(password))         s++;
    if (/[0-9]/.test(password))         s++;
    if (/[^A-Za-z0-9]/.test(password))  s++;
    setStrength(s);
  }, [password]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signUp(email, password);
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
  }

  const serif   = { fontFamily: "'Fraunces', Georgia, serif" };
  const sans    = { fontFamily: "'Inter', system-ui, sans-serif" };
  const heroBg  = "#0D2137";

  const strengthColors = ["#E2E8F0","#EF4444","#F59E0B","#3B82F6","#A3E635"];
  const strengthLabels = ["","Weak","Fair","Good","Strong"];

  const steps = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3E635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      title: "Search any address",
      body: "Enter a London property address to get started instantly.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3E635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      title: "Instant risk score",
      body: "Our engine analyses constraints and historical decisions in seconds.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3E635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      title: "Download your report",
      body: "Get a full PDF with scores, evidence, and recommendations.",
    },
  ];

  return (
    <div style={{ ...sans, display: "flex", minHeight: "100vh", margin: 0, padding: 0 }}>

      {/* ── LEFT — Brand panel ── */}
      <div style={{
        width: "42%", background: heroBg,
        display: "flex", flexDirection: "column",
        padding: "40px 52px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative rings */}
        {[{ s: 500, t: -160, r: -160, o: 0.06 },{ s: 320, t: -80, r: -80, o: 0.09 },{ s: 280, b: -100, l: -100, o: 0.05 }].map((r, i) => (
          <div key={i} style={{
            position: "absolute",
            width: r.s, height: r.s, borderRadius: "50%",
            border: `1px solid rgba(163,230,53,${r.o})`,
            top: r.t, right: r.r, bottom: r.b, left: r.l,
            pointerEvents: "none",
          }} />
        ))}

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 16px" }}>
            Start for free today
          </p>
          <h2 style={{ ...serif, fontSize: 40, fontWeight: 300, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.12, margin: "0 0 16px", maxWidth: 360 }}>
            Smarter planning decisions start here
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 360, margin: "0 0 44px" }}>
            Join developers and architects who assess planning risk before committing time and money.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 48 }}>
            {steps.map((s) => (
              <div key={s.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 3px" }}>{s.title}</p>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {["14-day free trial","No credit card needed","Cancel anytime"].map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#A3E635", fontWeight: 700, fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT — Form ── */}
      <div
        style={{
          flex: 1,
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          padding: "40px 60px",
          position: "relative",
        }}
      >
        {/* Logo block */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <Image
            src="/logo1.png"
            alt="PlotWise"
            width={160}
            height={150}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
  
      <div style={{
        flex: 1, background: "#fff",
        display: "flex", flexDirection: "column",
        padding: "0 60px",
      }}>
        {/* Top bar */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            fontSize: 14,
            color: "#64748B",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#639922", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "stretch", paddingBottom: 64, maxWidth: 420, width: "100%", margin: "0 auto", }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#639922", margin: "0 0 12px" }}>
            Create your account
          </p>
          <h1 style={{ ...serif, fontSize: 34, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 28px" }}>
            Start your 14-day free trial
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "First name", val: firstName, set: setFirstName, ph: "James" },
                { label: "Last name",  val: lastName,  set: setLastName,  ph: "Smith" },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type="text" placeholder={f.ph} value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 13px", fontSize: 14,
                      border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none",
                      color: "#0B1628", background: "#F8FAFC", boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#639922")}
                    onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email address</label>
              <input
                type="email" placeholder="you@company.com" value={email} required
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "11px 13px", fontSize: 14,
                  border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none",
                  color: "#0B1628", background: "#F8FAFC", boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#639922")}
                onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={password} required
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 48px 11px 13px", fontSize: 14,
                    border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none",
                    color: "#0B1628", background: "#F8FAFC", boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#639922")}
                  onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, color: "#94A3B8", padding: 0,
                }}>{showPass ? "Hide" : "Show"}</button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1,2,3,4].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: strength >= i ? strengthColors[strength] : "#E2E8F0",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: strength >= 3 ? "#639922" : "#94A3B8", margin: "4px 0 0", fontWeight: 500 }}>
                    {strengthLabels[strength]} password
                  </p>
                </div>
              )}
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
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
              background: loading ? "#CBD5E1" : "#A3E635",
              color: "#0B1628", border: "none", borderRadius: 8,
              cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
            }}>
              {loading ? "Creating account..." : "Create free account"}
            </button>

            <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", margin: "4px 0 0", lineHeight: 1.6 }}>
              By creating an account you agree to our{" "}
              <Link href="/terms" style={{ color: "#639922", textDecoration: "none" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" style={{ color: "#639922", textDecoration: "none" }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>  
  );
}
