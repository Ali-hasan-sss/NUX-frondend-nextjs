const STORAGE_KEY = "nux_web_client_id";

/**
 * Stable per-browser client id for API rate limiting (not hardware fingerprinting).
 */
export function getOrCreateWebClientDeviceId(): string {
  if (typeof window === "undefined") {
    return "server";
  }
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
  } catch {
    /* fall through */
  }
  const id = `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 18)}_${Math.random().toString(36).slice(2, 18)}`;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* use ephemeral for this session */
  }
  return id;
}
