function envApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(
    /\/$/,
    "",
  );
}

function isLoopbackHost(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

/**
 * Phone browsers on LAN cannot use localhost (that is the phone itself).
 * Proxy REST through the Next.js origin so only port 3000 must be reachable.
 */
export function getApiBaseUrl(): string {
  const envUrl = envApiUrl();
  if (typeof window === "undefined") return envUrl;

  const pageHost = window.location.hostname;
  if (isLoopbackHost(pageHost)) return envUrl;

  try {
    const parsed = new URL(envUrl);
    if (isLoopbackHost(parsed.hostname)) {
      return `${window.location.origin}/nux-api`;
    }
  } catch {
    // keep env URL
  }

  return envUrl;
}

export function getSocketUrl(): string {
  const envUrl = envApiUrl();

  if (typeof window !== "undefined") {
    const pageHost = window.location.hostname;
    try {
      const parsed = new URL(envUrl);
      if (!isLoopbackHost(pageHost) && isLoopbackHost(parsed.hostname)) {
        const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
        return `${wsProto}//${pageHost}:5000`;
      }
    } catch {
      // fall through
    }
  }

  const apiUrl = typeof window === "undefined" ? envUrl : getApiBaseUrl();
  const base = apiUrl.replace(/\/nux-api\/?$/, "").replace(/\/api\/?$/, "");
  if (base.startsWith("https")) return base.replace(/^https/, "wss");
  if (base.startsWith("http")) return base.replace(/^http/, "ws");
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/^https/, "wss").replace(/^http/, "ws");
  }
  return "ws://localhost:5000";
}
