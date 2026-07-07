"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Loader2,
  LogIn,
  UserPlus,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  acceptOrganizationInvitation,
  getInvitationPreview,
  type InvitationPreview,
} from "@/services/organizations/organization-service";

type InvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default function InvitationPage({
  params,
}: InvitationPageProps) {
  const { token } = use(params);
  const router = useRouter();

  const [invitation, setInvitation] =
    useState<InvitationPreview | null>(null);

  const [currentUserEmail, setCurrentUserEmail] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [accepting, setAccepting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const destination =
    `/invitations/${token}`;

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      setLoading(true);
      setErrorMessage("");

      try {
        const supabase = createClient();

        const [
          previewResult,
          sessionResult,
        ] = await Promise.all([
          getInvitationPreview(token),
          supabase.auth.getSession(),
        ]);

        if (!active) {
          return;
        }

        if (previewResult.error) {
          throw previewResult.error;
        }

        if (!previewResult.data) {
          throw new Error(
            "This invitation could not be found."
          );
        }

        if (sessionResult.error) {
          console.error(
            "Invitation session lookup failed:",
            sessionResult.error
          );
        }

        setInvitation(previewResult.data);

        setCurrentUserEmail(
          sessionResult.data.session?.user.email
            ?.trim()
            .toLowerCase() ?? null
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "The invitation could not be loaded."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      active = false;
    };
  }, [token]);

  const invitedEmail =
    invitation?.email.trim().toLowerCase() ??
    null;

  const isAuthenticated =
    Boolean(currentUserEmail);

  const emailMatches =
    Boolean(
      currentUserEmail &&
        invitedEmail &&
        currentUserEmail === invitedEmail
    );

  const loginHref =
    `/login?next=${encodeURIComponent(
      destination
    )}&email=${encodeURIComponent(
      invitation?.email ?? ""
    )}`;

  const signupHref =
    `/signup/individual?next=${encodeURIComponent(
      destination
    )}&email=${encodeURIComponent(
      invitation?.email ?? ""
    )}`;

  async function handleAccept() {
    if (!emailMatches) {
      setErrorMessage(
        `This invitation was sent to ${invitation?.email}. Sign in using that exact email address to accept it.`
      );
      return;
    }

    setAccepting(true);
    setErrorMessage("");

    try {
      const result =
        await acceptOrganizationInvitation(
          token
        );

      if (result.error) {
        throw result.error;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The invitation could not be accepted."
      );
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading invitation...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 px-5 py-7 text-white sm:px-8 sm:py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-300 text-slate-950">
            <Building2 className="h-6 w-6" />
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
            PlotWize team invitation
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Join{" "}
            {invitation?.organizationName ??
              "this organization"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Collaborate on shared planning projects,
            assessments, and reports.
          </p>
        </div>

        <div className="p-5 sm:p-8">
          {invitation ? (
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-5">
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Invited email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-900">
                  {invitation.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Role
                </p>

                <p className="mt-1 text-sm capitalize text-slate-800">
                  {invitation.role}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <p className="mt-1 text-sm capitalize text-slate-800">
                  {invitation.status}
                </p>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {errorMessage}
            </div>
          ) : null}

          {invitation?.status === "pending" ? (
            <>
              {!isAuthenticated ? (
                <div className="mt-6 space-y-3">
                  <p className="text-sm leading-6 text-slate-600">
                    Sign in or create an account using
                    the invited email address.
                  </p>

                  <Link
                    href={loginHref}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>

                  <Link
                    href={signupHref}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create account
                  </Link>
                </div>
              ) : emailMatches ? (
                <div className="mt-6">
                  <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                    <p className="text-sm leading-6 text-emerald-800">
                      You are signed in as the invited
                      user. You can now join the
                      organization.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleAccept();
                    }}
                    disabled={accepting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Accepting invitation...
                      </>
                    ) : (
                      "Accept invitation"
                    )}
                  </button>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                    You are signed in as{" "}
                    <strong>
                      {currentUserEmail}
                    </strong>
                    , but this invitation was sent to{" "}
                    <strong>
                      {invitation.email}
                    </strong>
                    .
                  </div>

                  <Link
                    href={loginHref}
                    className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Sign in with invited email
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                This invitation is currently{" "}
                <strong className="capitalize">
                  {invitation?.status ??
                    "unavailable"}
                </strong>
                .
              </div>

              <Link
                href="/dashboard"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white"
              >
                Go to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}