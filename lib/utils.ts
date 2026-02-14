import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  input: string | number | Date,
  locale: string = "en-GB"
) {
  if (!input) return "";
  const date =
    typeof input === "string" || typeof input === "number"
      ? new Date(input)
      : input;
  if (isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Resolve image URL from path stored without domain.
 * - If path is already absolute (http/https), return as-is.
 * - Otherwise prepend server origin. Pass apiBaseUrl when available (e.g. axiosInstance.defaults.baseURL) so preview works even if NEXT_PUBLIC_API_URL is not set.
 * Backend serves uploads at GET /uploads/... (same origin as API, path not under /api).
 */
export function getImageUrl(
  path: string | null | undefined,
  apiBaseUrl?: string
): string {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://"))
    return trimmed;
  const apiBase =
    apiBaseUrl ||
    (typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL || window.location.origin)
      : process.env.NEXT_PUBLIC_API_URL || "");
  const origin = apiBase.replace(/\/api\/?$/, "") || apiBase;
  const baseClean = origin.replace(/\/$/, "");
  const pathClean = trimmed.startsWith("/") ? trimmed : "/" + trimmed;
  return baseClean + pathClean;
}
