"use client";

import { motion } from "framer-motion";
import {
  QrCode,
  ShieldCheck,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SectionReveal,
  SectionShell,
} from "@/components/landing/section-motion";

const STEPS: { key: string; icon: LucideIcon }[] = [
  { key: "scanQr", icon: QrCode },
  { key: "staffApproval", icon: ShieldCheck },
  { key: "placeOrder", icon: ShoppingBag },
  { key: "kitchenPrep", icon: ChefHat },
  { key: "readyToServe", icon: UtensilsCrossed },
];

export function OrderJourney() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isRtl = i18n.language.startsWith("ar");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark" || theme === "system";

  return (
    <SectionShell
      id="order-journey"
      bg="orbit"
      isDark={isDark}
      className={cn(
        "py-12 lg:py-16 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A]"
          : "bg-gradient-to-b from-white to-gray-50"
      )}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <SectionReveal entrance="fade-scale" className="text-center mb-10">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-4 py-1 text-sm font-medium mb-4",
              isDark
                ? "bg-cyan-500/20 text-cyan-300"
                : "bg-cyan-100 text-cyan-700"
            )}
          >
            {t("landing.orderJourney.badge")}
          </span>
          <h2
            className={cn(
              "text-3xl lg:text-4xl font-bold mb-3 text-balance",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.orderJourney.title")}
          </h2>
          <p
            className={cn(
              "text-base sm:text-lg max-w-2xl mx-auto text-balance",
              isDark ? "text-white/70" : "text-gray-600"
            )}
          >
            {t("landing.orderJourney.subtitle")}
          </p>
        </SectionReveal>

        <div
          className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap items-stretch justify-center gap-3 md:gap-2"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="contents">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className={cn(
                    "flex-1 min-w-[140px] rounded-2xl border px-4 py-5 text-center",
                    isDark
                      ? "bg-[#1A1F3A]/80 border-purple-500/25"
                      : "bg-white border-gray-200 shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full",
                      isDark ? "bg-cyan-500/20 text-cyan-300" : "bg-cyan-100 text-cyan-700"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p
                    className={cn(
                      "text-sm font-semibold leading-snug",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {t(`landing.orderJourney.steps.${step.key}`)}
                  </p>
                </motion.div>
                {index < STEPS.length - 1 ? (
                  <div className="hidden lg:flex items-center justify-center text-cyan-500 px-0.5">
                    <ChevronRight
                      className={cn("h-5 w-5", isRtl && "rotate-180")}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
