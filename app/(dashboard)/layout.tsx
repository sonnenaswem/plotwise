"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const heroBg = "#0D2137";

const navItems = [
  {
    group: "Overview",
    links: [{ href: "/dashboard",      label: "Dashboard",              icon: <GridIcon /> }],
  },
  {
    group: "Portfolio",
    links: [{ href: "/portfolio",      label: "Portfolio Analytics",    icon: <PieChartIcon /> }],
  },
  {
    group: "Work",
    links: [
      { href: "/projects",             label: "Projects",               icon: <FolderIcon /> },
      { href: "/assessments",          label: "Assessments",            icon: <ClipboardIcon /> },
      { href: "/reports",              label: "Reports",                icon: <FileTextIcon /> },
    ],
  },
  {
    group: "Intelligence",
    links: [
      { href: "/boroughs",             label: "Borough Intelligence",   icon: <MapIcon /> },
      { href: "/boroughs/types",       label: "Project Type Intel",     icon: <BarChartIcon /> },
      { href: "/trends",               label: "Planning Trends",        icon: <TrendIcon /> },
      { href: "/opportunities",        label: "Opportunity Finder",     icon: <SearchIcon /> },
    ],
  },
  {
    group: "Account",
    links: [
      { href: "/billing",              label: "Billing",                icon: <CreditCardIcon /> },
      { href: "/settings",             label: "Settings",               icon: <SettingsIcon /> },
      { href: "/api/logout",           label: "Log out",                icon: <LogoutIcon /> },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);   // mobile drawer

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", padding:"22px 16px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
        <Link href="/dashboard" onClick={() => setOpen(false)}>
          <Image src="/logo3.png" alt="PlotWise" width={180} height={120} style={{ objectFit:"contain" }} priority />
        </Link>
      </div>

      {/* Scrollable nav */}
      <nav style={{ flex:1, padding:"14px 10px", overflowY:"auto", scrollbarWidth:"none" }}>
        <style>{`nav::-webkit-scrollbar{display:none}`}</style>
        {navItems.map((group) => (
          <div key={group.group} style={{ marginBottom:14 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1.2px", textTransform:"uppercase", color:"rgba(255,255,255,0.25)", margin:"0 8px 7px", padding:0 }}>
              {group.group}
            </p>
            {group.links.map(({ href, label, icon }) => {
              const active = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"8px 10px", borderRadius:8, marginBottom:2,
                  textDecoration:"none",
                  background: active ? "rgba(163,230,53,0.1)" : "transparent",
                  color: active ? "#A3E635" : "rgba(255,255,255,0.55)",
                  fontSize:13, fontWeight: active ? 600 : 400,
                  borderLeft: active ? "2px solid #A3E635" : "2px solid transparent",
                  transition:"background 0.15s, color 0.15s",
                }}>
                  <span style={{ opacity: active ? 1 : 0.6, flexShrink:0 }}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding:"14px 18px", borderTop:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg, #A3E635, #3B6D11)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#0B1628", flexShrink:0 }}>U</div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.85)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Your account</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>Starter plan</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        /* Sidebar hover highlight */
        .dash-sidebar a:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.85) !important; }

        /* Desktop: fixed sidebar */
        .dash-sidebar-desktop {
          width: 232px; flex-shrink: 0; background: ${heroBg};
          display: flex; flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.07);
          position: fixed; top: 0; left: 0; height: 100vh;
          z-index: 40;
        }

        /* Mobile: hidden by default */
        .dash-sidebar-mobile {
          display: none;
          position: fixed; top: 0; left: 0; height: 100vh; width: 240px;
          background: ${heroBg}; flex-direction: column;
          border-right: 1px solid rgba(255,255,255,0.07);
          z-index: 50; transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .dash-sidebar-mobile.open { transform: translateX(0); }

        /* Overlay */
        .dash-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 45; opacity: 0; transition: opacity 0.25s;
        }
        .dash-overlay.open { opacity: 1; }

        /* Mobile top bar */
        .dash-mobile-bar { display: none; }

        /* Main content offset */
        .dash-main { margin-left: 232px; }

        @media (max-width: 768px) {
          .dash-sidebar-desktop { display: none; }
          .dash-sidebar-mobile  { display: flex; }
          .dash-overlay         { display: block; }
          .dash-mobile-bar      { display: flex; }
          .dash-main            { margin-left: 0; }
        }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", background:"#F1F5F9", fontFamily:"'Inter', system-ui, sans-serif" }}>

        {/* ── Desktop sidebar ── */}
        <aside className="dash-sidebar dash-sidebar-desktop">
          <SidebarContent />
        </aside>

        {/* ── Mobile overlay ── */}
        <div className={`dash-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} />

        {/* ── Mobile drawer ── */}
        <aside className={`dash-sidebar dash-sidebar-mobile${open ? " open" : ""}`}>
          <SidebarContent />
        </aside>

        {/* ── Main ── */}
        <main className="dash-main" style={{ flex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>

          {/* Mobile top bar */}
          <div className="dash-mobile-bar" style={{
            height:52, background:"#fff", alignItems:"center", justifyContent:"space-between",
            padding:"0 16px", borderBottom:"1px solid #E2E8F0", position:"sticky", top:0, zIndex:30,
          }}>
            <button onClick={() => setOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:8, display:"flex", flexDirection:"column", gap:4 }} aria-label="Open menu">
              <span style={{ width:20, height:2, background:"#0D2137", borderRadius:2, display:"block" }} />
              <span style={{ width:20, height:2, background:"#0D2137", borderRadius:2, display:"block" }} />
              <span style={{ width:20, height:2, background:"#0D2137", borderRadius:2, display:"block" }} />
            </button>
            <Image src="/logo3.png" alt="PlotWise" width={100} height={36} style={{ objectFit:"contain" }} />
            <Link href="/assessments" style={{ background:"#A3E635", color:"#0B1628", fontSize:12, fontWeight:700, padding:"7px 12px", borderRadius:7, textDecoration:"none", whiteSpace:"nowrap" }}>
              + New
            </Link>
          </div>

          {/* Desktop top bar */}
          <div style={{ height:52, background:"#fff", display:"flex", alignItems:"center", justifyContent:"flex-end", padding:"0 28px", borderBottom:"1px solid #E2E8F0", position:"sticky", top:0, zIndex:20, flexShrink:0 }}
            className="dash-desktop-bar">
            <style>{`.dash-desktop-bar { display: flex; } @media(max-width:768px){.dash-desktop-bar{display:none!important;}}`}</style>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Link href="/assessments" style={{ background:"#EAF3DE", color:"#3B6D11", fontSize:13, fontWeight:600, padding:"7px 14px", borderRadius:7, textDecoration:"none" }}>
                + New Assessment
              </Link>
              <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg, #A3E635, #3B6D11)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#0B1628" }}>U</div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex:1, padding:"28px 28px", maxWidth:"100%", overflowX:"hidden" }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

/* ── Icons ── */
function GridIcon()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function PieChartIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>; }
function FolderIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>; }
function ClipboardIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>; }
function FileTextIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function MapIcon()       { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>; }
function BarChartIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>; }
function TrendIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>; }
function SearchIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function CreditCardIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>; }
function SettingsIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function LogoutIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
