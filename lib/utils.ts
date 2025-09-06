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
