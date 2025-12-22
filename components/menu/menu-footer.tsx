"use client";

import { useClientTheme } from "@/hooks/useClientTheme";
import { cn } from "@/lib/utils";

export function MenuFooter() {
  const { colors, isDark, mounted } = useClientTheme();

  if (!mounted) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t py-4 mt-auto",
        isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
      )}
      style={{
        borderTopColor: colors.border,
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <p
          className="text-center text-sm"
          style={{ color: colors.textSecondary }}
        >
          © {currentYear} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
