export const locales = ["en", "ar", "de"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr"
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}
