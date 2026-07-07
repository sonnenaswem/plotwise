export function getSafeInternalPath(
  value: string | null | undefined,
  fallback = "/dashboard"
) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/")) {
    return fallback;
  }

  if (value.startsWith("//")) {
    return fallback;
  }

  /*
   * Reject backslashes because browsers can normalize them into
   * slash-based protocol-relative redirects.
   */
  if (value.includes("\\")) {
    return fallback;
  }

  return value;
}

export function createAuthCallbackUrl(
  destination: string
) {
  const safeDestination =
    getSafeInternalPath(destination);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ??
        "http://localhost:3000";

  const callbackUrl = new URL(
    "/auth/callback",
    origin
  );

  callbackUrl.searchParams.set(
    "next",
    safeDestination
  );

  return callbackUrl.toString();
}