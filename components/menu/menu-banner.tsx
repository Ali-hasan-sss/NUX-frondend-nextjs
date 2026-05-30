"use client";

import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClientTheme } from "@/hooks/useClientTheme";

interface MenuBannerProps {
  message: string;
  className?: string;
}

export function MenuBanner({ message, className }: MenuBannerProps) {
  const { colors, isDark, mounted } = useClientTheme();
  const text = message.trim();
  if (!mounted || !text) return null;

  return (
    <div
      className={cn("mb-4 sm:mb-5", className)}
      role="note"
      aria-label={text}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4 shadow-sm",
          isDark ? "border-primary/25" : "border-primary/20"
        )}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${colors.primary}18 0%, ${colors.surface} 55%)`
            : `linear-gradient(135deg, ${colors.primary}12 0%, ${colors.surfaceSolid ?? colors.surface} 60%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl"
          style={{ backgroundColor: colors.primary }}
        />
        <div className="relative flex gap-3 sm:gap-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${colors.primary}22`,
              color: colors.primary,
            }}
          >
            <Megaphone className="h-5 w-5" aria-hidden />
          </div>
          <p
            className="min-w-0 flex-1 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words"
            style={{ color: colors.text }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
