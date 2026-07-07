"use client";

import {
  type FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  ShieldCheck,
  UserRound,
  Zap,
} from "lucide-react";

import {
  createAuthCallbackUrl,
  getSafeInternalPath,
} from "@/lib/auth/redirects";

import {
  createProfile,
  signUp,
} from "@/services/auth/auth-service";

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return score;
}

function IndividualSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedDestination =
    getSafeInternalPath(
      searchParams.get("next")
    );

  const invitedEmail =
    searchParams
      .get("email")
      ?.trim()
      .toLowerCase() ?? "";

  const isInvitationSignup =
    requestedDestination.startsWith(
      "/invitations/"
    ) && Boolean(invitedEmail);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState(invitedEmail);

  const [password, setPassword] =
    useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    passwordStrength,
    setPasswordStrength,
  ] = useState(0);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  useEffect(() => {
    setPasswordStrength(
      getPasswordStrength(password)
    );
  }, [password]);

  const loginParams =
    new URLSearchParams();

  loginParams.set(
    "next",
    requestedDestination
  );

  if (invitedEmail) {
    loginParams.set(
      "email",
      invitedEmail
    );
  }

  const loginHref =
    `/login?${loginParams.toString()}`;

  const backHref =
    isInvitationSignup
      ? requestedDestination
      : "/signup";

  const strengthLabels = [
    "",
    "Weak",
    "Fair",
    "Good",
    "Strong",
  ];

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail =
      email.trim().toLowerCase();

    const normalizedFirstName =
      firstName.trim();

    const normalizedLastName =
      lastName.trim();

    if (!normalizedFirstName) {
      setErrorMessage(
        "Please enter your first name."
      );
      return;
    }

    if (!normalizedLastName) {
      setErrorMessage(
        "Please enter your last name."
      );
      return;
    }

    if (!normalizedEmail) {
      setErrorMessage(
        "Please enter your email address."
      );
      return;
    }

    if (
      isInvitationSignup &&
      normalizedEmail !== invitedEmail
    ) {
      setErrorMessage(
        `This invitation requires the email address ${invitedEmail}.`
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const emailRedirectTo =
        createAuthCallbackUrl(
          requestedDestination
        );

      const {
        data,
        error: authenticationError,
      } = await signUp(
        normalizedEmail,
        password,
        {
          firstName:
            normalizedFirstName,

          lastName:
            normalizedLastName,

          accountType: "individual",

          emailRedirectTo,
        }
      );

      if (authenticationError) {
        setErrorMessage(
          authenticationError.message
        );
        return;
      }

      const user = data.user;
      const session = data.session;

      if (!user) {
        setErrorMessage(
          "Your account could not be created. Please try again."
        );
        return;
      }
      
      // if (!session) {
      //   const verifyUrl =
      //     new URL(
      //       "/verify-email",
      //       window.location.origin
      //     );

      //   verifyUrl.searchParams.set(
      //     "email",
      //     normalizedEmail
      //   );

      //   verifyUrl.searchParams.set(
      //     "next",
      //     requestedDestination
      //   );

      //   router.replace(
      //     `${verifyUrl.pathname}${verifyUrl.search}`
      //   );

      //   return;
      // }

      if (!session) {
        setSuccessMessage(
          isInvitationSignup
            ? "Your account has been created. Open the confirmation email we sent you. After confirmation, you will return automatically to this invitation."
            : "Your account has been created. Open the confirmation email we sent you to finish signing in."
        );
        return;
      }

      const { error: profileError } =
        await createProfile({
          userId: user.id,
          email: normalizedEmail,
          firstName:
            normalizedFirstName,
          lastName:
            normalizedLastName,
        });

      if (profileError) {
        setErrorMessage(
          `Your account was created, but your profile could not be saved: ${profileError.message}`
        );
        return;
      }

      router.replace(
        requestedDestination
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Individual signup failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        // html,
        // body {
        //   margin: 0;
        //   min-width: 320px;
        //   background: #ffffff;
        // }

        .individual-signup-page {
          display: grid;
          width: 100%;
          min-width: 0;
          min-height: 100vh;
          min-height: 100dvh;
          grid-template-columns:
            minmax(360px, 0.82fr)
            minmax(0, 1.18fr);
          overflow-x: clip;
          background: #ffffff;
        }

        .individual-signup-brand {
          position: relative;
          display: flex;
          min-width: 0;
          flex-direction: column;
          overflow: hidden;
          min-height: 100vh;
          min-height: 100dvh;
          padding:
            30px
            clamp(28px, 3.2vw, 52px)
            38px;
          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(14, 116, 144, 0.25),
              transparent 30%
            ),
            radial-gradient(
              circle at 90% 85%,
              rgba(163, 230, 53, 0.1),
              transparent 28%
            ),
            linear-gradient(
              145deg,
              #071421 0%,
              #0d2137 58%,
              #0a1a2d 100%
            );
          color: #ffffff;
        }

        .individual-signup-orb {
          position: absolute;
          border:
            1px solid
            rgba(163, 230, 53, 0.09);
          border-radius: 999px;
          pointer-events: none;
        }

        .individual-signup-brand-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .individual-signup-brand-content {
          position: relative;
          z-index: 2;
          display: flex;
          max-width: 470px;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          margin: 36px auto 0;
        }

        .individual-signup-brand h2 {
          margin: 0;
          color: #ffffff;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 300;
          line-height: 1.06;
          letter-spacing: -1.1px;
        }

        .individual-signup-brand-copy {
          max-width: 430px;
          margin: 18px 0 34px;
          color:
            rgba(255, 255, 255, 0.58);
          font-size: 15px;
          line-height: 1.75;
        }

        .individual-benefits {
          display: grid;
          gap: 18px;
        }

        .individual-benefit {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .individual-benefit-icon {
          display: inline-flex;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border:
            1px solid
            rgba(163, 230, 53, 0.18);
          border-radius: 11px;
          background:
            rgba(163, 230, 53, 0.1);
          color: #a3e635;
        }

        .individual-benefit h3 {
          margin: 0 0 3px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
        }

        .individual-benefit p {
          margin: 0;
          color:
            rgba(255, 255, 255, 0.46);
          font-size: 12px;
          line-height: 1.55;
        }

        .individual-plan-summary {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 36px;
          padding: 16px 18px;
          border:
            1px solid
            rgba(255, 255, 255, 0.09);
          border-radius: 12px;
          background:
            rgba(255, 255, 255, 0.045);
        }

        .individual-plan-summary p {
          margin: 0;
        }

        .individual-signup-form-side {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 100vh;
          min-height: 100dvh;
          flex-direction: column;
          padding:
            26px
            clamp(30px, 3.4vw, 58px)
            36px;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #fbfdff 100%
            );
        }

        .individual-signup-top {
          display: flex;
          min-height: 50px;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .individual-signup-top a {
          color: #639922;
          font-weight: 700;
          text-decoration: none;
        }

        .individual-mobile-logo {
          display: none;
        }

        .individual-form-shell {
          width: 100%;
          max-width: 530px;
          margin: auto;
          padding: 34px 0 24px;
        }

        .individual-form-shell,
        .individual-form-header,
        .individual-field,
        .individual-message {
          min-width: 0;
        }

        .individual-form-description,
        .individual-message,
        .individual-signin-bottom,
        .individual-terms {
          overflow-wrap: anywhere;
        }

        .individual-back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 25px;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
          transition: color 160ms ease;
        }

        .individual-back-link:hover {
          color: #0d2137;
        }

        .individual-form-header {
          margin-bottom: 28px;
        }

        .individual-form-icon {
          display: inline-flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          margin-bottom: 17px;
          border-radius: 13px;
          background: #f2fce4;
          color: #639922;
        }

        .individual-form-eyebrow {
          margin: 0 0 9px;
          color: #639922;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .individual-form-title {
          margin: 0;
          color: #0d2137;
          font-size: clamp(30px, 4vw, 42px);
          font-weight: 300;
          line-height: 1.08;
          letter-spacing: -0.8px;
        }

        .individual-form-description {
          max-width: 500px;
          margin: 13px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        .individual-invitation-notice {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-bottom: 20px;
          padding: 13px 14px;
          border: 1px solid #d9f99d;
          border-radius: 10px;
          background: #f7fee7;
          color: #3f6212;
          font-size: 12px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .individual-form {
          display: grid;
          gap: 17px;
        }

        .individual-name-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .individual-field label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .individual-input {
          width: 100%;
          height: 44px;
          padding: 0 13px;
          border: 1.5px solid #dbe3ec;
          border-radius: 9px;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          font-family:
            "Inter",
            system-ui,
            sans-serif;
          font-size: 13px;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .individual-input::placeholder {
          color: #94a3b8;
        }

        .individual-input:focus {
          border-color: #639922;
          box-shadow:
            0 0 0 3px
            rgba(99, 153, 34, 0.1);
        }

        .individual-input:disabled {
          cursor: not-allowed;
          background: #f1f5f9;
        }

        .individual-input[readonly] {
          cursor: not-allowed;
          background: #f1f5f9;
          color: #475569;
        }

        .individual-password-wrap {
          position: relative;
        }

        .individual-password-wrap
          .individual-input {
          padding-right: 50px;
        }

        .individual-password-toggle {
          position: absolute;
          top: 50%;
          right: 11px;
          display: inline-flex;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transform: translateY(-50%);
        }

        .individual-password-toggle:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .individual-strength {
          margin-top: 8px;
        }

        .individual-strength-bars {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 4px;
        }

        .individual-strength-bar {
          height: 3px;
          border-radius: 99px;
          background: #e2e8f0;
        }

        .individual-strength-label {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 650;
        }

        .individual-message {
          padding: 12px 14px;
          border-radius: 9px;
          font-size: 12px;
          line-height: 1.6;
        }

        .individual-message-error {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .individual-message-success {
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          color: #15803d;
        }

        .individual-submit {
          display: inline-flex;
          width: 100%;
          min-height: 46px;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 2px;
          padding: 11px 18px;
          border: none;
          border-radius: 9px;
          background: #a3e635;
          color: #0b1628;
          font-family:
            "Inter",
            system-ui,
            sans-serif;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }

        .individual-submit:hover:not(:disabled) {
          background: #b7ed58;
          box-shadow:
            0 10px 25px
            rgba(99, 153, 34, 0.18);
          transform: translateY(-1px);
        }

        .individual-submit:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .individual-signin-bottom {
          margin: 21px 0 0;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }

        .individual-signin-bottom a {
          color: #639922;
          font-weight: 750;
          text-decoration: none;
        }

        .individual-terms {
          margin: 17px 0 0;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.6;
          text-align: center;
        }

        .individual-back-link:focus-visible,
        .individual-signup-top a:focus-visible,
        .individual-mobile-logo a:focus-visible,
        .individual-signin-bottom a:focus-visible,
        .individual-password-toggle:focus-visible,
        .individual-submit:focus-visible {
          outline: 3px solid
            rgba(99, 153, 34, 0.25);
          outline-offset: 3px;
        }

        .individual-input:focus-visible {
          border-color: #639922;
          box-shadow:
            0 0 0 3px
            rgba(99, 153, 34, 0.1);
        }
        @media (max-width: 980px) {
          .individual-signup-page {
            grid-template-columns:
              minmax(310px, 0.72fr)
              minmax(0, 1.28fr);
          }

          .individual-signup-brand {
            padding-right: 28px;
            padding-left: 28px;
          }

          .individual-signup-form-side {
            padding-right: 30px;
            padding-left: 30px;
          }
        }

                @media (max-width: 780px) {
          .individual-signup-page {
            display: block;
            min-height: 100vh;
            min-height: 100dvh;
            padding: 14px;
            background:
              radial-gradient(
                circle at 12% 10%,
                rgba(14, 116, 144, 0.24),
                transparent 34%
              ),
              radial-gradient(
                circle at 90% 88%,
                rgba(163, 230, 53, 0.11),
                transparent 31%
              ),
              linear-gradient(
                145deg,
                #071421 0%,
                #0d2137 58%,
                #0a1a2d 100%
              );
          }

          .individual-signup-brand {
            display: none;
          }

          .individual-signup-form-side {
            min-height:
              calc(100vh - 28px);
            min-height:
              calc(100dvh - 28px);
            padding: 18px 20px 30px;
            border:
              1px solid
              rgba(255, 255, 255, 0.13);
            border-radius: 18px;
            box-shadow:
              0 24px 70px
              rgba(0, 0, 0, 0.24);
          }

          .individual-mobile-logo {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
          }

          .individual-signup-top {
            display: none;
          }

          .individual-form-shell {
            margin: 0 auto;
            padding-top: 32px;
          }
        }

        @media (max-width: 520px) {
          .individual-signup-page {
            padding: 10px;
          }

          .individual-signup-form-side {
            min-height:
              calc(100vh - 20px);
            min-height:
              calc(100dvh - 20px);
            padding:
              16px 16px 28px;
            border-radius: 15px;
          }

          .individual-name-grid {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .individual-form-title {
            font-size: 31px;
          }

          .individual-form-description {
            font-size: 12px;
          }

          .individual-form-header {
            margin-bottom: 24px;
          }

          .individual-input {
            height: 46px;
            font-size: 16px;
          }

          .individual-submit {
            min-height: 48px;
          }
        }

        @media (max-width: 360px) {
          .individual-signup-page {
            padding: 0;
          }

          .individual-signup-form-side {
            min-height: 100vh;
            min-height: 100dvh;
            padding:
              16px 13px 26px;
            border: none;
            border-radius: 0;
          }

          .individual-mobile-logo img {
            width: 108px;
            height: auto;
          }

          .individual-form-shell {
            padding-top: 24px;
          }
        }
        @media (
          prefers-reduced-motion: reduce
        ) {
          .individual-back-link,
          .individual-input,
          .individual-password-toggle,
          .individual-submit {
            transition: none;
          }
        }
      `}</style>

      <main
        className="individual-signup-page"
        style={sans}
      >
        <aside className="individual-signup-brand">
          <div
            className="individual-signup-orb"
            style={{
              width: 480,
              height: 480,
              top: -190,
              right: -190,
            }}
          />

          <div
            className="individual-signup-orb"
            style={{
              width: 280,
              height: 280,
              bottom: -110,
              left: -110,
            }}
          />

          <header className="individual-signup-brand-header">
            <Link href="/">
              <Image
                src="/logo3.png"
                alt="PlotWize"
                width={145}
                height={72}
                style={{
                  objectFit: "contain",
                }}
                priority
              />
            </Link>
          </header>

          <div className="individual-signup-brand-content">
            <p
              style={{
                margin: "0 0 14px",
                color: "#A3E635",
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
              }}
            >
              Professional workspace
            </p>

            <h2 style={serif}>
              Make confident planning decisions
              before you commit.
            </h2>

            <p className="individual-signup-brand-copy">
              Create a personal workspace for
              assessing sites, understanding
              planning risks and sharing
              professional reports.
            </p>

            <div className="individual-benefits">
              {[
                {
                  icon: <Zap size={18} />,
                  title: "Fast risk assessments",
                  description:
                    "Evaluate a project against planning constraints and comparable decisions.",
                },
                {
                  icon: <FileText size={18} />,
                  title: "Professional reports",
                  description:
                    "Generate clear reports with evidence, key risks and recommended next steps.",
                },
                {
                  icon: (
                    <ShieldCheck size={18} />
                  ),
                  title: "Secure personal workspace",
                  description:
                    "Your personal projects and assessments remain protected by Supabase RLS.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="individual-benefit"
                >
                  <span className="individual-benefit-icon">
                    {item.icon}
                  </span>

                  <div>
                    <h3>{item.title}</h3>

                    <p>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="individual-plan-summary">
            <div>
              <p
                style={{
                  color:
                    "rgba(255,255,255,0.42)",
                  fontSize: 10,
                  fontWeight: 750,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                Professional
              </p>

              <p
                style={{
                  marginTop: 4,
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Personal planning intelligence
              </p>
            </div>

            <p
              style={{
                color: "#A3E635",
                fontSize: 13,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              £49/month
            </p>
          </div>
        </aside>

        <section className="individual-signup-form-side">
          <div className="individual-mobile-logo">
            <Link href="/">
              <Image
                src="/logo3.png"
                alt="PlotWize"
                width={126}
                height={58}
                style={{
                  objectFit: "contain",
                }}
                priority
              />
            </Link>

            <Link
              href={loginHref}
              style={{
                color: "#639922",
                fontSize: 11,
                fontWeight: 750,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </div>

          <div className="individual-signup-top">
            Already have an account?{" "}
            <Link href={loginHref}>
              Sign in
            </Link>
          </div>

          <div className="individual-form-shell">
            <Link
              href={backHref}
              className="individual-back-link"
            >
              <ArrowLeft size={15} />

              {isInvitationSignup
                ? "Back to invitation"
                : "Back to account options"}
            </Link>

            <header className="individual-form-header">
              <span className="individual-form-icon">
                <UserRound size={23} />
              </span>

              <p className="individual-form-eyebrow">
                {isInvitationSignup
                  ? "Invitation signup"
                  : "Individual account"}
              </p>

              <h1
                className="individual-form-title"
                style={serif}
              >
                {isInvitationSignup
                  ? "Create your invited account"
                  : "Create your personal workspace"}
              </h1>

              <p className="individual-form-description">
                {isInvitationSignup
                  ? "Create your account with the invited email address. After confirming your email, you will return to accept the organization invitation."
                  : "Set up your personal PlotWize workspace and begin evaluating planning opportunities."}
              </p>
            </header>

            {isInvitationSignup ? (
              <div className="individual-invitation-notice">
                <CheckCircle2
                  size={18}
                  style={{
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />

                <span>
                  Invitation email:{" "}
                  <strong>
                    {invitedEmail}
                  </strong>
                </span>
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="individual-form"
            >
              <div className="individual-name-grid">
                <div className="individual-field">
                  <label htmlFor="firstName">
                    First name
                  </label>

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                    required
                    placeholder="John"
                    className="individual-input"
                  />
                </div>

                <div className="individual-field">
                  <label htmlFor="lastName">
                    Last name
                  </label>

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                    required
                    placeholder="Smith"
                    className="individual-input"
                  />
                </div>
              </div>

              <div className="individual-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  readOnly={isInvitationSignup}
                  disabled={isSubmitting}
                  required
                  placeholder="john@example.com"
                  className="individual-input"
                />

                {isInvitationSignup ? (
                  <p
                    style={{
                      margin: "7px 0 0",
                      color: "#64748B",
                      fontSize: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    The email is locked because
                    organization invitations must
                    match exactly.
                  </p>
                ) : null}
              </div>

              <div className="individual-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="individual-password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    disabled={isSubmitting}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="individual-input"
                  />

                  <button
                    type="button"
                    className="individual-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {password ? (
                  <div className="individual-strength">
                    <div className="individual-strength-bars">
                      {[1, 2, 3, 4].map(
                        (level) => (
                          <span
                            key={level}
                            className="individual-strength-bar"
                            style={{
                              background:
                                passwordStrength >=
                                level
                                  ? passwordStrength ===
                                    1
                                    ? "#EF4444"
                                    : passwordStrength ===
                                        2
                                      ? "#F59E0B"
                                      : passwordStrength ===
                                          3
                                        ? "#3B82F6"
                                        : "#A3E635"
                                  : "#E2E8F0",
                            }}
                          />
                        )
                      )}
                    </div>

                    <p className="individual-strength-label">
                      {
                        strengthLabels[
                          passwordStrength
                        ]
                      }{" "}
                      password
                    </p>
                  </div>
                ) : null}
              </div>

              {errorMessage ? (
                <div
                  role="alert"
                  className="individual-message individual-message-error"
                >
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div
                  role="status"
                  className="individual-message individual-message-success"
                >
                  {successMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  Boolean(successMessage)
                }
                className="individual-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Creating account...
                  </>
                ) : isInvitationSignup ? (
                  "Create invited account"
                ) : (
                  "Create individual account"
                )}
              </button>
            </form>

            <p className="individual-signin-bottom">
              Already have an account?{" "}
              <Link href={loginHref}>
                Sign in
              </Link>
            </p>

            <p className="individual-terms">
              By creating an account, you agree
              to the PlotWize Terms of Service
              and Privacy Policy.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default function IndividualSignupPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            ...sans,
            display: "flex",
            minHeight: "100dvh",
            alignItems: "center",
            justifyContent: "center",
            background: "#0D2137",
            color:
              "rgba(255,255,255,0.65)",
            fontSize: 13,
          }}
        >
          <Loader2
            size={18}
            className="animate-spin"
            style={{
              marginRight: 9,
            }}
          />

          Loading signup...
        </main>
      }
    >
      <IndividualSignupForm />
    </Suspense>
  );
}