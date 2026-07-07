"use client";

import {
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import {
  useRouter,
} from "next/navigation";

import {
  getCurrentUser,
  signOut,
  updatePassword,
} from "@/services/auth/auth-service";

const sans = {
  fontFamily:
    "'Inter', system-ui, sans-serif",
};

const serif = {
  fontFamily:
    "'Fraunces', Georgia, serif",
};

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [checking, setChecking] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [validSession, setValidSession] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let active = true;

    async function checkSession() {
      const {
        data: { user },
        error,
      } = await getCurrentUser();

      if (!active) {
        return;
      }

      setValidSession(
        Boolean(user) && !error
      );

      if (!user || error) {
        setErrorMessage(
          "This password-reset link is invalid or has expired. Request a new link."
        );
      }

      setChecking(false);
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 8) {
      setErrorMessage(
        "Your password must contain at least eight characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords do not match."
      );
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const { error } =
      await updatePassword(password);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    await signOut();

    setCompleted(true);
    setSaving(false);

    window.setTimeout(() => {
      router.replace(
        "/login?password_reset=success"
      );
      router.refresh();
    }, 1200);
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
          {checking ? (
            <p
              style={{
                margin: 0,
                color: "#64748B",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Validating your reset link...
            </p>
          ) : completed ? (
            <div
              style={{
                textAlign: "center",
              }}
            >
              <CheckCircle2
                size={48}
                color="#15803D"
              />

              <h1
                style={{
                  ...serif,
                  margin: "18px 0 9px",
                  color: "#0D2137",
                  fontSize: 31,
                  fontWeight: 300,
                }}
              >
                Password updated
              </h1>

              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  fontSize: 13,
                }}
              >
                Redirecting you to sign in...
              </p>
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
                Password recovery
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
                Choose a new password
              </h1>

              <p
                style={{
                  margin: "0 0 24px",
                  color: "#64748B",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                Use at least eight characters and
                choose a password you do not use
                elsewhere.
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
                    lineHeight: 1.55,
                  }}
                >
                  {errorMessage}
                </div>
              ) : null}

              {validSession ? (
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
                    New password
                  </label>

                  <div
                    style={{
                      position: "relative",
                    }}
                  >
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      autoComplete="new-password"
                      style={{
                        width: "100%",
                        height: 46,
                        padding:
                          "0 43px 0 13px",
                        border:
                          "1.5px solid #CBD5E1",
                        borderRadius: 9,
                        outline: "none",
                        color: "#0D2137",
                        background: "#F8FAFC",
                        fontSize: 13,
                        boxSizing:
                          "border-box",
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: 12,
                        border: "none",
                        background:
                          "transparent",
                        color: "#94A3B8",
                        cursor: "pointer",
                        transform:
                          "translateY(-50%)",
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  <label
                    style={{
                      display: "block",
                      margin: "17px 0 8px",
                      color: "#334155",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Confirm new password
                  </label>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    style={{
                      width: "100%",
                      height: 46,
                      padding: "0 13px",
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

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      width: "100%",
                      minHeight: 45,
                      marginTop: 18,
                      border: "none",
                      borderRadius: 9,
                      background: saving
                        ? "#CBD5E1"
                        : "#A3E635",
                      color: "#0B1628",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: saving
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {saving
                      ? "Updating password..."
                      : "Update password"}
                  </button>
                </form>
              ) : (
                <Link
                  href="/forgot-password"
                  style={{
                    display: "flex",
                    minHeight: 44,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 9,
                    background: "#A3E635",
                    color: "#0B1628",
                    fontSize: 13,
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Request another reset link
                </Link>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}