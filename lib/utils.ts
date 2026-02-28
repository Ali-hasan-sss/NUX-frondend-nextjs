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
/**
 * Calculate price after discount; result is never negative (minimum 0).
 */
export function getPriceAfterDiscount(
  price: number,
  discountType?: string | null,
  discountValue?: number | null
): number {
  const p = Number(price);
  if (Number.isNaN(p) || p <= 0) return 0;
  if (!discountType || discountValue == null || Number(discountValue) <= 0)
    return p;
  const val = Number(discountValue);
  const reduced =
    discountType === "PERCENTAGE"
      ? p * (1 - val / 100)
      : p - val;
  return Math.max(0, reduced);
}

/**
 * Format a price with the restaurant's currency.
 * Uses symbol for common codes (USD, EUR, TRY, GBP); otherwise shows code after amount (e.g. "7.99 TRY").
 */
export function formatPrice(
  price: number,
  currencyCode?: string | null
): string {
  const num = Number(price);
  if (Number.isNaN(num)) return "0.00";
  const fixed = num.toFixed(2);
  if (!currencyCode || typeof currencyCode !== "string") return `$${fixed}`;
  const code = currencyCode.toUpperCase();
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    TRY: "₺",
    GBP: "£",
    SAR: "﷼",
    AED: "د.إ",
  };
  const symbol = symbols[code];
  if (symbol) return `${symbol}${fixed}`;
  return `${fixed} ${code}`;
}

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
