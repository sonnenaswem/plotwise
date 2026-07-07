"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentAccountProfile,
  type CurrentAccountProfile,
} from "@/services/account/account-service";

import {
  getCurrentBillingOverview,
  type BillingOverview,
} from "@/services/billing/billing-service";

const heroBg = "#0D2137";

type NavLinkItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type NavGroup = {
  group: string;
  links: NavLinkItem[];
};

const navItems: NavGroup[] = [
  {
    group: "Overview",
    links: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <GridIcon />,
      },
    ],
  },
  {
    group: "Portfolio",
    links: [
      {
        href: "/portfolio",
        label: "Portfolio Analytics",
        icon: <PieChartIcon />,
      },
    ],
  },
  {
    group: "Work",
    links: [
      {
        href: "/projects",
        label: "Projects",
        icon: <FolderIcon />,
      },
      {
        href: "/assessments",
        label: "Assessments",
        icon: <ClipboardIcon />,
      },
      {
        href: "/reports",
        label: "Reports",
        icon: <FileTextIcon />,
      },
    ],
  },
  {
    group: "Intelligence",
    links: [
      {
        href: "/boroughs",
        label: "Borough Intelligence",
        icon: <MapIcon />,
      },
      {
        href: "/boroughs/types",
        label: "Project Type Intel",
        icon: <BarChartIcon />,
      },
      {
        href: "/trends",
        label: "Planning Trends",
        icon: <TrendIcon />,
      },
      {
        href: "/opportunities",
        label: "Opportunity Finder",
        icon: <SearchIcon />,
      },
    ],
  },
  {
    group: "Account",
    links: [
      {
        href: "/billing",
        label: "Billing",
        icon: <CreditCardIcon />,
      },
      {
        href: "/settings",
        label: "Settings",
        icon: <SettingsIcon />,
      },
      {
        href: "/api/logout",
        label: "Log out",
        icon: <LogoutIcon />,
      },
    ],
  },
];

