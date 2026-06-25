"use client";

import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** App purpose for OAuth branding — bottom of landing, user language. */
export function AppPurposeSection() {
  const { t, i18n } = useTranslation();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark" || theme === "dark";
  const isRtl = i18n.dir() === "rtl";

  return (
    <section
      id="about-nux-app"
      aria-labelledby="about-nux-app-heading"
      className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "rounded-xl border px-4 py-4 sm:px-6 sm:py-5",
          isDark
            ? "border-cyan-400/20 bg-[#1A1F3A]/80"
            : "border-violet-200/80 bg-white/90 shadow-sm"
        )}
      >
        <h2
          id="about-nux-app-heading"
          className={cn(
            "text-base sm:text-lg font-semibold mb-2",
            isDark ? "text-white" : "text-gray-900",
            isRtl && "text-right"
          )}
        >
          {t("landing.appPurpose.title")}
        </h2>
        <p
          className={cn(
            "text-sm sm:text-base leading-relaxed",
            isDark ? "text-white/80" : "text-gray-700",
            isRtl && "text-right"
          )}
        >
          {t("landing.appPurpose.description")}
        </p>
      </div>
    </section>
  );
}
