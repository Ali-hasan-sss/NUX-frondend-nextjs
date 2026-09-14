import { isLoyaltyScanPath } from "@/lib/loyaltyQr";

const STORAGE_KEY = "nux_auth_next";

/** Only same-origin loyalty scan paths are allowed as post-login return URLs. */
export function sanitizeAuthRedirect(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  let path = raw.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      path = new URL(path).pathname;
    }
  } catch {
    return null;
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return null;
  }
  const pathname = path.split("?")[0].split("#")[0];
  if (!isLoyaltyScanPath(pathname)) return null;
  return pathname;
}

export function rememberAuthRedirect(path: string | null): void {
  if (typeof window === "undefined") return;
  if (path) sessionStorage.setItem(STORAGE_KEY, path);
  else sessionStorage.removeItem(STORAGE_KEY);
}

export function peekAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const fromQuery = sanitizeAuthRedirect(
    new URLSearchParams(window.location.search).get("next"),
  );
  const fromStore = sanitizeAuthRedirect(sessionStorage.getItem(STORAGE_KEY));
  return fromQuery || fromStore;
}

export function consumeAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const value = peekAuthRedirect();
  sessionStorage.removeItem(STORAGE_KEY);
  return value;
}

export function resolvePostLoginPath(opts: {
  role?: string;
  emailVerified?: boolean;
  email?: string;
  fallback: string;
}): string {
  const isAdmin = opts.role === "ADMIN" || opts.role === "SUBADMIN";
  const needsVerify =
    !isAdmin &&
    (opts.emailVerified === false || opts.emailVerified === undefined);

  if (needsVerify) {
    const q = opts.email
      ? `?email=${encodeURIComponent(opts.email)}`
      : "";
    return `/auth/verify-email${q}`;
  }

  if (opts.role === "USER") {
    const next = consumeAuthRedirect();
    if (next) return next;
  }

  return opts.fallback;
}
