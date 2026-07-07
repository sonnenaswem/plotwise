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
  Building2,
  Check,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  ShieldCheck,
  UsersRound,
  Zap,
} from "lucide-react";

import {
  createAuthCallbackUrl,
  getSafeInternalPath,
} from "@/lib/auth/redirects";

import {
  completePendingOrganizationSetup,
  createOrganizationSlug,
  createProfile,
  signUp,
} from "@/services/auth/auth-service";

const serif = {
  fontFamily: "'Fraunces', Georgia, serif",
};

const sans = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

type OrganizationPlan =
  | "developer"
  | "enterprise";

function getPasswordStrength(
  password: string
) {
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

function OrganizationSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedPlan: OrganizationPlan =
    searchParams.get("plan") ===
    "enterprise"
      ? "enterprise"
      : "developer";

  const requestedDestination =
    getSafeInternalPath(
      searchParams.get("next")
    );

  const isEnterprise =
    requestedPlan === "enterprise";

  const planName = isEnterprise
    ? "Enterprise"
    : "Developer";

  const planPrice = isEnterprise
    ? "£140/month"
    : "£100/month";

  const planAudience = isEnterprise
    ? "For larger companies"
    : "For growing teams";

  const planDescription = isEnterprise
    ? "Create a larger organization workspace with greater team capacity and unrestricted project, assessment and report usage."
    : "Create a shared workspace for your company, practice or development team.";

  const planFeatures = isEnterprise
    ? [
        "Unlimited projects",
        "Unlimited assessments",
        "Unlimited report downloads",
        "Up to 15 workspace users",
      ]
    : [
        "100 projects each month",
        "100 assessments each month",
        "100 report downloads",
        "Up to 5 workspace users",
      ];

  const [organizationName, setOrganizationName] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

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

  if (
    requestedDestination !==
    "/dashboard"
  ) {
    loginParams.set(
      "next",
      requestedDestination
    );
  }

  if (email.trim()) {
    loginParams.set(
      "email",
      email.trim().toLowerCase()
    );
  }

  const loginHref =
    loginParams.toString()
      ? `/login?${loginParams.toString()}`
      : "/login";

  const signupParams =
    new URLSearchParams();

  if (
    requestedDestination !==
    "/dashboard"
  ) {
    signupParams.set(
      "next",
      requestedDestination
    );
  }

  const backHref =
    signupParams.toString()
      ? `/signup?${signupParams.toString()}`
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

    const normalizedOrganizationName =
      organizationName.trim();

    const normalizedFirstName =
      firstName.trim();

    const normalizedLastName =
      lastName.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedOrganizationName) {
      setErrorMessage(
        "Please enter your organization name."
      );
      return;
    }

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

    if (password.length < 6) {
      setErrorMessage(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const organizationSlug =
        createOrganizationSlug(
          normalizedOrganizationName
        );

      const {
        data,
        error: signUpError,
      } = await signUp(
        normalizedEmail,
        password,
        {
          firstName:
            normalizedFirstName,

          lastName:
            normalizedLastName,

          accountType: "organization",

          organizationName:
            normalizedOrganizationName,

          organizationSlug,

          selectedPlan: requestedPlan,

          emailRedirectTo:
            createAuthCallbackUrl(
              requestedDestination
            ),
        }
      );

      if (signUpError) {
        setErrorMessage(
          signUpError.message
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

      if (!session) {
        const verifyUrl =
          new URL(
            "/verify-email",
            window.location.origin
          );

        verifyUrl.searchParams.set(
          "email",
          normalizedEmail
        );

        verifyUrl.searchParams.set(
          "next",
          requestedDestination
        );

        router.replace(
          `${verifyUrl.pathname}${verifyUrl.search}`
        );

        return;
      }

      // if (!session) {
      //   setSuccessMessage(
      //     `Your ${planName} account has been created. Check your email to confirm your address, then sign in. Your organization workspace will be created automatically after your first login.`
      //   );
      //   return;
      // }

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

      const {
        error:
          organizationSetupError,
      } =
        await completePendingOrganizationSetup();

      if (organizationSetupError) {
        setErrorMessage(
          `Your account was created, but your organization workspace could not be prepared: ${organizationSetupError.message}`
        );
        return;
      }

      router.replace(
        requestedDestination
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Organization signup failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your organization account."
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

        .organization-signup-page {
          display: grid;
          width: 100%;
          min-width: 0;
          min-height: 100vh;
          min-height: 100dvh;
          grid-template-columns:
            minmax(370px, 0.86fr)
            minmax(0, 1.14fr);
          overflow-x: clip;
          background: #ffffff;
        }

        .organization-brand {
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
              circle at 14% 14%,
              rgba(14, 116, 144, 0.26),
              transparent 31%
            ),
            radial-gradient(
              circle at 90% 84%,
              rgba(163, 230, 53, 0.12),
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

        .organization-orb {
          position: absolute;
          border:
            1px solid
            rgba(163, 230, 53, 0.09);
          border-radius: 999px;
          pointer-events: none;
        }

        .organization-brand-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .organization-brand-content {
          position: relative;
          z-index: 2;
          display: flex;
          width: 100%;
          max-width: 470px;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          margin: 36px auto 0;
        }

        .organization-brand-eyebrow {
          margin: 0 0 14px;
          color: #a3e635;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .organization-brand-title {
          margin: 0;
          color: #ffffff;
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 300;
          line-height: 1.06;
          letter-spacing: -1.1px;
        }

        .organization-brand-copy {
          max-width: 430px;
          margin: 18px 0 31px;
          color:
            rgba(255, 255, 255, 0.58);
          font-size: 15px;
          line-height: 1.75;
        }

        .organization-benefits {
          display: grid;
          gap: 17px;
        }

        .organization-benefit {
          display: flex;
          align-items: flex-start;
          gap: 13px;
        }

        .organization-benefit-icon {
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

        .organization-benefit h3 {
          margin: 0 0 3px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
        }

        .organization-benefit p {
          margin: 0;
          color:
            rgba(255, 255, 255, 0.46);
          font-size: 12px;
          line-height: 1.55;
        }

        .organization-plan-card {
          position: relative;
          z-index: 2;
          margin-top: 31px;
          overflow: hidden;
          border:
            1px solid
            rgba(255, 255, 255, 0.1);
          border-radius: 13px;
          background:
            rgba(255, 255, 255, 0.05);
        }

        .organization-plan-ribbon {
          padding: 7px 14px;
          background: #a3e635;
          color: #0b1628;
          font-size: 9px;
          font-weight: 900;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .organization-plan-body {
          padding: 15px 17px;
        }

        .organization-plan-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .organization-plan-name {
          margin: 0;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
        }

        .organization-plan-price {
          margin: 0;
          color: #a3e635;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }

        .organization-plan-features {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 9px 13px;
          margin: 14px 0 0;
          padding: 14px 0 0;
          border-top:
            1px solid
            rgba(255, 255, 255, 0.08);
          list-style: none;
        }

        .organization-plan-feature {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          color:
            rgba(255, 255, 255, 0.56);
          font-size: 10px;
          line-height: 1.45;
        }

        .organization-plan-feature svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #a3e635;
        }

        .organization-form-side {
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

        .organization-top-signin {
          display: flex;
          min-height: 50px;
          align-items: center;
          justify-content: flex-end;
          gap: 5px;
          color: #64748b;
          font-size: 12px;
        }

        .organization-top-signin a {
          color: #639922;
          font-weight: 750;
          text-decoration: none;
        }

        .organization-mobile-header {
          display: none;
        }

        .organization-form-shell {
          width: 100%;
          max-width: 550px;
          margin: auto;
          padding: 25px 0 23px;
        }

        .organization-form-shell,
        .organization-form-header,
        .organization-field,
        .organization-message {
          min-width: 0;
        }

        .organization-form-description,
        .organization-message,
        .organization-signin-bottom,
        .organization-terms {
          overflow-wrap: anywhere;
        }

        .organization-back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 23px;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
          transition: color 160ms ease;
        }

        .organization-back-link:hover {
          color: #0d2137;
        }

        .organization-form-header {
          margin-bottom: 25px;
        }

        .organization-form-icon {
          display: inline-flex;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          border-radius: 13px;
          background: #f2fce4;
          color: #639922;
        }

        .organization-form-eyebrow {
          margin: 0 0 9px;
          color: #639922;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .organization-form-title {
          margin: 0;
          color: #0d2137;
          font-size: clamp(30px, 4vw, 41px);
          font-weight: 300;
          line-height: 1.08;
          letter-spacing: -0.8px;
        }

        .organization-form-description {
          max-width: 510px;
          margin: 13px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.68;
        }

        .organization-selected-plan {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 14px;
          padding: 6px 9px;
          border: 1px solid #d9f99d;
          border-radius: 999px;
          background: #f7fee7;
          color: #4d7c0f;
          font-size: 10px;
          font-weight: 750;
        }

        .organization-form {
          display: grid;
          gap: 16px;
        }

        .organization-name-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .organization-field label {
          display: block;
          margin-bottom: 7px;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .organization-input {
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

        .organization-input::placeholder {
          color: #94a3b8;
        }

        .organization-input:focus {
          border-color: #639922;
          box-shadow:
            0 0 0 3px
            rgba(99, 153, 34, 0.1);
        }

        .organization-input:disabled {
          cursor: not-allowed;
          background: #f1f5f9;
        }

        .organization-password-wrap {
          position: relative;
        }

        .organization-password-wrap
          .organization-input {
          padding-right: 50px;
        }

        .organization-password-toggle {
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

        .organization-password-toggle:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .organization-strength {
          margin-top: 8px;
        }

        .organization-strength-bars {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 4px;
        }

        .organization-strength-bar {
          height: 3px;
          border-radius: 99px;
          background: #e2e8f0;
        }

        .organization-strength-label {
          margin: 5px 0 0;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 650;
        }

        .organization-message {
          padding: 12px 14px;
          border-radius: 9px;
          font-size: 12px;
          line-height: 1.6;
        }

        .organization-message-error {
          border: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .organization-message-success {
          border: 1px solid #bbf7d0;
          background: #f0fdf4;
          color: #15803d;
        }

        .organization-submit {
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

        .organization-submit:hover:not(:disabled) {
          background: #b7ed58;
          box-shadow:
            0 10px 25px
            rgba(99, 153, 34, 0.18);
          transform: translateY(-1px);
        }

        .organization-submit:disabled {
          cursor: not-allowed;
          opacity: 0.62;
        }

        .organization-signin-bottom {
          margin: 20px 0 0;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }

        .organization-signin-bottom a {
          color: #639922;
          font-weight: 750;
          text-decoration: none;
        }

        .organization-terms {
          margin: 16px 0 0;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.6;
          text-align: center;
        }

        .organization-back-link:focus-visible,
        .organization-top-signin a:focus-visible,
        .organization-mobile-header a:focus-visible,
        .organization-signin-bottom a:focus-visible,
        .organization-password-toggle:focus-visible,
        .organization-submit:focus-visible {
          outline: 3px solid
            rgba(99, 153, 34, 0.25);
          outline-offset: 3px;
        }

        .organization-input:focus-visible {
          border-color: #639922;
          box-shadow:
            0 0 0 3px
            rgba(99, 153, 34, 0.1);
        }

        @media (max-width: 1010px) {
          .organization-signup-page {
            grid-template-columns:
              minmax(325px, 0.74fr)
              minmax(0, 1.26fr);
          }

          .organization-brand {
            padding-right: 28px;
            padding-left: 28px;
          }

          .organization-form-side {
            padding-right: 30px;
            padding-left: 30px;
          }

          .organization-plan-features {
            grid-template-columns:
              minmax(0, 1fr);
          }
        }

        @media (max-width: 790px) {
          .organization-signup-page {
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

          .organization-brand {
            display: none;
          }

          .organization-form-side {
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

          .organization-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
          }

          .organization-top-signin {
            display: none;
          }

          .organization-form-shell {
            margin: 0 auto;
            padding-top: 31px;
          }
        }

        @media (max-width: 540px) {
          .organization-signup-page {
            padding: 10px;
          }

          .organization-form-side {
            min-height:
              calc(100vh - 20px);
            min-height:
              calc(100dvh - 20px);
            padding:
              16px 16px 28px;
            border-radius: 15px;
          }

          .organization-name-grid {
            grid-template-columns:
              minmax(0, 1fr);
          }

          .organization-form-title {
            font-size: 31px;
          }

          .organization-form-description {
            font-size: 12px;
          }

          .organization-form-header {
            margin-bottom: 23px;
          }

          .organization-selected-plan {
            max-width: 100%;
            white-space: normal;
          }

          .organization-input {
            height: 46px;
            font-size: 16px;
          }

          .organization-submit {
            min-height: 48px;
          }
        }

        @media (max-width: 360px) {
          .organization-signup-page {
            padding: 0;
          }

          .organization-form-side {
            min-height: 100vh;
            min-height: 100dvh;
            padding:
              16px 13px 26px;
            border: none;
            border-radius: 0;
          }

          .organization-mobile-header img {
            width: 108px;
            height: auto;
          }

          .organization-form-shell {
            padding-top: 24px;
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .organization-back-link,
          .organization-input,
          .organization-password-toggle,
          .organization-submit {
            transition: none;
          }
        }
      `}</style>

      <main
        className="organization-signup-page"
        style={sans}
      >
        <aside className="organization-brand">
          <div
            className="organization-orb"
            style={{
              width: 480,
              height: 480,
              top: -190,
              right: -190,
            }}
          />

          <div
            className="organization-orb"
            style={{
              width: 280,
              height: 280,
              bottom: -110,
              left: -110,
            }}
          />

          <header className="organization-brand-header">
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

          <div className="organization-brand-content">
            <p className="organization-brand-eyebrow">
              {planAudience}
            </p>

            <h2
              className="organization-brand-title"
              style={serif}
            >
              Bring your planning intelligence
              into one shared workspace.
            </h2>

            <p className="organization-brand-copy">
              Collaborate across sites, assessments
              and reports while keeping your
              organization’s work structured and
              secure.
            </p>

            <div className="organization-benefits">
              {[
                {
                  icon: <UsersRound size={18} />,
                  title: "Shared team workspace",
                  description:
                    "Give colleagues controlled access to the organization’s projects and planning assessments.",
                },
                {
                  icon: <Zap size={18} />,
                  title: "Faster project decisions",
                  description:
                    "Assess opportunities consistently using comparable decisions and planning constraints.",
                },
                {
                  icon: <FileText size={18} />,
                  title: "Professional reporting",
                  description:
                    "Generate downloadable planning-risk reports for internal review and client discussions.",
                },
                {
                  icon: (
                    <ShieldCheck size={18} />
                  ),
                  title: "Protected organization data",
                  description:
                    "Workspace membership and project visibility are enforced through Supabase RLS.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="organization-benefit"
                >
                  <span className="organization-benefit-icon">
                    {item.icon}
                  </span>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="organization-plan-card">
            {!isEnterprise ? (
              <div className="organization-plan-ribbon">
                Recommended for teams
              </div>
            ) : null}

            <div className="organization-plan-body">
              <div className="organization-plan-header">
                <div>
                  <p
                    style={{
                      margin: "0 0 3px",
                      color:
                        "rgba(255,255,255,0.4)",
                      fontSize: 9,
                      fontWeight: 750,
                      textTransform:
                        "uppercase",
                      letterSpacing: "0.7px",
                    }}
                  >
                    Selected plan
                  </p>

                  <p className="organization-plan-name">
                    PlotWize {planName}
                  </p>
                </div>

                <p className="organization-plan-price">
                  {planPrice}
                </p>
              </div>

              <ul className="organization-plan-features">
                {planFeatures.map(
                  (feature) => (
                    <li
                      key={feature}
                      className="organization-plan-feature"
                    >
                      <Check
                        size={13}
                        strokeWidth={3}
                      />

                      <span>{feature}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </aside>

        <section className="organization-form-side">
          <div className="organization-mobile-header">
            <Link href="/">
              <Image
                src="/logo3.png"
                alt="PlotWize"
                width={156}
                height={65}
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

          <div className="organization-top-signin">
            Already have an account?{" "}
            <Link href={loginHref}>
              Sign in
            </Link>
          </div>

          <div className="organization-form-shell">
            <Link
              href={backHref}
              className="organization-back-link"
            >
              <ArrowLeft size={15} />
              Back to account options
            </Link>

            <header className="organization-form-header">
              <span className="organization-form-icon">
                <Building2 size={23} />
              </span>

              <p className="organization-form-eyebrow">
                {planName} account
              </p>

              <h1
                className="organization-form-title"
                style={serif}
              >
                Create your organization
                workspace
              </h1>

              <p className="organization-form-description">
                {planDescription}
              </p>

              <span className="organization-selected-plan">
                <Check
                  size={12}
                  strokeWidth={3}
                />
                {planName} selected ·{" "}
                {planPrice}
              </span>
            </header>

            <form
              onSubmit={handleSubmit}
              className="organization-form"
            >
              <div className="organization-field">
                <label htmlFor="organizationName">
                  Organization name
                </label>

                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  autoComplete="organization"
                  value={organizationName}
                  onChange={(event) =>
                    setOrganizationName(
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  required
                  placeholder="Example Developments Ltd"
                  className="organization-input"
                />
              </div>

              <div className="organization-name-grid">
                <div className="organization-field">
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
                    className="organization-input"
                  />
                </div>

                <div className="organization-field">
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
                    className="organization-input"
                  />
                </div>
              </div>

              <div className="organization-field">
                <label htmlFor="email">
                  Work email address
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
                  disabled={isSubmitting}
                  required
                  placeholder="you@example.com"
                  className="organization-input"
                />
              </div>

              <div className="organization-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="organization-password-wrap">
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
                    className="organization-input"
                  />

                  <button
                    type="button"
                    className="organization-password-toggle"
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
                  <div className="organization-strength">
                    <div className="organization-strength-bars">
                      {[1, 2, 3, 4].map(
                        (level) => (
                          <span
                            key={level}
                            className="organization-strength-bar"
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

                    <p className="organization-strength-label">
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
                  className="organization-message organization-message-error"
                >
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div
                  role="status"
                  className="organization-message organization-message-success"
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
                className="organization-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating workspace...
                  </>
                ) : (
                  `Create ${planName.toLowerCase()} account`
                )}
              </button>
            </form>

            <p className="organization-signin-bottom">
              Already have an account?{" "}
              <Link href={loginHref}>
                Sign in
              </Link>
            </p>

            <p className="organization-terms">
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

export default function OrganizationSignupPage() {
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
      <OrganizationSignupForm />
    </Suspense>
  );
}