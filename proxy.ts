import {
  NextResponse,
  type NextRequest,
} from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

const protectedPrefixes = [
  "/dashboard",
  "/profile",
  "/portfolio",
  "/projects",
  "/assessments",
  "/reports",
  "/boroughs",
  "/trends",
  "/opportunities",
  "/billing",
  "/settings",
];

const guestOnlyPrefixes = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
];

function matchesPrefix(
  pathname: string,
  prefix: string
) {
  return (
    pathname === prefix ||
    pathname.startsWith(
      `${prefix}/`
    )
  );
}

function isProtectedRoute(
  pathname: string
) {
  return protectedPrefixes.some(
    (prefix) =>
      matchesPrefix(pathname, prefix)
  );
}

function isGuestOnlyRoute(
  pathname: string
) {
  return guestOnlyPrefixes.some(
    (prefix) =>
      matchesPrefix(pathname, prefix)
  );
}

function copyCookies(
  source: NextResponse,
  destination: NextResponse
) {
  source.cookies
    .getAll()
    .forEach((cookie) => {
      destination.cookies.set(cookie);
    });

  return destination;
}

export async function proxy(
  request: NextRequest
) {
  const { pathname, search } =
    request.nextUrl;

  const { response, user } =
    await updateSession(request);

  /*
   * Protect authenticated application routes.
   */
  if (
    !user &&
    isProtectedRoute(pathname)
  ) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";

    loginUrl.search = "";

    const requestedDestination =
      `${pathname}${search}`;

    loginUrl.searchParams.set(
      "next",
      requestedDestination
    );

    return copyCookies(
      response,
      NextResponse.redirect(loginUrl)
    );
  }

  /*
   * Signed-in users should not return to normal
   * login or signup pages.
   *
   * Invitation routes remain public because authenticated
   * users may still need to inspect and accept invitations.
   */
  if (
    user &&
    isGuestOnlyRoute(pathname)
  ) {
    const nextValue =
      request.nextUrl.searchParams.get(
        "next"
      );

    const safeDestination =
      nextValue?.startsWith("/") &&
      !nextValue.startsWith("//") &&
      !nextValue.includes("\\")
        ? nextValue
        : "/dashboard";

    const destinationUrl =
      request.nextUrl.clone();

    destinationUrl.pathname =
      safeDestination;

    destinationUrl.search = "";

    return copyCookies(
      response,
      NextResponse.redirect(
        destinationUrl
      )
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on application routes while excluding static
     * assets and common public files.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff|woff2|ttf)$).*)",
  ],
};