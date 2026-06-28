"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";


const sans = { fontFamily: "'Inter', system-ui, sans-serif" };
const heroBg = "#0D2137";

const navItems = [
  {
    group: "Overview",
    links: [
      { href: "/dashboard",    label: "Dashboard",       icon: <GridIcon /> },
    ],
  },
  {
    group: "Portfolio",
    links: [
      { href: "/portfolio", label: "Portfolio Analytics", icon: <PieChartIcon /> },
      // { href: "/trends", label: "Planning Trends", icon: <BarChartIcon /> },
    ],
  },
  {
    group: "Work",
    links: [
      { href: "/projects",     label: "Projects",        icon: <FolderIcon /> },
      { href: "/assessments",  label: "Assessments",     icon: <ClipboardIcon /> },
      { href: "/reports",      label: "Reports",         icon: <FileTextIcon /> },
    ],
  },
  {
    group: "Intelligence",
    links: [
      { href: "/boroughs",           label: "Borough Intelligence",      icon: <MapIcon /> },
      { href: "/boroughs/types",     label: "Project Type Intelligence", icon: <BarChartIcon /> },
      { href: "/opportunities",      label: "Opportunity Finder",        icon: <SearchIcon /> },
    ],
  },
  {
    group: "Account",
    links: [
      { href: "/billing",      label: "Billing",         icon: <CreditCardIcon /> },
      { href: "/settings",     label: "Settings",        icon: <SettingsIcon /> },
      { href: "/api/logout",   label: "Log out",         icon: <LogoutIcon /> },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  

  return (
    <div style={{ ...sans, display: "flex", minHeight: "100vh", background: "#F1F5F9" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        background: heroBg,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        overflowY: "auto",
        scrollbarWidth: "none",
        transition: "width 0.3s ease",
      }}>
        <style>{`
          aside::-webkit-scrollbar { width: 4px; }
          aside::-webkit-scrollbar-track { background: transparent; }
          aside::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; transition: background 0.2s; }
          aside:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }
        `}</style>
        {/* Logo */}
        <div className="flex justify-center items-center py-6 px-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <Link href="/dashboard">
            <Image
              src="/logo3.png"
              alt="PlotWise"
              width={205}
              height={150}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map((group) => (
            <div key={group.group} style={{ marginBottom: 16 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "1.2px",
                textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
                margin: "0 8px 8px", padding: 0,
              }}>{group.group}</p>
              {group.links.map(({ href, label, icon }) => {
                const active = pathname === href 
                return (
                  <Link key={href} href={href} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 8, marginBottom: 2,
                    textDecoration: "none",
                    background: active ? "rgba(163,230,53,0.1)" : "transparent",
                    color: active ? "#A3E635" : "rgba(255,255,255,0.55)",
                    fontSize: 13, fontWeight: active ? 600 : 400,
                    transition: "background 0.15s, color 0.15s",
                    borderLeft: active ? "2px solid #A3E635" : "2px solid transparent",
                  }}>
                    <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom user area */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        
        <div style={{ flex: 1, padding: "32px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
// ── SVG Icons ──
function GridIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function PieChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  );
}
function FolderIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
function ClipboardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
}
function FileTextIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
}
function MapIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
}
function BarChartIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function CreditCardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
