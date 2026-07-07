"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  getCurrentAccountProfile,
  updateCurrentAccountProfile,
  type CurrentAccountProfile,
} from "@/services/account/account-service";

import {
  getCurrentBillingOverview,
  type BillingOverview,
} from "@/services/billing/billing-service";

const sans = {
  fontFamily:
    "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily:
    "'Fraunces', Georgia, serif",
};

function formatDate(
  value: string | null
) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(value));
}

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<CurrentAccountProfile | null>(
      null
    );

  const [billing, setBilling] =
    useState<BillingOverview | null>(
      null
    );

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setErrorMessage("");

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

      if (profileResult.error) {
        setErrorMessage(
          profileResult.error.message
        );

        setLoading(false);
        return;
      }

      setProfile(profileResult.data);

      setFirstName(
        profileResult.data?.firstName || ""
      );

      setLastName(
        profileResult.data?.lastName || ""
      );

      if (!billingResult.error) {
        setBilling(billingResult.data);
      }

      setLoading(false);
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const accountTypeLabel = useMemo(() => {
    if (!billing) {
      return "PlotWize account";
    }

    return billing.audience ===
      "organization"
      ? "Organization account"
      : "Individual account";
  }, [billing]);

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result =
      await updateCurrentAccountProfile({
        firstName,
        lastName,
      });

    if (result.error) {
      setErrorMessage(
        result.error.message
      );

      setSaving(false);
      return;
    }

    setProfile(result.data);

    setSuccessMessage(
      "Your profile has been updated."
    );

    setSaving(false);
  }

  if (loading) {
    return (
      <div
        style={{
          ...sans,
          display: "flex",
          minHeight: "55vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#64748B",
            fontSize: 14,
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              border:
                "2px solid #DCE6CC",
              borderTopColor:
                "#639922",
              borderRadius: "50%",
              animation:
                "profile-spin 0.8s linear infinite",
            }}
          />

          Loading your profile...
        </div>

        <style>{`
          @keyframes profile-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .profile-page {
          width: 100%;
          max-width: 1080px;
        }

        .profile-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          background:
            radial-gradient(
              circle at top right,
              rgba(163,230,53,0.18),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              #0D2137 0%,
              #102A43 55%,
              #0E7490 130%
            );
          box-shadow:
            0 24px 60px
            rgba(15,23,42,0.14);
        }

        .profile-layout {
          display: grid;
          grid-template-columns:
            minmax(270px, 0.78fr)
            minmax(0, 1.5fr);
          gap: 22px;
          align-items: start;
          margin-top: 22px;
        }

        .profile-card {
          border: 1px solid #E3E9EF;
          border-radius: 17px;
          background: #FFFFFF;
          box-shadow:
            0 14px 38px
            rgba(15,23,42,0.06);
        }

        .profile-summary-card {
          position: relative;
          overflow: hidden;
        }

        .profile-summary-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto;
          height: 92px;
          background:
            linear-gradient(
              135deg,
              rgba(163,230,53,0.16),
              rgba(14,116,144,0.1)
            );
          pointer-events: none;
        }

        .profile-fields {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .profile-input {
          width: 100%;
          height: 46px;
          padding: 0 13px;
          border: 1px solid #CBD5E1;
          border-radius: 10px;
          outline: none;
          color: #0F172A;
          background: #FFFFFF;
          font-size: 13px;
          box-sizing: border-box;
          transition:
            border-color 0.16s ease,
            box-shadow 0.16s ease,
            background 0.16s ease;
        }

        .profile-input:focus {
          border-color: #7CB342;
          box-shadow:
            0 0 0 4px
            rgba(163,230,53,0.15);
        }

        .profile-input:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .profile-save-button {
          min-height: 44px;
          padding: 11px 20px;
          border: none;
          border-radius: 9px;
          background: #0D2137;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 750;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            opacity 0.16s ease;
        }

        .profile-save-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 10px 24px
            rgba(13,33,55,0.2);
        }

        .profile-save-button:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .profile-plan-link {
          transition:
            background 0.16s ease,
            transform 0.16s ease;
        }

        .profile-plan-link:hover {
          background: #EAF3DE !important;
          transform: translateY(-1px);
        }

        @media (max-width: 820px) {
          .profile-layout {
            grid-template-columns:
              minmax(0, 1fr);
          }
        }

        @media (max-width: 620px) {
          .profile-page-title {
            font-size: 31px !important;
          }

          .profile-hero {
            border-radius: 15px;
          }

          .profile-hero-inner {
            padding: 25px 22px !important;
          }

          .profile-fields {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .profile-card {
            border-radius: 13px;
          }

          .profile-form-card {
            padding: 20px !important;
          }

          .profile-save-row {
            align-items: stretch !important;
            flex-direction: column !important;
          }

          .profile-save-button {
            width: 100%;
          }
        }
      `}</style>

      <main
        className="profile-page"
        style={sans}
      >
        <section className="profile-hero">
          <div
            className="profile-hero-inner"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              justifyContent:
                "space-between",
              gap: 28,
              padding: "34px 36px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 12,
                  color: "#A3E635",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform:
                    "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <UserRound size={15} />

                Account profile
              </div>

              <h1
                className="profile-page-title"
                style={{
                  ...serif,
                  margin: "0 0 9px",
                  color: "#FFFFFF",
                  fontSize: 40,
                  fontWeight: 300,
                  letterSpacing: "-0.9px",
                }}
              >
                Your PlotWize account
              </h1>

              <p
                style={{
                  maxWidth: 610,
                  margin: 0,
                  color:
                    "rgba(255,255,255,0.62)",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                Manage your personal details,
                subscription status and account
                information from one place.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexShrink: 0,
                alignItems: "center",
                gap: 8,
                padding: "9px 13px",
                border:
                  "1px solid rgba(255,255,255,0.12)",
                borderRadius: 99,
                background:
                  "rgba(255,255,255,0.07)",
                color:
                  "rgba(255,255,255,0.75)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <ShieldCheck
                size={16}
                color="#A3E635"
              />

              Secure account
            </div>
          </div>
        </section>

        {errorMessage ? (
          <div
            role="alert"
            style={{
              marginTop: 18,
              padding: "13px 15px",
              border:
                "1px solid #FECACA",
              borderRadius: 10,
              background: "#FEF2F2",
              color: "#B91C1C",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginTop: 18,
              padding: "13px 15px",
              border:
                "1px solid #BBF7D0",
              borderRadius: 10,
              background: "#F0FDF4",
              color: "#15803D",
              fontSize: 13,
            }}
          >
            <Check
              size={17}
              strokeWidth={3}
            />

            {successMessage}
          </div>
        ) : null}

        <div className="profile-layout">
          <aside
            className="profile-card profile-summary-card"
            style={{
              padding: 22,
            }}
          >
            <div
              style={{
                position: "relative",
                paddingTop: 12,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 82,
                  height: 82,
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 17px",
                  border:
                    "5px solid #FFFFFF",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #A3E635, #639922)",
                  boxShadow:
                    "0 12px 26px rgba(99,153,34,0.22)",
                  color: "#0B1628",
                  fontSize: 25,
                  fontWeight: 850,
                  letterSpacing: "1px",
                }}
              >
                {profile?.initials || "U"}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: 6,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#0D2137",
                    fontSize: 19,
                    lineHeight: 1.3,
                  }}
                >
                  {profile?.fullName ||
                    "Your account"}
                </h2>

                <BadgeCheck
                  size={17}
                  color="#639922"
                />
              </div>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748B",
                  fontSize: 12,
                  overflowWrap:
                    "anywhere",
                }}
              >
                {profile?.email}
              </p>

              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 13,
                  padding: "6px 10px",
                  borderRadius: 99,
                  background: "#F0F9FF",
                  color: "#0E7490",
                  fontSize: 10,
                  fontWeight: 750,
                  textTransform:
                    "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {billing?.audience ===
                "organization" ? (
                  <Building2 size={13} />
                ) : (
                  <UserRound size={13} />
                )}

                {accountTypeLabel}
              </span>
            </div>

            <div
              style={{
                height: 1,
                margin: "22px 0",
                background: "#E8EDF2",
              }}
            />

            <div
              style={{
                padding: 16,
                border:
                  "1px solid #DCE6CC",
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, #F7FCEB, #F8FAFC)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent:
                    "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 5px",
                      color: "#64748B",
                      fontSize: 10,
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                      letterSpacing:
                        "0.7px",
                    }}
                  >
                    Current plan
                  </p>

                  <p
                    style={{
                      ...serif,
                      margin: 0,
                      color: "#0D2137",
                      fontSize: 23,
                      fontWeight: 600,
                    }}
                  >
                    {billing?.planName ||
                      "Unavailable"}
                  </p>
                </div>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 8px",
                    borderRadius: 99,
                    background:
                      billing?.isTrialing
                        ? "#EAF3DE"
                        : "#DCFCE7",
                    color:
                      billing?.isTrialing
                        ? "#3B6D11"
                        : "#15803D",
                    fontSize: 9,
                    fontWeight: 850,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.5px",
                  }}
                >
                  <Sparkles size={11} />

                  {billing?.isTrialing
                    ? "Trial"
                    : billing?.status ||
                      "Unknown"}
                </span>
              </div>

              {billing?.isTrialing &&
              billing.trialEnd ? (
                <div
                  style={{
                    display: "grid",
                    gap: 9,
                    marginTop: 15,
                    paddingTop: 14,
                    borderTop:
                      "1px solid #DCE6CC",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        color: "#64748B",
                        fontSize: 11,
                      }}
                    >
                      Time remaining
                    </span>

                    <strong
                      style={{
                        color: "#0D2137",
                        fontSize: 11,
                      }}
                    >
                      {
                        billing.trialDaysRemaining
                      }{" "}
                      days
                    </strong>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      overflow: "hidden",
                      borderRadius: 99,
                      background: "#E2E8F0",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            (
                              billing.trialDaysRemaining /
                              14
                            ) * 100
                          )
                        )}%`,
                        height: "100%",
                        borderRadius: 99,
                        background:
                          "linear-gradient(90deg, #639922, #A3E635)",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      color: "#64748B",
                      fontSize: 10,
                    }}
                  >
                    <CalendarDays
                      size={13}
                    />

                    Ends{" "}
                    {formatDate(
                      billing.trialEnd
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <Link
              href="/billing"
              className="profile-plan-link"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                gap: 8,
                marginTop: 14,
                padding: "11px 13px",
                border:
                  "1px solid #DCE6CC",
                borderRadius: 9,
                background: "#F7FCEB",
                color: "#3B6D11",
                fontSize: 12,
                fontWeight: 750,
                textDecoration: "none",
              }}
            >
              <CreditCard size={15} />

              View billing and usage
            </Link>
          </aside>

          <section
            className="profile-card profile-form-card"
            style={{
              padding: 27,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent:
                  "space-between",
                gap: 20,
                marginBottom: 25,
                paddingBottom: 22,
                borderBottom:
                  "1px solid #E8EDF2",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 6px",
                    color: "#639922",
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "0.7px",
                  }}
                >
                  Personal details
                </p>

                <h2
                  style={{
                    margin: "0 0 6px",
                    color: "#0D2137",
                    fontSize: 20,
                  }}
                >
                  Account information
                </h2>

                <p
                  style={{
                    maxWidth: 520,
                    margin: 0,
                    color: "#64748B",
                    fontSize: 12,
                    lineHeight: 1.65,
                  }}
                >
                  Keep your name up to date so
                  reports, workspace activity and
                  team records display the correct
                  information.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  width: 42,
                  height: 42,
                  flexShrink: 0,
                  alignItems: "center",
                  justifyContent:
                    "center",
                  borderRadius: 11,
                  background: "#EAF3DE",
                  color: "#3B6D11",
                }}
              >
                <UserRound size={20} />
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="profile-fields">
                <label>
                  <span
                    style={{
                      display: "block",
                      marginBottom: 8,
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 650,
                    }}
                  >
                    First name
                  </span>

                  <input
                    className="profile-input"
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(
                        event.target.value
                      )
                    }
                    placeholder="Enter first name"
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  <span
                    style={{
                      display: "block",
                      marginBottom: 8,
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 650,
                    }}
                  >
                    Last name
                  </span>

                  <input
                    className="profile-input"
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(
                        event.target.value
                      )
                    }
                    placeholder="Enter last name"
                    required
                    disabled={saving}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "block",
                  marginTop: 17,
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#334155",
                    fontSize: 12,
                    fontWeight: 650,
                  }}
                >
                  Email address
                </span>

                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <Mail
                    size={16}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: 13,
                      color: "#94A3B8",
                      transform:
                        "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  />

                  <input
                    className="profile-input"
                    type="email"
                    value={
                      profile?.email || ""
                    }
                    readOnly
                    style={{
                      paddingLeft: 40,
                      borderColor: "#E2E8F0",
                      background: "#F8FAFC",
                      color: "#64748B",
                      cursor: "not-allowed",
                    }}
                  />
                </div>

                <span
                  style={{
                    display: "block",
                    marginTop: 7,
                    color: "#94A3B8",
                    fontSize: 10,
                    lineHeight: 1.5,
                  }}
                >
                  Your email is managed through
                  your authenticated PlotWize
                  account.
                </span>
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: 13,
                    border:
                      "1px solid #E8EDF2",
                    borderRadius: 10,
                    background: "#FAFBFC",
                  }}
                >
                  <ShieldCheck
                    size={17}
                    color="#639922"
                    style={{
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  />

                  <div>
                    <p
                      style={{
                        margin: "0 0 3px",
                        color: "#334155",
                        fontSize: 11,
                        fontWeight: 750,
                      }}
                    >
                      Secure profile
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#94A3B8",
                        fontSize: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      Your account is protected
                      by Supabase authentication.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: 13,
                    border:
                      "1px solid #E8EDF2",
                    borderRadius: 10,
                    background: "#FAFBFC",
                  }}
                >
                  <BadgeCheck
                    size={17}
                    color="#0E7490"
                    style={{
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  />

                  <div>
                    <p
                      style={{
                        margin: "0 0 3px",
                        color: "#334155",
                        fontSize: 11,
                        fontWeight: 750,
                      }}
                    >
                      Verified account
                    </p>

                    <p
                      style={{
                        margin: 0,
                        color: "#94A3B8",
                        fontSize: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      Your email is linked to
                      your active workspace.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="profile-save-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: 16,
                  marginTop: 27,
                  paddingTop: 21,
                  borderTop:
                    "1px solid #E8EDF2",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#94A3B8",
                    fontSize: 10,
                    lineHeight: 1.5,
                  }}
                >
                  Changes apply immediately
                  across your PlotWize account.
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="profile-save-button"
                >
                  {saving
                    ? "Saving changes..."
                    : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}