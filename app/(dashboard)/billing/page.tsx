"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  BarChart3,
  Building2,
  Check,
  Crown,
  Download,
  FileSearch,
  FolderKanban,
  Loader2,
  Users,
  UserRound,
} from "lucide-react";

import {
  BILLING_PLANS,
  formatPlanPrice,
  type BillingPlan,
} from "@/constants/billing-plans";

import {
  getCurrentBillingOverview,
  type BillingOverview,
  type BillingResourceUsage,
} from "@/services/billing/billing-service";

const sans = {
  fontFamily:
    "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily:
    "'Fraunces', Georgia, serif",
};

function PlanIcon({
  plan,
}: {
  plan: BillingPlan;
}) {
  if (plan.id === "professional") {
    return <UserRound size={22} />;
  }

  if (plan.id === "enterprise") {
    return <Crown size={22} />;
  }

  return <Building2 size={22} />;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function getUsagePercent(
  usage: BillingResourceUsage
) {
  if (
    usage.limit === null ||
    usage.limit <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (usage.used / usage.limit) * 100
    )
  );
}

function UsageCard({
  label,
  usage,
  icon,
}: {
  label: string;
  usage: BillingResourceUsage;
  icon: React.ReactNode;
}) {
  const percent =
    getUsagePercent(usage);

  const limitText =
    usage.limit === null
      ? "Unlimited"
      : usage.limit.toLocaleString(
          "en-GB"
        );

  return (
    <article className="billing-usage-card">
      <div className="billing-usage-heading">
        <span className="billing-usage-icon">
          {icon}
        </span>

        <div>
          <p className="billing-usage-label">
            {label}
          </p>

          <p className="billing-usage-value">
            {usage.used.toLocaleString(
              "en-GB"
            )}{" "}
            <span>
              / {limitText}
            </span>
          </p>
        </div>
      </div>

      {usage.limit === null ? (
        <p className="billing-unlimited-label">
          Unlimited usage
        </p>
      ) : (
        <>
          <div className="billing-progress-track">
            <div
              className="billing-progress-fill"
              style={{
                width: `${percent}%`,
              }}
            />
          </div>

          <p className="billing-usage-remaining">
            {usage.remaining?.toLocaleString(
              "en-GB"
            ) ?? "0"}{" "}
            remaining this month
          </p>
        </>
      )}
    </article>
  );
}

