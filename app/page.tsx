"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function HomePage() {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const fillRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,300&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    document.body.style.margin  = "0";
    document.body.style.padding = "0";

    const target = 74, dur = 1800, t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(e * target);
      if (scoreRef.current) scoreRef.current.textContent = String(v);
      if (fillRef.current)  fillRef.current.style.width  = `${e * target}%`;
      if (labelRef.current) labelRef.current.textContent =
        v >= 80 ? "High likelihood of approval" :
        v >= 60 ? "Moderate likelihood of approval" : "Higher planning risk";
      if (p < 1) requestAnimationFrame(tick);
    };
    const id = setTimeout(tick, 500);
    return () => clearTimeout(id);
  }, []);

  const serif  = { fontFamily: "'Fraunces', Georgia, serif" };
  const sans   = { fontFamily: "'Inter', system-ui, sans-serif" };
  const heroBg = "#0D2137";
  const navBg  = "#F8F6EE";

  const constraints = [
    { label: "Green Belt",        status: "Clear",   dot: "#A3E635", txt: "rgba(163,230,53,0.85)" },
    { label: "Conservation Area", status: "Flagged", dot: "#F59E0B", txt: "#F59E0B" },
    { label: "Flood Zone",        status: "Clear",   dot: "#A3E635", txt: "rgba(163,230,53,0.85)" },
    { label: "Listed Building",   status: "Clear",   dot: "#A3E635", txt: "rgba(163,230,53,0.85)" },
  ];

  const features = [
    { title: "Constraint analysis",     body: "Instant checks across conservation areas, listed buildings, green belt, flood zones, and tree preservation orders for any London address.",   svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> },
    { title: "Historical decisions",    body: "We surface comparable applications within 500m — same borough, same project type — so you see how councils have actually voted.",               svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { title: "Risk score",              body: "A transparent, rule-based planning risk score from 0–100, with a clear breakdown of every factor that influenced the result.",                svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { title: "Downloadable report",     body: "Every assessment generates a PDF: property details, score, constraint list, similar applications, key risks, and recommendations.",            svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> },
    { title: "Organisation accounts",   body: "Invite your team, assign roles, and manage projects across your firm. Owners, admins, and members all get appropriate access.",               svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { title: "Greater London coverage", body: "Launched across all London boroughs, prioritising the highest-volume areas. Nationwide expansion coming in a future phase.",                  svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
  ];

  const steps = [
    { n: "1", title: "Enter a property address",     body: "Search any London address. PlotWise pinpoints the exact location and borough for accurate analysis." },
    { n: "2", title: "Select a project type",        body: "Tell us what you're planning — residential extension, change of use, new build — so we match the right comparable decisions." },
    { n: "3", title: "Review planning intelligence", body: "PlotWise checks all constraints, surfaces nearby historical applications, and scores the risk across every factor." },
    { n: "4", title: "Download your report",         body: "Get a full PDF report: score, evidence, key risks, and planning recommendations — ready to share with your team or client." },
  ];

  const reportConstraints = [
    { name: "Conservation area", status: "Flagged — −20pts", flag: true },
    { name: "Listed building",   status: "Clear", flag: false },
    { name: "Green belt",        status: "Clear", flag: false },
    { name: "Flood zone",        status: "Clear", flag: false },
    { name: "Tree preservation", status: "Clear", flag: false },
  ];

  const reportApps = [
    { desc: "Rear extension, 28 Portobello Rd",   outcome: "Approved", ok: true },
    { desc: "Loft conversion, 41 Ladbroke Grove", outcome: "Approved", ok: true },
    { desc: "Side extension, 9 Talbot Rd",        outcome: "Refused",  ok: false },
  ];

  const plans = [
    { name: "Starter",      price: "Free", period: "14-day trial", featured: false, desc: "Get started with planning intelligence on a handful of sites.",   feats: ["Limited assessments","PDF reports","Constraint checks"], cta: "Start trial" },
    { name: "Professional", price: "Pro",  period: "/ month",      featured: true,  desc: "For active developers running multiple sites at once.",           feats: ["Increased assessment limits","Organisation accounts","Team collaboration","Read-only access on cancel"], cta: "Get started" },
    { name: "Developer",    price: "High", period: "volume",       featured: false, desc: "Unlimited assessments for firms with serious deal flow.",         feats: ["Unlimited assessments","Priority support","Custom reporting"], cta: "Talk to us" },
  ];

  /* shared inner container — identical max-width & padding as hero */
  const innerCls = "max-w-[1100px] mx-auto w-full px-12";

  return (
    <>
      <style>{`
        /* ── Feature card hover ── */
        .feat-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 24px;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          cursor: default;
        }
        .feat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.10);
          border-color: #A3E635;
        }
        .feat-card:hover .feat-icon {
          background: #A3E635;
        }
        .feat-card:hover .feat-icon svg path,
        .feat-card:hover .feat-icon svg circle,
        .feat-card:hover .feat-icon svg line,
        .feat-card:hover .feat-icon svg polyline {
          stroke: #0D2137;
        }

        /* ── Nav link hover ── */
        .nav-link { transition: background 0.18s, color 0.18s; }
        .nav-link:hover { background: #A3E635 !important; color: #0B1628 !important; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hero-grid    { grid-template-columns: 1fr !important; }
          .feat-grid    { grid-template-columns: 1fr 1fr !important; }
          .how-grid     { grid-template-columns: 1fr !important; }
          .plan-grid    { grid-template-columns: 1fr !important; }
          .hero-h1      { font-size: 38px !important; }
        }
        @media (max-width: 600px) {
          .feat-grid    { grid-template-columns: 1fr !important; }
          .hero-h1      { font-size: 32px !important; letter-spacing: -1px !important; }
          .hero-sub     { font-size: 15px !important; }
          .section-h2   { font-size: 28px !important; }
          .cta-h2       { font-size: 32px !important; }
          .inner-pad    { padding-left: 20px !important; padding-right: 20px !important; }
          .constraint-grid { grid-template-columns: 1fr !important; }
          .score-num    { font-size: 64px !important; }
        }

        /* ── Mobile menu ── */
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #F8F6EE;
          border-top: 1px solid rgba(0,0,0,0.08);
          flex-direction: column;
          padding: 12px 20px 20px;
          gap: 4px;
          z-index: 100;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a, .mobile-menu button {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 15px;
          color: rgba(0,0,0,0.75);
          text-decoration: none;
          padding: 10px 12px;
          border-radius: 8px;
          display: block;
          transition: background 0.15s;
        }
        .mobile-menu a:hover { background: rgba(0,0,0,0.05); }
        .hamburger { display: none; }
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .hamburger     { display: flex; }
        }
      `}</style>

      {/* ════ NAV ════ */}
      <nav style={{ background: navBg, borderBottom: "1px solid rgba(0,0,0,0.08)", position: "sticky", top: 0, zIndex: 50 }}>
        {/* Inner container — same max-width & px as hero */}
        <div className={`${innerCls} inner-pad`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "2px 48px" }}>

          {/* Logo + tagline */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, flexShrink: 0 }}>
            <Image src="/logo2.png" alt="PlotWise" width={150} height={90} style={{ objectFit: "contain", flexShrink: 0 }} priority />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, marginLeft: -14, flexShrink: 0 }}>
              <span style={{ ...sans, fontSize: 15, fontWeight: 600, color: "#0B1628", whiteSpace: "nowrap" }}>Planning Intelligence</span>
              <span style={{ ...sans, fontSize: 15, fontWeight: 600, color: "rgba(6,94,54,0.65)", whiteSpace: "nowrap" }}>For Better Decisions</span>
            </div>
          </div>

          {/* Desktop links */}
          <div className="desktop-links" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"]].map(([label,href]) => (
              <a key={label} href={href} className="nav-link" style={{ ...sans, fontSize: 14, color: "rgba(0,0,0,0.7)", textDecoration: "none", padding: "6px 12px", borderRadius: 6 }}>{label}</a>
            ))}
            <Link href="/login" className="nav-link" style={{ ...sans, fontSize: 14, color: "rgba(0,0,0,0.7)", textDecoration: "none", padding: "6px 12px", borderRadius: 6, marginLeft: 4 }}>Log in</Link>
            <Link href="/signup" style={{ ...sans, background: "#A3E635", color: "#0B1628", fontSize: 14, fontWeight: 600, padding: "9px 20px", borderRadius: 8, textDecoration: "none", marginLeft: 8, flexShrink: 0, whiteSpace: "nowrap" }}>
              Start free trial
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}
            aria-label="Menu"
          >
            <span style={{ width: 22, height: 2, background: "#0B1628", borderRadius: 2, display: "block", transition: "transform 0.2s", transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ width: 22, height: 2, background: "#0B1628", borderRadius: 2, display: "block", opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ width: 22, height: 2, background: "#0B1628", borderRadius: 2, display: "block", transition: "transform 0.2s", transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"]].map(([label,href]) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ ...sans, fontSize: 15, color: "rgba(0,0,0,0.75)", textDecoration: "none", padding: "10px 12px", borderRadius: 8, display: "block" }}>Log in</Link>
          <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ ...sans, background: "#A3E635", color: "#0B1628", fontSize: 14, fontWeight: 600, padding: "11px 16px", borderRadius: 8, textDecoration: "none", display: "block", textAlign: "center", marginTop: 4 }}>
            Start free trial
          </Link>
        </div>
      </nav>

      {/* ════ HERO ════ */}
      <div style={{ background: heroBg, width: "100%" }}>
        <div className={`${innerCls} inner-pad`} style={{ padding: "72px 48px 64px" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>

            <div>
              <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "1.8px", textTransform: "uppercase", color: "#A3E635", marginBottom: 20, marginTop: 0 }}>
                Planning intelligence for London
              </p>
              <h1 className="hero-h1" style={{ ...serif, fontSize: 52, fontWeight: 300, lineHeight: 1.08, letterSpacing: "-1.5px", color: "#fff", margin: "0 0 20px" }}>
                Know your{" "}
                <em style={{ fontStyle: "italic", color: "#A3E635" }}>planning risk</em>
                {" "}before you commit
              </h1>
              <p className="hero-sub" style={{ ...sans, fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 440, margin: "0 0 32px" }}>
                PlotWise gives property developers and architects an evidence-based planning risk score before they spend a penny on applications, consultants, or surveys.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
                <Link href="/signup" style={{ ...sans, background: "#A3E635", color: "#0B1628", fontSize: 14, fontWeight: 700, padding: "13px 26px", borderRadius: 8, textDecoration: "none" }}>
                  Start 14-day free trial
                </Link>
                <a href="#how-it-works" style={{ ...sans, fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>See how it works →</a>
              </div>
            </div>

            {/* Score widget */}
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ ...sans, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", margin: 0 }}>Planning assessment</p>
                  <p style={{ ...sans, fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>12 Ladbroke Grove, Kensington, W11</p>
                </div>
                <span style={{ ...sans, background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.35)", color: "#A3E635", fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: 99 }}>Greater London</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span ref={scoreRef} className="score-num" style={{ ...serif, fontSize: 88, fontWeight: 600, color: "#A3E635", lineHeight: 1 }}>0</span>
                <p ref={labelRef} style={{ ...sans, fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Calculating risk score...</p>
                <div style={{ width: "100%", marginTop: 10 }}>
                  <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                    <div ref={fillRef} style={{ height: "100%", width: "0%", borderRadius: 99, background: "linear-gradient(90deg, #3B6D11, #A3E635)", transition: "width 1.8s cubic-bezier(0.16,1,0.3,1)" }} />
                  </div>
                  <div style={{ ...sans, display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    <span>Higher risk</span><span>Moderate</span><span>Likely approval</span>
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

              <div>
                <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 12px" }}>Planning constraints</p>
                <div className="constraint-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {constraints.map((c) => (
                    <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
                      <span style={{ ...sans, fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>{c.label}</span>
                      <span style={{ ...sans, fontSize: 11, color: c.txt, fontWeight: 500 }}>{c.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

              <div style={{ ...sans, display: "flex", justifyContent: "space-between", fontSize: 12, flexWrap: "wrap", gap: 4 }}>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>Similar applications nearby</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>14 found — <span style={{ color: "#A3E635" }}>11 approved</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ FEATURES ════ */}
      <div id="features" style={{ background: "#F8F9FA", width: "100%" }}>
        <div className={`${innerCls} inner-pad`} style={{ padding: "80px 48px" }}>
          <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "#639922", margin: "0 0 12px" }}>Why PlotWise</p>
          <h2 className="section-h2" style={{ ...serif, fontSize: 40, fontWeight: 300, color: "#0B1628", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 12px" }}>
            Stop spending before you know what you&apos;re buying
          </h2>
          <p style={{ ...sans, fontSize: 16, color: "#64748B", lineHeight: 1.7, maxWidth: 500, margin: "0 0 48px" }}>
            Architects, surveys, and planning consultants cost thousands before you even submit. PlotWise surfaces the risk first.
          </p>
          <div className="feat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {features.map((f) => (
              <div key={f.title} className="feat-card">
                <div className="feat-icon" style={{ width: 40, height: 40, background: "#EAF3DE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, transition: "background 0.22s" }}>
                  {f.svg}
                </div>
                <h3 style={{ ...sans, fontSize: 15, fontWeight: 600, color: "#0B1628", margin: "0 0 8px" }}>{f.title}</h3>
                <p style={{ ...sans, fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ HOW IT WORKS ════ */}
      <div id="how-it-works" style={{ background: "#F8F9FA", width: "100%" }}>
        <div className={`${innerCls} inner-pad`} style={{ padding: "0 48px 80px" }}>
          <div style={{ height: 1, background: "#E2E8F0", margin: "0 0 64px" }} />
          <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "#639922", margin: "0 0 12px" }}>How it works</p>
          <h2 className="section-h2" style={{ ...serif, fontSize: 40, fontWeight: 300, color: "#0B1628", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 12px" }}>
            From address to report in minutes
          </h2>
          <p style={{ ...sans, fontSize: 16, color: "#64748B", lineHeight: 1.7, maxWidth: 420, margin: "0 0 48px" }}>
            PlotWise runs the research so you can make the call.
          </p>
          <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            <div>
              {steps.map((s, i) => (
                <div key={s.n} style={{ display: "flex", gap: 16, padding: "20px 0", borderBottom: i < steps.length - 1 ? "1px solid #E2E8F0" : "none" }}>
                  <span style={{ ...serif, fontSize: 24, fontWeight: 600, color: "#CBD5E1", lineHeight: 1, paddingTop: 2, minWidth: 28 }}>{s.n}</span>
                  <div>
                    <h4 style={{ ...sans, fontSize: 15, fontWeight: 600, color: "#0B1628", margin: "0 0 4px" }}>{s.title}</h4>
                    <p style={{ ...sans, fontSize: 13, color: "#64748B", lineHeight: 1.65, margin: 0 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mock report */}
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ ...sans, fontSize: 14, fontWeight: 600, color: "#0B1628", margin: 0 }}>Planning Assessment Report</p>
                  <p style={{ ...sans, fontSize: 12, color: "#94A3B8", margin: "4px 0 0" }}>34 Portobello Rd, W11 — Residential extension</p>
                </div>
                <span style={{ ...sans, background: "#EAF3DE", color: "#3B6D11", fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 6 }}>↓ PDF</span>
              </div>
              <div style={{ height: 1, background: "#F1F5F9" }} />
              <div>
                <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 8px" }}>Risk score</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ ...serif, fontSize: 52, fontWeight: 600, color: "#639922", lineHeight: 1 }}>74</span>
                  <span style={{ ...sans, fontSize: 13, color: "#94A3B8", lineHeight: 1.4 }}>Moderate likelihood<br />of approval</span>
                </div>
              </div>
              <div style={{ height: 1, background: "#F1F5F9" }} />
              <div>
                <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 10px" }}>Planning constraints</p>
                {reportConstraints.map((c) => (
                  <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 8 }}>
                    <span style={{ ...sans, color: "#475569" }}>{c.name}</span>
                    <span style={{ ...sans, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5, background: c.flag ? "#FFF7ED" : "#EAF3DE", color: c.flag ? "#C2410C" : "#3B6D11" }}>{c.status}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "#F1F5F9" }} />
              <div>
                <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 10px" }}>Similar nearby applications</p>
                {reportApps.map((a, i) => (
                  <div key={a.desc} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: 12, borderBottom: i < reportApps.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                    <span style={{ ...sans, color: "#475569" }}>{a.desc}</span>
                    <span style={{ ...sans, fontWeight: 600, color: a.ok ? "#16A34A" : "#DC2626" }}>{a.outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ PRICING ════ */}
      <div id="pricing" style={{ background: heroBg, width: "100%", padding: "80px 0" }}>
        <div className={`${innerCls} inner-pad`} style={{ padding: "0 48px" }}>
          <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 12px" }}>Pricing</p>
          <h2 className="section-h2" style={{ ...serif, fontSize: 40, fontWeight: 300, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.15, margin: "0 0 12px" }}>
            Simple plans for every stage
          </h2>
          <p style={{ ...sans, fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, margin: "0 0 48px" }}>Start free. Scale as your pipeline grows.</p>
          <div className="plan-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{ background: plan.featured ? "#A3E635" : "rgba(255,255,255,0.05)", border: `1px solid ${plan.featured ? "#A3E635" : "rgba(255,255,255,0.1)"}`, borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <p style={{ ...sans, fontSize: 13, color: plan.featured ? "rgba(11,22,40,0.6)" : "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{plan.name}</p>
                  <p style={{ ...serif, fontSize: 32, fontWeight: 600, color: plan.featured ? "#0B1628" : "#fff", lineHeight: 1, margin: 0 }}>
                    {plan.price}
                    <span style={{ ...sans, fontSize: 14, fontWeight: 400, color: plan.featured ? "rgba(11,22,40,0.5)" : "rgba(255,255,255,0.4)", marginLeft: 6 }}>{plan.period}</span>
                  </p>
                </div>
                <p style={{ ...sans, fontSize: 13, color: plan.featured ? "rgba(11,22,40,0.6)" : "rgba(255,255,255,0.45)", lineHeight: 1.55, margin: 0 }}>{plan.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.feats.map((f) => (
                    <li key={f} style={{ ...sans, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: plan.featured ? "rgba(11,22,40,0.7)" : "rgba(255,255,255,0.6)" }}>
                      <span style={{ color: plan.featured ? "#0B1628" : "#A3E635", fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{ ...sans, marginTop: "auto", textAlign: "center", display: "block", background: plan.featured ? "#0B1628" : "rgba(255,255,255,0.08)", color: plan.featured ? "#A3E635" : "#fff", fontSize: 13, fontWeight: 600, padding: "11px", borderRadius: 8, textDecoration: "none" }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════ FINAL CTA ════ */}
      <div style={{ background: heroBg, borderTop: "1px solid rgba(255,255,255,0.07)", padding: "80px 24px", textAlign: "center", width: "100%" }}>
        <p style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "#A3E635", margin: "0 0 16px" }}>Ready to assess your site?</p>
        <h2 className="cta-h2" style={{ ...serif, fontSize: 48, fontWeight: 300, color: "#fff", letterSpacing: "-1px", margin: "0 0 16px" }}>Know before you commit.</h2>
        <p style={{ ...sans, fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.7 }}>
          Join the developers and architects using PlotWise to front-load planning intelligence.
        </p>
        <Link href="/signup" style={{ ...sans, display: "inline-block", background: "#A3E635", color: "#0B1628", fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 8, textDecoration: "none" }}>
          Start your free trial
        </Link>
      </div>

      {/* ════ FOOTER ════ */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: navBg, width: "100%" }}>
        <div className={`${innerCls} inner-pad`} style={{ padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ ...sans, fontSize: 14, fontWeight: 700, color: "rgba(12,11,11,0.25)" }}>Planning intelligence for UK property professionals.</span>
          <span style={{ ...sans, fontSize: 14, fontWeight: 700, color: "rgba(15,14,14,0.25)" }}>© 2026 PlotWise. All rights reserved.</span>
        </div>
      </div>
    </>
  );
}
