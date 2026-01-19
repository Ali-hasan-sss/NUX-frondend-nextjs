"use client";

import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div className="sticky left-80 md:left-0 top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border-b">
        <div className="flex items-center gap-1 sm:gap-2 pr-1 min-w-0 lg:pl-0 pl-14">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="rounded"
          />
          <span className="text-sm font-medium hidden sm:inline">
            NUX
          </span>
        </div>
        <div className={cn(
          "flex items-center gap-1 sm:gap-2 shrink-0",
          // Add left padding in RTL mobile to avoid sidebar button overlap
          isRTL && "lg:pl-0 pl-12"
        )}>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