export default function BillingPage() {
  const [
    overview,
    setOverview,
  ] = useState<BillingOverview | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBilling() {
      setLoading(true);
      setErrorMessage("");

      try {
        const result =
          await getCurrentBillingOverview();

        if (!active) {
          return;
        }

        if (result.error) {
          throw result.error;
        }

        setOverview(result.data);
      } catch (error) {
        if (!active) {
          return;
        }

        console.error(
          "Billing overview loading failed:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Billing information could not be loaded."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBilling();

    return () => {
      active = false;
    };
  }, []);

  const activePlan =
    overview
      ? BILLING_PLANS.find(
          (plan) =>
            plan.id === overview.planId
        ) ?? null
      : null;

  return (
    <>
      <style>{`
        .billing-page {
          width: 100%;
          max-width: 1160px;
        }

        .billing-current-card {
          display: grid;
          grid-template-columns:
            minmax(0, 1.4fr)
            minmax(260px, 0.8fr);
          gap: 22px;
          margin-bottom: 26px;
          padding: 24px;
          border: 1px solid #E8EDF2;
          border-radius: 16px;
          background: #FFFFFF;
          box-shadow:
            0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .billing-current-summary {
          min-width: 0;
        }

        .billing-current-price {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 18px;
        }

        .billing-usage-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }

        .billing-usage-card {
          min-width: 0;
          padding: 18px;
          border: 1px solid #E8EDF2;
          border-radius: 13px;
          background: #FFFFFF;
          box-shadow:
            0 1px 3px rgba(15, 23, 42, 0.03);
        }

        .billing-usage-heading {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .billing-usage-icon {
          display: inline-flex;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #F2FCE4;
          color: #639922;
        }

        .billing-usage-label {
          margin: 0 0 2px;
          font-size: 11px;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .billing-usage-value {
          margin: 0;
          color: #0D2137;
          font-size: 18px;
          font-weight: 700;
        }

        .billing-usage-value span {
          color: #94A3B8;
          font-size: 12px;
          font-weight: 500;
        }

        .billing-progress-track {
          width: 100%;
          height: 7px;
          margin-top: 16px;
          overflow: hidden;
          border-radius: 99px;
          background: #E2E8F0;
        }

        .billing-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #A3E635;
          transition: width 200ms ease;
        }

        .billing-usage-remaining,
        .billing-unlimited-label {
          margin: 9px 0 0;
          color: #64748B;
          font-size: 11px;
        }

        .billing-plans-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
          align-items: stretch;
        }

        .billing-plan-card {
          position: relative;
          display: flex;
          min-width: 0;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          background: #FFFFFF;
          box-shadow:
            0 1px 3px rgba(15, 23, 42, 0.05);
        }

        .billing-plan-card-featured {
          border-color: #A3E635;
          box-shadow:
            0 0 0 1px #A3E635,
            0 12px 30px rgba(15, 23, 42, 0.08);
        }

        .billing-plan-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 26px;
        }

        .billing-plan-button {
          display: inline-flex;
          width: 100%;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          margin-top: auto;
          padding: 10px 16px;
          border: none;
          border-radius: 9px;
          background: #0D2137;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          cursor: not-allowed;
          opacity: 0.55;
        }

        @media (max-width: 980px) {
          .billing-current-card {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .billing-usage-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .billing-plans-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .billing-plan-card:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 680px) {
          .billing-page-title {
            font-size: 29px !important;
          }

          .billing-current-card {
            padding: 20px;
          }

          .billing-usage-grid,
          .billing-plans-grid {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .billing-plan-card:last-child {
            grid-column: auto;
          }

          .billing-plan-body {
            padding: 21px;
          }
        }
      `}</style>

      <main
        className="billing-page"
        style={sans}
      >
        <header
          style={{
            marginBottom: 28,
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              fontSize: 11,
              fontWeight: 700,
              color: "#639922",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}
          >
            Plans and billing
          </p>

          <h1
            className="billing-page-title"
            style={{
              ...serif,
              margin: "0 0 7px",
              fontSize: 34,
              fontWeight: 300,
              color: "#0D2137",
              letterSpacing: "-0.6px",
            }}
          >
            Billing and usage
          </h1>

          <p
            style={{
              maxWidth: 700,
              margin: 0,
              fontSize: 14,
              lineHeight: 1.7,
              color: "#64748B",
            }}
          >
            Review your current plan and
            monthly workspace usage.
          </p>
        </header>

        {errorMessage ? (
          <div
            role="alert"
            style={{
              marginBottom: 22,
              padding: "12px 14px",
              border:
                "1px solid #FECACA",
              borderRadius: 8,
              background: "#FEF2F2",
              color: "#B91C1C",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div
            style={{
              display: "flex",
              minHeight: 220,
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "#64748B",
              fontSize: 13,
            }}
          >
            <Loader2
              size={17}
              className="animate-spin"
            />
            Loading billing information...
          </div>
        ) : overview && activePlan ? (
          <>
            <section className="billing-current-card">
              <div className="billing-current-summary">
                <p
                  style={{
                    margin: "0 0 7px",
                    color: "#639922",
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                  }}
                >
                  Current plan
                </p>

                <h2
                  style={{
                    ...serif,
                    margin: 0,
                    color: "#0D2137",
                    fontSize: 27,
                    fontWeight: 600,
                  }}
                >
                  {overview.planName}
                </h2>

                <p
                  style={{
                    maxWidth: 620,
                    margin: "9px 0 0",
                    color: "#64748B",
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {activePlan.description}
                </p>

                <div className="billing-current-price">
                  <span
                    style={{
                      ...serif,
                      color: "#0D2137",
                      fontSize: 36,
                      fontWeight: 600,
                    }}
                  >
                    {formatPlanPrice(
                      activePlan
                    )}
                  </span>

                  <span
                    style={{
                      color: "#94A3B8",
                      fontSize: 12,
                    }}
                  >
                    / month
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 12,
                  background: "#F8FAFC",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <BarChart3
                    size={19}
                    color="#639922"
                  />

                  <p
                    style={{
                      margin: 0,
                      color: "#0D2137",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Current billing period
                  </p>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: "#64748B",
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {formatDate(
                    overview.periodStart
                  )}{" "}
                  to{" "}
                  {formatDate(
                    overview.periodEnd
                  )}
                </p>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#64748B",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Status:{" "}
                  <strong
                    style={{
                      color: "#0D2137",
                      textTransform:
                        "capitalize",
                    }}
                  >
                    {overview.status}
                  </strong>
                </p>
              </div>
            </section>

            <section
              className="billing-usage-grid"
              aria-label="Monthly usage"
            >
              <UsageCard
                label="Team users"
                usage={overview.team}
                icon={<Users size={18} />}
              />

              <UsageCard
                label="Projects"
                usage={overview.projects}
                icon={
                  <FolderKanban
                    size={18}
                  />
                }
              />

              <UsageCard
                label="Assessments"
                usage={overview.assessments}
                icon={
                  <FileSearch size={18} />
                }
              />

              <UsageCard
                label="Downloads"
                usage={overview.downloads}
                icon={
                  <Download size={18} />
                }
              />
            </section>
          </>
        ) : null}

        <section
          aria-label="PlotWize subscription plans"
        >
          <div
            style={{
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                ...serif,
                margin: "0 0 5px",
                color: "#0D2137",
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              Available plans
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748B",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Payment activation will be
              connected after the subscription
              lifecycle is finalized.
            </p>
          </div>

          <div className="billing-plans-grid">
            {BILLING_PLANS.map(
              (plan) => {
                const isCurrentPlan =
                  overview?.planId ===
                  plan.id;

                return (
                  <article
                    key={plan.id}
                    className={
                      plan.featured
                        ? "billing-plan-card billing-plan-card-featured"
                        : "billing-plan-card"
                    }
                  >
                    {plan.featured ? (
                      <div
                        style={{
                          padding:
                            "8px 18px",
                          background:
                            "#A3E635",
                          color:
                            "#0B1628",
                          fontSize: 11,
                          fontWeight: 800,
                          textAlign:
                            "center",
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.7px",
                        }}
                      >
                        Recommended for teams
                      </div>
                    ) : null}

                    <div className="billing-plan-body">
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "flex-start",
                          justifyContent:
                            "space-between",
                          gap: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            width: 46,
                            height: 46,
                            flexShrink: 0,
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            borderRadius: 12,
                            background:
                              plan.featured
                                ? "#F2FCE4"
                                : "#F1F5F9",
                            color:
                              plan.featured
                                ? "#639922"
                                : "#0D2137",
                          }}
                        >
                          <PlanIcon
                            plan={plan}
                          />
                        </div>

                        <span
                          style={{
                            display:
                              "inline-flex",
                            padding:
                              "5px 9px",
                            borderRadius: 99,
                            background:
                              isCurrentPlan
                                ? "#F2FCE4"
                                : "#F1F5F9",
                            color:
                              isCurrentPlan
                                ? "#639922"
                                : "#64748B",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.5px",
                          }}
                        >
                          {isCurrentPlan
                            ? "Current plan"
                            : plan.audience}
                        </span>
                      </div>

                      <h3
                        style={{
                          ...serif,
                          margin:
                            "22px 0 6px",
                          fontSize: 25,
                          fontWeight: 600,
                          color: "#0D2137",
                        }}
                      >
                        {plan.name}
                      </h3>

                      <p
                        style={{
                          minHeight: 66,
                          margin: 0,
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: "#64748B",
                        }}
                      >
                        {plan.description}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "baseline",
                          gap: 5,
                          marginTop: 22,
                          paddingBottom: 22,
                          borderBottom:
                            "1px solid #E8EDF2",
                        }}
                      >
                        <span
                          style={{
                            ...serif,
                            fontSize: 38,
                            fontWeight: 600,
                            color: "#0D2137",
                            letterSpacing:
                              "-1px",
                          }}
                        >
                          {formatPlanPrice(
                            plan
                          )}
                        </span>

                        <span
                          style={{
                            fontSize: 12,
                            color: "#94A3B8",
                          }}
                        >
                          / month
                        </span>
                      </div>

                      <ul
                        style={{
                          display: "grid",
                          gap: 12,
                          margin:
                            "22px 0 26px",
                          padding: 0,
                          listStyle: "none",
                        }}
                      >
                        {plan.features.map(
                          (feature) => (
                            <li
                              key={feature}
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "flex-start",
                                gap: 10,
                                fontSize: 13,
                                lineHeight:
                                  1.5,
                                color:
                                  "#334155",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "flex",
                                  width: 20,
                                  height: 20,
                                  flexShrink: 0,
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  marginTop: 1,
                                  borderRadius:
                                    99,
                                  background:
                                    "#F2FCE4",
                                  color:
                                    "#639922",
                                }}
                              >
                                <Check
                                  size={13}
                                  strokeWidth={3}
                                />
                              </span>

                              <span>
                                {feature}
                              </span>
                            </li>
                          )
                        )}
                      </ul>

                      <button
                        type="button"
                        disabled
                        className="billing-plan-button"
                      >
                        {isCurrentPlan
                          ? overview?.isTrialing
                            ? "Current trial"
                            : "Current plan"
                          : overview?.audience !==
                              plan.audience
                            ? "Different account type"
                            : `Switch to ${plan.name}`}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </section>
      </main>
    </>
  );
}