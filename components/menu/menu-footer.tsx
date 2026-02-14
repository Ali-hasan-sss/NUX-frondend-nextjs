"use client";

import { useClientTheme } from "@/hooks/useClientTheme";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function MenuFooter() {
  const { colors, isDark, mounted } = useClientTheme();
  const { t } = useTranslation();

  if (!mounted) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t py-4 mt-auto shrink-0",
        "pb-6 md:pb-4",
        isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
      )}
      style={{
        borderTopColor: colors.border,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-1">
        <p
          className="text-center text-sm"
          style={{ color: colors.textSecondary }}
        >
          © {currentYear} All rights reserved.
        </p>
        <p
          className="text-center text-xs"
          style={{ color: colors.textSecondary, opacity: 0.85 }}
        >
          {t("menu.poweredByNux") || "Powered by nux"}
        </p>
      </div>
    </footer>
  );
}
