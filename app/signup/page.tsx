"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

type AccountOption = {
  id: "professional" | "developer" | "enterprise";
  eyebrow: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  href: string;
  linkLabel: string;
  featured?: boolean;
  icon: React.ReactNode;
};

function IndividualIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function OrganizationIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 21V7h8v14" />
      <path d="M8 11h8" />
      <path d="M8 15h8" />
      <path d="M11 7V3" />
    </svg>
  );
}

function EnterpriseIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21h18" />
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="M9 21v-5h6v5" />
      <path d="M8 10h.01" />
      <path d="M12 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 13h.01" />
      <path d="M12 13h.01" />
      <path d="M16 13h.01" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function buildDestination(
  pathname: string,
  currentSearchParams: URLSearchParams,
  plan: AccountOption["id"]
) {
  const params = new URLSearchParams(
    currentSearchParams.toString()
  );

  params.set("plan", plan);

  const query = params.toString();

  return query
    ? `${pathname}?${query}`
    : pathname;
}

function SignupOptionsContent() {
  const searchParams = useSearchParams();

  const preservedParams = new URLSearchParams(
    searchParams.toString()
  );

  const loginParams = new URLSearchParams(
    searchParams.toString()
  );

  const loginHref = loginParams.toString()
    ? `/login?${loginParams.toString()}`
    : "/login";

  const options: AccountOption[] = [
    {
      id: "professional",
      eyebrow: "For individuals",
      title: "Individual",
      price: "£49/month",
      description:
        "For independent developers, architects and property professionals assessing their own opportunities.",
      features: [
        "50 projects each month",
        "50 planning assessments",
        "50 downloadable reports",
        "One personal workspace",
      ],
      href: buildDestination(
        "/signup/individual",
        preservedParams,
        "professional"
      ),
      linkLabel: "Create individual account",
      icon: <IndividualIcon />,
    },
    {
      id: "developer",
      eyebrow: "For growing teams",
      title: "Organization",
      price: "£100/month",
      description:
        "For property teams that need a shared workspace, collaborative projects and controlled member access.",
      features: [
        "100 projects each month",
        "100 planning assessments",
        "100 downloadable reports",
        "Up to 5 workspace users",
      ],
      href: buildDestination(
        "/signup/organization",
        preservedParams,
        "developer"
      ),
      linkLabel: "Create organization account",
      featured: true,
      icon: <OrganizationIcon />,
    },
    {
      id: "enterprise",
      eyebrow: "For larger companies",
      title: "Enterprise",
      price: "£140/month",
      description:
        "For established development companies requiring greater team capacity and unrestricted planning intelligence.",
      features: [
        "Unlimited projects",
        "Unlimited assessments",
        "Unlimited report downloads",
        "Up to 15 workspace users",
      ],
      href: buildDestination(
        "/signup/organization",
        preservedParams,
        "enterprise"
      ),
      linkLabel: "Create enterprise account",
      icon: <EnterpriseIcon />,
    },
  ];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          min-width: 320px;
          background: #08182a;
        }

        .account-choice-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 12% 18%,
              rgba(14, 116, 144, 0.2),
              transparent 29%
            ),
            radial-gradient(
              circle at 88% 12%,
              rgba(163, 230, 53, 0.11),
              transparent 26%
            ),
            linear-gradient(
              145deg,
              #071421 0%,
              #0d2137 52%,
              #0a1a2d 100%
            );
          color: #ffffff;
        }

        .account-choice-orb {
          position: absolute;
          border: 1px solid rgba(163, 230, 53, 0.09);
          border-radius: 999px;
          pointer-events: none;
        }

        .account-choice-shell {
          position: relative;
          z-index: 2;
          display: flex;
          width: 100%;
          min-height: 100vh;
          flex-direction: column;
          padding: 28px 42px 34px;
        }

        .account-choice-header {
          display: flex;
          width: 100%;
          max-width: 1260px;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin: 0 auto;
        }

        .account-choice-logo-link {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }

        .account-choice-signin {
          margin: 0;
          color: rgba(255, 255, 255, 0.58);
          font-size: 13px;
          line-height: 1.5;
          text-align: right;
        }

        .account-choice-signin a {
          color: #a3e635;
          font-weight: 700;
          text-decoration: none;
          transition: color 160ms ease;
        }

        .account-choice-signin a:hover {
          color: #c6f36f;
        }

        .account-choice-main {
          display: flex;
          width: 100%;
          max-width: 1260px;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          margin: 0 auto;
          padding: 52px 0 42px;
        }

        .account-choice-heading {
          max-width: 760px;
          margin: 0 auto 38px;
          text-align: center;
        }

        .account-choice-eyebrow {
          margin: 0 0 13px;
          color: #a3e635;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.7px;
        }

        .account-choice-title {
          margin: 0;
          color: #ffffff;
          font-size: clamp(34px, 5vw, 58px);
          font-weight: 300;
          line-height: 1.04;
          letter-spacing: -1.4px;
        }

        .account-choice-intro {
          max-width: 650px;
          margin: 18px auto 0;
          color: rgba(255, 255, 255, 0.58);
          font-size: 15px;
          line-height: 1.75;
        }

        .account-choice-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          align-items: stretch;
        }

        .account-choice-card {
          position: relative;
          display: flex;
          min-width: 0;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          box-shadow:
            0 18px 55px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.045);
          backdrop-filter: blur(13px);
          transition:
            transform 190ms ease,
            border-color 190ms ease,
            background 190ms ease,
            box-shadow 190ms ease;
        }

        .account-choice-card:hover {
          transform: translateY(-5px);
          border-color: rgba(163, 230, 53, 0.38);
          background: rgba(255, 255, 255, 0.075);
          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.28),
            0 0 0 1px rgba(163, 230, 53, 0.06);
        }

        .account-choice-card-featured {
          border-color: rgba(163, 230, 53, 0.54);
          background:
            linear-gradient(
              180deg,
              rgba(163, 230, 53, 0.095),
              rgba(255, 255, 255, 0.055)
            );
          box-shadow:
            0 0 0 1px rgba(163, 230, 53, 0.08),
            0 22px 65px rgba(0, 0, 0, 0.24);
        }

        .account-choice-recommended {
          padding: 8px 16px;
          background: #a3e635;
          color: #0b1628;
          font-size: 10px;
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .account-choice-card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 25px;
        }

        .account-choice-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .account-choice-icon {
          display: inline-flex;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(163, 230, 53, 0.17);
          border-radius: 13px;
          background: rgba(163, 230, 53, 0.1);
          color: #a3e635;
        }

        .account-choice-audience {
          display: inline-flex;
          padding: 5px 9px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.055);
          color: rgba(255, 255, 255, 0.48);
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .account-choice-card h2 {
          margin: 22px 0 6px;
          color: #ffffff;
          font-size: 29px;
          font-weight: 600;
          letter-spacing: -0.45px;
        }

        .account-choice-price {
          margin: 0 0 16px;
          color: #a3e635;
          font-size: 13px;
          font-weight: 800;
        }

        .account-choice-description {
          min-height: 72px;
          margin: 0;
          color: rgba(255, 255, 255, 0.56);
          font-size: 13px;
          line-height: 1.7;
        }

        .account-choice-features {
          display: grid;
          gap: 10px;
          margin: 22px 0 26px;
          padding: 20px 0 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          list-style: none;
        }

        .account-choice-feature {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 12px;
          line-height: 1.45;
        }

        .account-choice-check {
          display: inline-flex;
          width: 19px;
          height: 19px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
          border-radius: 99px;
          background: rgba(163, 230, 53, 0.12);
          color: #a3e635;
        }

        .account-choice-cta {
          display: inline-flex;
          width: 100%;
          min-height: 45px;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: auto;
          padding: 11px 14px;
          border: 1px solid rgba(163, 230, 53, 0.2);
          border-radius: 9px;
          background: rgba(163, 230, 53, 0.09);
          color: #a3e635;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition:
            background 160ms ease,
            border-color 160ms ease,
            color 160ms ease,
            transform 160ms ease;
        }

        .account-choice-cta:hover {
          transform: translateX(2px);
          border-color: #a3e635;
          background: #a3e635;
          color: #0b1628;
        }

        .account-choice-footnote {
          max-width: 850px;
          margin: 24px auto 0;
          padding: 13px 18px;
          border: 1px solid rgba(255, 255, 255, 0.075);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.035);
          color: rgba(255, 255, 255, 0.43);
          font-size: 11px;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 1040px) {
          .account-choice-shell {
            padding-right: 28px;
            padding-left: 28px;
          }

          .account-choice-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .account-choice-card:last-child {
            grid-column: 1 / -1;
            max-width: calc(50% - 9px);
            width: 100%;
            justify-self: center;
          }
        }

        @media (max-width: 720px) {
          .account-choice-shell {
            padding: 20px 18px 26px;
          }

          .account-choice-header {
            align-items: flex-start;
          }

          .account-choice-logo {
            width: 118px;
            height: auto;
          }

          .account-choice-signin {
            max-width: 145px;
            font-size: 12px;
          }

          .account-choice-main {
            justify-content: flex-start;
            padding: 48px 0 24px;
          }

          .account-choice-heading {
            margin-bottom: 28px;
          }

          .account-choice-title {
            font-size: 38px;
            letter-spacing: -0.8px;
          }

          .account-choice-intro {
            font-size: 14px;
          }

          .account-choice-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .account-choice-card:last-child {
            grid-column: auto;
            max-width: none;
          }

          .account-choice-description {
            min-height: 0;
          }
        }

        @media (max-width: 420px) {
          .account-choice-shell {
            padding-right: 14px;
            padding-left: 14px;
          }

          .account-choice-header {
            gap: 12px;
          }

          .account-choice-logo {
            width: 104px;
          }

          .account-choice-signin {
            max-width: 128px;
            font-size: 11px;
          }

          .account-choice-main {
            padding-top: 38px;
          }

          .account-choice-title {
            font-size: 32px;
          }

          .account-choice-intro {
            margin-top: 14px;
            font-size: 13px;
          }

          .account-choice-card-body {
            padding: 21px 18px;
          }

          .account-choice-card h2 {
            font-size: 26px;
          }

          .account-choice-footnote {
            padding-right: 13px;
            padding-left: 13px;
          }
        }
      `}</style>

      <main
        className="account-choice-page"
        style={sans}
      >
        <div
          className="account-choice-orb"
          style={{
            width: 480,
            height: 480,
            top: -210,
            right: -140,
          }}
        />

        <div
          className="account-choice-orb"
          style={{
            width: 310,
            height: 310,
            bottom: -145,
            left: -105,
          }}
        />

        <div className="account-choice-shell">
          <header className="account-choice-header">
            <Link
              href="/"
              className="account-choice-logo-link"
            >
              <Image
                className="account-choice-logo"
                src="/logo3.png"
                alt="PlotWize"
                width={148}
                height={72}
                style={{
                  objectFit: "contain",
                }}
                priority
              />
            </Link>

            <p className="account-choice-signin">
              Already have an account?{" "}
              <Link href={loginHref}>
                Sign in
              </Link>
            </p>
          </header>

          <section className="account-choice-main">
            <div className="account-choice-heading">
              <p className="account-choice-eyebrow">
                Create your account
              </p>

              <h1
                className="account-choice-title"
                style={serif}
              >
                How will you use PlotWize?
              </h1>

              <p className="account-choice-intro">
                Select the workspace that best
                matches how you assess planning
                opportunities. You can review or
                change your plan before payments
                are activated.
              </p>
            </div>

            <div className="account-choice-grid">
              {options.map((option) => (
                <article
                  key={option.id}
                  className={
                    option.featured
                      ? "account-choice-card account-choice-card-featured"
                      : "account-choice-card"
                  }
                >
                  {option.featured ? (
                    <div className="account-choice-recommended">
                      Recommended for teams
                    </div>
                  ) : null}

                  <div className="account-choice-card-body">
                    <div className="account-choice-card-top">
                      <span className="account-choice-icon">
                        {option.icon}
                      </span>

                      <span className="account-choice-audience">
                        {option.eyebrow}
                      </span>
                    </div>

                    <h2 style={serif}>
                      {option.title}
                    </h2>

                    <p className="account-choice-price">
                      {option.price}
                    </p>

                    <p className="account-choice-description">
                      {option.description}
                    </p>

                    <ul className="account-choice-features">
                      {option.features.map(
                        (feature) => (
                          <li
                            key={feature}
                            className="account-choice-feature"
                          >
                            <span className="account-choice-check">
                              <CheckIcon />
                            </span>

                            <span>{feature}</span>
                          </li>
                        )
                      )}
                    </ul>

                    <Link
                      href={option.href}
                      className="account-choice-cta"
                    >
                      <span>
                        {option.linkLabel}
                      </span>

                      <ArrowIcon />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <p className="account-choice-footnote">
              All account types can create projects,
              run planning-risk assessments and
              generate downloadable reports. Team
              capacity and monthly usage allowances
              depend on the selected plan.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            ...sans,
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            background: "#0D2137",
            color: "rgba(255,255,255,0.65)",
            fontSize: 14,
          }}
        >
          Loading account options...
        </main>
      }
    >
      <SignupOptionsContent />
    </Suspense>
  );
}