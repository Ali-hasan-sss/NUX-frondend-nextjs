"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CTA() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <section
      className={cn(
        "py-20 flex items-center justify-center animate-in fade-in-50 slide-in-from-bottom-2 duration-500 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E]"
          : "bg-gradient-to-b from-gray-100 to-white"
      )}
    >
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className={cn(
              "text-3xl lg:text-4xl font-bold text-balance mb-6",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.cta.title")}
          </h2>
          <p
            className={cn(
              "text-xl text-balance mb-8",
              isDark ? "text-white/80" : "text-gray-700"
            )}
          >
            {t("landing.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button
                size="lg"
                className="text-lg px-8 bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0"
              >
                {t("landing.cta.startFreeTrial")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "text-lg px-8",
                  isDark
                    ? "border-purple-500/30 text-white hover:bg-purple-500/20 bg-transparent"
                    : "border-gray-300 text-gray-200 hover:bg-gray-100"
                )}
              >
                {t("landing.cta.contactSales")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
