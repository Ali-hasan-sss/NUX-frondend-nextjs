"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
    <section
      id="how-it-works"
      className={cn(
        "py-16 lg:py-24 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E]"
          : "bg-gradient-to-b from-gray-100 to-white"
      )}
    >
      <div className="container max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="text-center"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4",
                  isDark
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                )}
              >
                {index + 1}
              </div>
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
