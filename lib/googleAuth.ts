export const GOOGLE_ID_TOKEN_COOKIE = "nux_google_id_token";
export const GOOGLE_ID_TOKEN_STORAGE = "nux_google_id_token";
export const GOOGLE_CALLBACK_PATH = "/auth/google/callback";
export const GOOGLE_OAUTH_STATE_KEY = "nux_google_oauth_state";
export const CANONICAL_WEB_ORIGIN = "https://nuxapp.de";

export function googleCallbackUrl(origin?: string): string {
  const raw = (origin || CANONICAL_WEB_ORIGIN).replace(/\/$/, "");
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (host === "nuxapp.de" || host === "www.nuxapp.de") {
      return `${CANONICAL_WEB_ORIGIN}${GOOGLE_CALLBACK_PATH}`;
    }
  } catch {
    // fall through
  }
  return `${raw}${GOOGLE_CALLBACK_PATH}`;
}

export function buildGoogleOidcRedirectUrl(
  clientId: string,
  redirectUri: string,
): string {
  const state =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  const nonce =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  try {
    sessionStorage.setItem(
      GOOGLE_OAUTH_STATE_KEY,
      JSON.stringify({ state, nonce }),
    );
  } catch {
    // Safari private mode may block storage
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    response_mode: "fragment",
    scope: "openid email profile",
    nonce,
    state,
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function consumeGoogleOidcHash(hash: string): string | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("error")) return null;
  const token = params.get("id_token")?.trim();
  if (!token) return null;

  const returnedState = params.get("state");
  try {
    const raw = sessionStorage.getItem(GOOGLE_OAUTH_STATE_KEY);
    sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    if (raw && returnedState) {
      const saved = JSON.parse(raw) as { state?: string };
      if (saved.state && saved.state !== returnedState) return null;
    }
  } catch {
    try {
      sessionStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);
    } catch {
      // ignore
    }
  }

  return token;
}

export function persistGoogleIdToken(token: string): void {
  try {
    sessionStorage.setItem(GOOGLE_ID_TOKEN_STORAGE, token);
  } catch {
    // ignore
  }
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${GOOGLE_ID_TOKEN_COOKIE}=${encodeURIComponent(token)}; Max-Age=120; Path=/; SameSite=Lax${secure}`;
}

export function readAndClearGoogleIdToken(): string {
  if (typeof window === "undefined") return "";

  const fromHash = consumeGoogleOidcHash(window.location.hash);
  if (fromHash) {
    try {
      history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    } catch {
      // ignore
    }
    return fromHash;
  }

  try {
    const stored = sessionStorage.getItem(GOOGLE_ID_TOKEN_STORAGE) || "";
    sessionStorage.removeItem(GOOGLE_ID_TOKEN_STORAGE);
    if (stored) return stored;
  } catch {
    // ignore
  }

  const prefix = `${GOOGLE_ID_TOKEN_COOKIE}=`;
  const raw = document.cookie.split("; ").find((c) => c.startsWith(prefix));
  document.cookie = `${GOOGLE_ID_TOKEN_COOKIE}=; Max-Age=0; Path=/`;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw.slice(prefix.length));
  } catch {
    return raw.slice(prefix.length);
  }
}
