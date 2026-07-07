"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  finalizeVerifiedSignup,
  resendSignupCode,
  verifySignupCode,
} from "@/services/auth/auth-service";

import {
  createAuthCallbackUrl,
  getSafeInternalPath,
} from "@/lib/auth/redirects";

const sans = {
  fontFamily:
    "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily:
    "'Fraunces', Georgia, serif",
};

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email =
    searchParams.get("email")?.trim() ?? "";

  const destination =
    getSafeInternalPath(
      searchParams.get("next")
    );

  const [code, setCode] =
    useState("");

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [seconds, setSeconds] =
    useState(60);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setInterval(
      () => {
        setSeconds((current) =>
          Math.max(0, current - 1)
        );
      },
      1000
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [seconds]);

  async function handleVerify(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!email) {
      setErrorMessage(
        "The verification email address is missing. Please register again."
      );
      return;
    }

    if (!/^\d{8}$/.test(code)) {
      setErrorMessage(
        "Enter the eight-digit code from your email."
      );
      return;
    }

    setVerifying(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } =
      await verifySignupCode(
        email,
        code
      );

    if (error) {
        const normalizedMessage =
            error.message.toLowerCase();

        if (
            normalizedMessage.includes("expired") ||
            error.code === "otp_expired"
        ) {
            setErrorMessage(
            "This verification code has expired or has already been used. Request a new code and enter only the newest code."
            );
        } else if (
            normalizedMessage.includes("invalid") ||
            normalizedMessage.includes(
            "token has expired"
            )
        ) {
            setErrorMessage(
            "The verification code is invalid. Make sure you entered the newest eight-digit code sent to this email address."
            );
        } else {
            setErrorMessage(
            error.message ||
                "The verification code could not be confirmed."
            );
        }

        setVerifying(false);
        return;
        }

    const finalization =
      await finalizeVerifiedSignup();

    if (finalization.error) {
      setErrorMessage(
        finalization.error.message
      );

      setVerifying(false);
      return;
    }

    setSuccessMessage(
      "Email verified. Your 14-day trial is now active."
    );

    window.setTimeout(() => {
      router.replace(destination);
      router.refresh();
    }, 900);
  }

  async function handleResend() {
    if (!email || resending || seconds > 0) {
      return;
    }

    setResending(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } =
      await resendSignupCode(
        email,
        createAuthCallbackUrl(
          destination
        )
      );

    if (error) {
      setErrorMessage(error.message);
      setResending(false);
      return;
    }

    setSeconds(60);

    setSuccessMessage(
      "A new verification code has been sent."
    );

    setResending(false);
  }

  return (
    <main
      style={{
        ...sans,
        minHeight: "100vh",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at top right, rgba(163,230,53,0.16), transparent 30%), #0D2137",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <Link href="/">
            <Image
              src="/logo3.png"
              alt="PlotWize"
              width={150}
              height={90}
              priority
              style={{
                objectFit: "contain",
              }}
            />
          </Link>
        </div>

        <section
          style={{
            overflow: "hidden",
            border:
              "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20,
            background: "#FFFFFF",
            boxShadow:
              "0 28px 80px rgba(0,0,0,0.28)",
          }}
        >
          <div
            style={{
              padding: "30px 30px 24px",
              background:
                "linear-gradient(135deg, #F7FCEB, #F8FAFC)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 58,
                height: 58,
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                borderRadius: 15,
                background: "#EAF3DE",
                color: "#3B6D11",
              }}
            >
              <MailCheck size={28} />
            </div>

            <p
              style={{
                margin: "0 0 8px",
                color: "#639922",
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Email verification
            </p>

            <h1
              style={{
                ...serif,
                margin: "0 0 10px",
                color: "#0D2137",
                fontSize: 32,
                fontWeight: 300,
              }}
            >
              Check your inbox
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748B",
                fontSize: 13,
                lineHeight: 1.65,
              }}
            >
              We sent an eight-digit code to{" "}
              <strong
                style={{
                  color: "#334155",
                }}
              >
                {email || "your email address"}
              </strong>
              .
            </p>
          </div>

          <div
            style={{
              padding: 30,
            }}
          >
            {errorMessage ? (
              <div
                role="alert"
                style={{
                  marginBottom: 18,
                  padding: "12px 14px",
                  border:
                    "1px solid #FECACA",
                  borderRadius: 9,
                  background: "#FEF2F2",
                  color: "#B91C1C",
                  fontSize: 12,
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
                  gap: 8,
                  marginBottom: 18,
                  padding: "12px 14px",
                  border:
                    "1px solid #BBF7D0",
                  borderRadius: 9,
                  background: "#F0FDF4",
                  color: "#15803D",
                  fontSize: 12,
                }}
              >
                <CheckCircle2 size={16} />
                {successMessage}
              </div>
            ) : null}

            <form onSubmit={handleVerify}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  color: "#334155",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                Verification code
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 8)
                  )
                }
                placeholder="00000000"
                autoFocus
                style={{
                  width: "100%",
                  height: 58,
                  padding: "0 16px",
                  border:
                    "1.5px solid #CBD5E1",
                  borderRadius: 11,
                  outline: "none",
                  color: "#0D2137",
                  background: "#F8FAFC",
                  fontSize: 26,
                  fontWeight: 800,
                  textAlign: "center",
                  letterSpacing: "7px",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                disabled={
                  verifying ||
                  code.length !== 8
                }
                style={{
                  width: "100%",
                  minHeight: 46,
                  marginTop: 18,
                  border: "none",
                  borderRadius: 9,
                  background:
                    verifying ||
                    code.length !== 8
                      ? "#CBD5E1"
                      : "#A3E635",
                  color: "#0B1628",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor:
                    verifying ||
                    code.length !== 8
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {verifying
                  ? "Verifying account..."
                  : "Verify and start trial"}
              </button>
            </form>

            <div
              style={{
                marginTop: 22,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 9px",
                  color: "#94A3B8",
                  fontSize: 11,
                }}
              >
                Didn&apos;t receive the code?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={
                  resending || seconds > 0
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  border: "none",
                  background: "transparent",
                  color:
                    seconds > 0
                      ? "#94A3B8"
                      : "#639922",
                  fontSize: 12,
                  fontWeight: 750,
                  cursor:
                    seconds > 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <RefreshCw size={14} />

                {resending
                  ? "Sending..."
                  : seconds > 0
                    ? `Resend in ${seconds}s`
                    : "Resend verification code"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 9,
                marginTop: 24,
                padding: 13,
                borderRadius: 9,
                background: "#F8FAFC",
                color: "#64748B",
                fontSize: 10,
                lineHeight: 1.55,
              }}
            >
              <ShieldCheck
                size={16}
                style={{
                  flexShrink: 0,
                }}
              />

              Your trial begins only after your
              email address is verified.
            </div>

            <p
              style={{
                margin: "23px 0 0",
                textAlign: "center",
                fontSize: 11,
                color: "#94A3B8",
              }}
            >
              Wrong email address?{" "}
              <Link
                href="/signup"
                style={{
                  color: "#639922",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Register again
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#0D2137",
          }}
        />
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}