import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getSafeInternalPath,
} from "@/lib/auth/redirects";

import {
  createClient,
} from "@/lib/supabase/server";

export async function GET(
  request: NextRequest
) {
  const requestUrl =
    new URL(request.url);

  const code =
    requestUrl.searchParams.get(
      "code"
    );

  const destination =
    getSafeInternalPath(
      requestUrl.searchParams.get(
        "next"
      )
    );

  if (!code) {
    const fallbackPath =
      destination === "/reset-password"
        ? "/forgot-password"
        : "/login";

    const fallbackUrl =
      new URL(
        fallbackPath,
        requestUrl.origin
      );

    fallbackUrl.searchParams.set(
      "error",
      "The authentication link is missing its security code."
    );

    return NextResponse.redirect(
      fallbackUrl
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth
      .exchangeCodeForSession(code);

  if (error) {
    console.error(
      "Supabase authentication callback failed:",
      error
    );

    const fallbackPath =
      destination === "/reset-password"
        ? "/forgot-password"
        : "/login";

    const fallbackUrl =
      new URL(
        fallbackPath,
        requestUrl.origin
      );

    fallbackUrl.searchParams.set(
      "error",
      destination === "/reset-password"
        ? "This password-reset link is invalid or has expired."
        : "The authentication link could not be completed. Please try again."
    );

    return NextResponse.redirect(
      fallbackUrl
    );
  }

  return NextResponse.redirect(
    new URL(
      destination,
      requestUrl.origin
    )
  );
}