function SidebarContent({
  pathname,
  compact,
  onNavigate,
  profile,
  billing,
}: {
  pathname: string;
  compact: boolean;
  onNavigate: () => void;
  profile: CurrentAccountProfile | null;
  billing: BillingOverview | null;
}) {
  const accountName =
    profile?.fullName || "Your account";

  const accountInitials =
    profile?.initials || "U";

  const planName = billing
    ? billing.isTrialing
      ? `${billing.planName} · ${billing.trialDaysRemaining}d trial`
      : billing.planName
    : "Loading plan";

  return (
    <>
      <div
        className="dash-sidebar-logo"
        style={{
          display: "flex",
          minHeight: 84,
          alignItems: "center",
          justifyContent: "center",
          padding: compact
            ? "18px 10px"
            : "18px 16px",
          borderBottom:
            "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="PlotWize dashboard"
        >
          <Image
            src="/logo4.png"
            alt="PlotWize"
            width={compact ? 46 : 180}
            height={compact ? 46 : 90}
            style={{
              display: "block",
              objectFit: "contain",
            }}
            priority
          />
        </Link>
      </div>

      <nav
        className="dash-sidebar-nav"
        style={{
          flex: 1,
          padding: compact
            ? "14px 8px"
            : "14px 10px",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {navItems.map((group) => (
          <div
            key={group.group}
            style={{
              marginBottom: 14,
            }}
          >
            {!compact ? (
              <p
                style={{
                  margin: "0 8px 7px",
                  padding: 0,
                  color:
                    "rgba(255,255,255,0.25)",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                }}
              >
                {group.group}
              </p>
            ) : null}

            {group.links.map(
              ({ href, label, icon }) => {
                const active =
                  pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    title={
                      compact
                        ? label
                        : undefined
                    }
                    onClick={onNavigate}
                    style={{
                      display: "flex",
                      minHeight: 38,
                      alignItems: "center",
                      justifyContent:
                        compact
                          ? "center"
                          : "flex-start",
                      gap: 10,
                      marginBottom: 2,
                      padding: compact
                        ? "9px"
                        : "8px 10px",
                      borderLeft: active
                        ? "2px solid #A3E635"
                        : "2px solid transparent",
                      borderRadius: 8,
                      background: active
                        ? "rgba(163,230,53,0.1)"
                        : "transparent",
                      color: active
                        ? "#A3E635"
                        : "rgba(255,255,255,0.55)",
                      fontSize: 13,
                      fontWeight: active
                        ? 600
                        : 400,
                      textDecoration: "none",
                      transition:
                        "background 0.15s, color 0.15s",
                    }}
                  >
                    <span
                      style={{
                        display:
                          "inline-flex",
                        flexShrink: 0,
                        opacity: active
                          ? 1
                          : 0.6,
                      }}
                    >
                      {icon}
                    </span>

                    {!compact ? (
                      <span>{label}</span>
                    ) : null}
                  </Link>
                );
              }
            )}
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: compact
            ? "12px 8px"
            : "14px 12px",
          borderTop:
            "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <Link
          href="/profile"
          onClick={onNavigate}
          title={
            compact
              ? `${accountName} — ${planName}`
              : undefined
          }
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: compact
              ? "center"
              : "flex-start",
            gap: 10,
            padding: compact
              ? 6
              : "8px 7px",
            borderRadius: 9,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 34,
              height: 34,
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #A3E635, #3B6D11)",
              color: "#0B1628",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.4px",
            }}
          >
            {accountInitials}
          </div>

          {!compact ? (
            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <p
                style={{
                  margin: 0,
                  overflow: "hidden",
                  color:
                    "rgba(255,255,255,0.88)",
                  fontSize: 12,
                  fontWeight: 600,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {accountName}
              </p>

              <p
                style={{
                  margin: 0,
                  color:
                    "rgba(255,255,255,0.38)",
                  fontSize: 11,
                  textTransform: "capitalize",
                }}
              >
                {planName}
              </p>
            </div>
          ) : null}
        </Link>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname =
    usePathname() || "/dashboard";

  const [open, setOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const [profile, setProfile] =
    useState<CurrentAccountProfile | null>(
      null
    );

  const [billing, setBilling] =
    useState<BillingOverview | null>(
      null
    );

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const [
        profileResult,
        billingResult,
      ] = await Promise.all([
        getCurrentAccountProfile(),
        getCurrentBillingOverview(),
      ]);

      if (!active) {
        return;
      }

      if (!profileResult.error) {
        setProfile(profileResult.data);
      }

      if (!billingResult.error) {
        setBilling(billingResult.data);
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open]);

  return (
    <>
      <style>{`
        .dash-shell {
          --dash-sidebar-width: 232px;
        }

        .dash-shell.sidebar-collapsed {
          --dash-sidebar-width: 76px;
        }

        .dash-sidebar a:hover {
          background: rgba(255,255,255,0.06) !important;
          color: rgba(255,255,255,0.85) !important;
        }

        .dash-sidebar-nav::-webkit-scrollbar {
          display: none;
        }

        .dash-sidebar-desktop {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 40;
          display: flex;
          width: var(--dash-sidebar-width);
          height: 100vh;
          flex-direction: column;
          border-right:
            1px solid rgba(255,255,255,0.07);
          background: ${heroBg};
          transition: width 180ms ease;
        }

        .dash-collapse-button {
          position: fixed;
          top: 16px;
          left: calc(
            var(--dash-sidebar-width) - 15px
          );
          z-index: 44;
          display: inline-flex;
          width: 30px;
          height: 30px;
          align-items: center;
          justify-content: center;
          border:
            1px solid rgba(255,255,255,0.12);
          border-radius: 999px;
          background: #17304B;
          color: #FFFFFF;
          cursor: pointer;
          box-shadow:
            0 4px 12px rgba(0,0,0,0.18);
          transition:
            left 180ms ease,
            transform 180ms ease;
        }

        .dash-collapse-button:hover {
          background: #213D59;
        }

        .dash-sidebar-mobile {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 50;
          display: none;
          width: 260px;
          height: 100dvh;
          flex-direction: column;
          border-right:
            1px solid rgba(255,255,255,0.07);
          background: ${heroBg};
          transform: translateX(-100%);
          transition:
            transform 0.28s
            cubic-bezier(0.4,0,0.2,1);
        }

        .dash-sidebar-mobile.open {
          transform: translateX(0);
        }

        .dash-overlay {
          position: fixed;
          inset: 0;
          z-index: 45;
          display: none;
          background: rgba(0,0,0,0.52);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s;
        }

        .dash-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        .dash-mobile-bar {
          display: none;
        }

        .dash-main {
          min-width: 0;
          margin-left:
            var(--dash-sidebar-width);
          transition: margin-left 180ms ease;
        }

        .dash-page-content {
          flex: 1;
          width: 100%;
          max-width: 100%;
          padding: 28px;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        @media (max-width: 900px) {
          .dash-sidebar-desktop,
          .dash-collapse-button {
            display: none;
          }

          .dash-sidebar-mobile {
            display: flex;
          }

          .dash-overlay {
            display: block;
          }

          .dash-mobile-bar {
            display: flex;
          }

          .dash-main {
            margin-left: 0;
          }
        }

        @media (max-width: 640px) {
          .dash-page-content {
            padding: 20px 16px;
          }

          .dash-mobile-new-project {
            padding: 7px 9px !important;
            font-size: 11px !important;
          }
        }

        @media (max-width: 390px) {
          .dash-mobile-logo {
            width: 84px !important;
          }

          .dash-mobile-new-project {
            font-size: 0 !important;
          }

          .dash-mobile-new-project::after {
            content: "+";
            font-size: 18px;
          }
        }
      `}</style>

      <div
        className={
          collapsed
            ? "dash-shell sidebar-collapsed"
            : "dash-shell"
        }
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "#F1F5F9",
          fontFamily:
            "'Inter', system-ui, sans-serif",
        }}
      >
        <aside className="dash-sidebar dash-sidebar-desktop">
          <SidebarContent
            pathname={pathname}
            compact={collapsed}
            onNavigate={() => undefined}
            profile={profile}
            billing={billing}
          />
        </aside>

        <button
          type="button"
          className="dash-collapse-button"
          onClick={() =>
            setCollapsed(
              (current) => !current
            )
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          title={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: collapsed
                ? "rotate(180deg)"
                : "none",
            }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          className={`dash-overlay${
            open ? " open" : ""
          }`}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />

        <aside
          className={`dash-sidebar dash-sidebar-mobile${
            open ? " open" : ""
          }`}
          aria-hidden={!open}
        >
          <SidebarContent
            pathname={pathname}
            compact={false}
            onNavigate={() =>
              setOpen(false)
            }
            profile={profile}
            billing={billing}
          />
        </aside>

        <main
          className="dash-main"
          style={{
            display: "flex",
            minHeight: "100vh",
            flex: 1,
            flexDirection: "column",
          }}
        >
          <div
            className="dash-mobile-bar"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 30,
              height: 56,
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: 10,
              padding: "0 14px",
              borderBottom:
                "1px solid #E2E8F0",
              background: "#FFFFFF",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setOpen(true)
              }
              style={{
                display: "flex",
                width: 38,
                height: 38,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                padding: 8,
                border: "none",
                borderRadius: 8,
                background: "none",
                cursor: "pointer",
              }}
              aria-label="Open navigation menu"
            >
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                  borderRadius: 2,
                  background: "#0D2137",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                  borderRadius: 2,
                  background: "#0D2137",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                  borderRadius: 2,
                  background: "#0D2137",
                }}
              />
            </button>

            <Image
              className="dash-mobile-logo"
              src="/logo3.png"
              alt="PlotWize"
              width={100}
              height={40}
              style={{
                objectFit: "contain",
              }}
            />

            <Link
              href="/projects"
              className="dash-mobile-new-project"
              style={{
                padding: "7px 12px",
                borderRadius: 7,
                background: "#A3E635",
                color: "#0B1628",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              + New Project
            </Link>
          </div>

          <div className="dash-page-content">
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
