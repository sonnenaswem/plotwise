"use client";

import {
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
} from "lucide-react";

import {
  requestPasswordReset,
} from "@/services/auth/auth-service";

import {
  createAuthCallbackUrl,
} from "@/lib/auth/redirects";

const sans = {
  fontFamily:
    "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily:
    "'Fraunces', Georgia, serif",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [sent, setSent] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } =
      await requestPasswordReset(
        email,
        createAuthCallbackUrl(
          "/reset-password"
        )
      );

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    // Use a neutral response to avoid revealing whether
    // an account exists for the supplied address.
    setSent(true);
    setLoading(false);
  }

  return (
    <main
      style={{
        ...sans,
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at top right, rgba(163,230,53,0.16), transparent 30%), #0D2137",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
        }}
      >
        <div
          style={{
            marginBottom: 22,
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
            padding: 30,
            borderRadius: 18,
            background: "#FFFFFF",
            boxShadow:
              "0 28px 80px rgba(0,0,0,0.28)",
          }}
        >
          {sent ? (
            <div
              style={{
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
                  background: "#DCFCE7",
                  color: "#15803D",
                }}
              >
                <CheckCircle2 size={28} />
              </div>

              <h1
                style={{
                  ...serif,
                  margin: "0 0 10px",
                  color: "#0D2137",
                  fontSize: 31,
                  fontWeight: 300,
                }}
              >
                Check your email
              </h1>

              <p
                style={{
                  margin: "0 0 24px",
                  color: "#64748B",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                If an account exists for{" "}
                <strong>{email}</strong>, we
                have sent a secure password-reset
                link.
              </p>

              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  color: "#639922",
                  fontSize: 12,
                  fontWeight: 750,
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={14} />
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  width: 54,
                  height: 54,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  borderRadius: 14,
                  background: "#EAF3DE",
                  color: "#3B6D11",
                }}
              >
                <KeyRound size={26} />
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
                Account recovery
              </p>

              <h1
                style={{
                  ...serif,
                  margin: "0 0 9px",
                  color: "#0D2137",
                  fontSize: 32,
                  fontWeight: 300,
                }}
              >
                Forgot your password?
              </h1>

              <p
                style={{
                  margin: "0 0 25px",
                  color: "#64748B",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                Enter your email and we will send
                you a secure link to choose a new
                password.
              </p>

              {errorMessage ? (
                <div
                  role="alert"
                  style={{
                    marginBottom: 17,
                    padding: "11px 13px",
                    border:
                      "1px solid #FECACA",
                    borderRadius: 9,
                    background: "#FEF2F2",
                    color: "#B91C1C",
                    fontSize: 12,
                  }}
                >
                  {errorMessage}
                </div>
              ) : null}

              <form onSubmit={handleSubmit}>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "#334155",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Email address
                </label>

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
                    }}
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="you@company.com"
                    style={{
                      width: "100%",
                      height: 46,
                      padding: "0 13px 0 40px",
                      border:
                        "1.5px solid #CBD5E1",
                      borderRadius: 9,
                      outline: "none",
                      color: "#0D2137",
                      background: "#F8FAFC",
                      fontSize: 13,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    minHeight: 45,
                    marginTop: 17,
                    border: "none",
                    borderRadius: 9,
                    background: loading
                      ? "#CBD5E1"
                      : "#A3E635",
                    color: "#0B1628",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {loading
                    ? "Sending reset link..."
                    : "Send reset link"}
                </button>
              </form>

              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  marginTop: 22,
                  color: "#639922",
                  fontSize: 12,
                  fontWeight: 750,
                  textDecoration: "none",
                }}
              >
                <ArrowLeft size={14} />
                Back to sign in
              </Link>
            </>
          )}
        </section>
      </div>
    </main>
  );
}