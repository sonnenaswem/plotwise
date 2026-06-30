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

  const serif  = { fontFamily: "'Fraunces', Georgia, serif" };
  const sans   = { fontFamily: "'Inter', system-ui, sans-serif" };
  const heroBg = "#0D2137";

  const stats = [
    { value: "32,000+", label: "Planning applications analysed" },
    { value: "98%",     label: "Constraint accuracy rate" },
    { value: "33",      label: "London boroughs covered" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", fontSize: 14,
    border: "1.5px solid #E2E8F0", borderRadius: 8, outline: "none",
    color: "#0B1628", background: "#F8FAFC", boxSizing: "border-box",
    fontFamily: "'Inter', system-ui, sans-serif",
  };

  return (
    <>
      <style>{`
        .login-wrap { display: flex; min-height: 100vh; margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif; }
        .login-left  { width: 45%; min-width: 340px; display: flex; flex-direction: column; background: #fff; padding: 0 56px; }
        .login-right { flex: 1; background: ${heroBg}; display: flex; flex-direction: column; justify-content: center; padding: 64px 56px; position: relative; overflow: hidden; }

        /* Logo small + compact at top, NOT taking vertical space that pushes form down */
        .login-logo-wrap { display: flex; justify-content: center; align-items: center; padding-top: 32px; padding-bottom: 28px; flex-shrink: 0; }

        .login-form-area { flex: 1; display: flex; flex-direction: column; justify-content: center; padding-bottom: 48px; }

        .login-top-link { position: absolute; top: 40px; right: 56px; font-size: 14px; color: #64748B; }

        .login-h1 { font-size: 36px; }
        .stats-col { display: flex; flex-direction: column; gap: 20px; margin-bottom: 48px; }

        /* ════ MOBILE ════ */
        @media (max-width: 768px) {
          .login-wrap  { flex-direction: column; min-height: 100vh; }
          .login-left  {
            width: 100%; min-width: unset; padding: 0 24px;
            min-height: 100vh;            /* fills screen so right panel never shows */
            justify-content: flex-start;
          }
          .login-right { display: none; } /* brand panel fully removed on mobile */

          /* Logo: small, fixed near top, doesn't eat space */
          .login-logo-wrap { padding-top: 28px; padding-bottom: 8px; }

          /* Form area: starts immediately, no centering/scroll-push */
          .login-form-area {
            justify-content: flex-start;
            padding-top: 8px;
            padding-bottom: 32px;
          }

          .login-top-link { position: static; text-align: center; margin-bottom: 16px; display: block; }
          .login-h1 { font-size: 26px; }
        }
      `}</style>

      <div className="login-wrap">

        {/* ── LEFT — Form ── */}
        <div className="login-left">

          <div className="login-logo-wrap">
            <Link href="/">
              <Image src="/logo1.png" alt="PlotWise" width={160} height={100} style={{ objectFit: "contain" }} priority />
            </Link>
          </div>

          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
            <span className="login-top-link">
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "#639922", fontWeight: 600, textDecoration: "none" }}>Start free trial</Link>
            </span>

            <div className="login-form-area">
              <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#639922", margin: "0 0 12px" }}>
                Welcome back
              </p>
              <h1 className="login-h1" style={{ ...serif, fontWeight: 300, color: "#0D2137", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 8px" }}>
                Sign in to your account
              </h1>
              <p style={{ ...sans, fontSize: 14, color: "#64748B", margin: "0 0 28px" }}>
                Don&apos;t have an account?{" "}
                <Link href="/signup" style={{ color: "#639922", fontWeight: 600, textDecoration: "none" }}>Start your free trial</Link>
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ ...sans, display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email address</label>
                  <input
                    type="email" placeholder="you@company.com" value={email} required
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#639922")}
                    onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label style={{ ...sans, fontSize: 13, fontWeight: 600, color: "#374151" }}>Password</label>
                    <Link href="/forgot-password" style={{ ...sans, fontSize: 12, color: "#639922", textDecoration: "none", fontWeight: 500 }}>Forgot password?</Link>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"} placeholder="••••••••" value={password} required
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputStyle, padding: "12px 44px 12px 14px" }}
                      onFocus={(e) => (e.target.style.borderColor = "#639922")}
                      onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                      ...sans, color: "#94A3B8", fontSize: 13, fontWeight: 500,
                    }}>{showPass ? "Hide" : "Show"}</button>
                  </div>
                </div>

                {error && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style={{ ...sans, fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "13px", fontSize: 14, fontWeight: 700,
                  background: loading ? "#CBD5E1" : "#A3E635",
                  color: "#0B1628", border: "none", borderRadius: 8,
                  cursor: loading ? "not-allowed" : "pointer", marginTop: 4,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}>
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
                <span style={{ ...sans, fontSize: 12, color: "#94A3B8" }}>OR</span>
                <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
              </div>

              <p style={{ ...sans, fontSize: 13, color: "#94A3B8", textAlign: "center", margin: 0 }}>
                New to PlotWise?{" "}
                <Link href="/signup" style={{ color: "#639922", fontWeight: 600, textDecoration: "none" }}>Create a free account</Link>
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT — Brand (desktop only) ── */}
        <div className="login-right">
          {[{ t:-120,r:-120,s:480,o:0.08 },{ t:-60,r:-60,s:320,o:0.10 },{ b:-80,l:-80,s:360,o:0.06 }].map((r,i) => (
            <div key={i} style={{ position:"absolute", top:r.t, right:r.r, bottom:r.b, left:r.l, width:r.s, height:r.s, borderRadius:"50%", border:`1px solid rgba(163,230,53,${r.o})`, pointerEvents:"none" }} />
          ))}

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "1.4px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 20px" }}>
              Planning intelligence
            </p>
            <h2 style={{ ...serif, fontSize: 44, fontWeight: 300, color: "#fff", letterSpacing: "-1px", lineHeight: 1.1, margin: "0 0 20px", maxWidth: 400 }}>
              Know your risk before you spend a penny
            </h2>
            <p style={{ ...sans, fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 380, margin: "0 0 48px" }}>
              PlotWise analyses historical planning decisions, constraint data, and local authority trends so you can assess feasibility in minutes — not weeks.
            </p>

            <div className="stats-col">
              {stats.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ ...serif, fontSize: 28, fontWeight: 600, color: "#A3E635", minWidth: 90 }}>{s.value}</span>
                  <span style={{ ...sans, fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 20 }}>
              <p style={{ ...sans, fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 12px", fontStyle: "italic" }}>
                &ldquo;PlotWise helped us identify a conservation area constraint that would have cost us three months and a failed application. Invaluable before site acquisition.&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #A3E635, #3B6D11)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#0B1628" }}>J</div>
                <div>
                  <p style={{ ...sans, fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>James T.</p>
                  <p style={{ ...sans, fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>Property Developer, London</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
