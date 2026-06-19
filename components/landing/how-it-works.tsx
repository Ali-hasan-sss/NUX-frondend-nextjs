"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SectionReveal,
  SectionRevealItem,
  SectionShell,
} from "@/components/landing/section-motion";

const STEPS = ["register", "connect", "grow"] as const;

export function HowItWorks() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark" || theme === "system";

  return (
    <SectionShell
      id="how-it-works"
      bg="pulse-dots"
      isDark={isDark}
      className={cn(
        "py-16 lg:py-24 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E]"
          : "bg-gradient-to-b from-gray-100 to-white"
      )}
    >
      <div className="container max-w-5xl mx-auto px-4 sm:px-6">
        <SectionReveal entrance="slide-up" className="text-center mb-12">
          <h2
            className={cn(
              "text-3xl lg:text-4xl font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.howItWorks.title")}
          </h2>
          <p
            className={cn(
              "text-lg max-w-2xl mx-auto",
              isDark ? "text-white/70" : "text-gray-600"
            )}
          >
            {t("landing.howItWorks.subtitle")}
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div
            className={cn(
              "hidden md:block absolute top-6 left-[16%] right-[16%] h-px",
              isDark ? "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" : "bg-gradient-to-r from-transparent via-violet-300 to-transparent"
            )}
          />
          <motion.div
            className={cn(
              "hidden md:block absolute top-6 left-[16%] h-px origin-left",
              isDark ? "bg-cyan-400/60" : "bg-cyan-500/50"
            )}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "68%" }}
          />

          {STEPS.map((step, index) => (
            <SectionRevealItem
              key={step}
              entrance="fade-up"
              index={index}
              className="text-center relative"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.2 + index * 0.2,
                }}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4 relative z-10",
                  "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20"
                )}
              >
                {index + 1}
              </motion.div>
              <h3
                className={cn(
                  "text-xl font-semibold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {t(`landing.howItWorks.steps.${step}.title`)}
              </h3>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                {t(`landing.howItWorks.steps.${step}.description`)}
              </p>
            </SectionRevealItem>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
