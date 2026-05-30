"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function PlatformIntro() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark" || theme === "system";
  const pillars = ["guests", "restaurants", "business"] as const;

  return (
    <section
      id="platform"
      className={cn(
        "py-16 lg:py-24 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A]"
          : "bg-gradient-to-b from-white to-gray-50"
      )}
    >
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className={cn(
              "text-sm font-semibold uppercase tracking-wider mb-3",
              isDark ? "text-cyan-400" : "text-cyan-600"
            )}
          >
            {t("landing.platform.badge")}
          </p>
          <h2
            className={cn(
              "text-3xl sm:text-4xl lg:text-5xl font-bold mb-6",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.platform.title")}
          </h2>
          <p
            className={cn(
              "text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto mb-12",
              isDark ? "text-white/75" : "text-gray-600"
            )}
          >
            {t("landing.platform.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
          {pillars.map((key, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "rounded-2xl p-6 border backdrop-blur-sm",
                isDark
                  ? "bg-white/5 border-purple-500/25"
                  : "bg-white border-gray-200 shadow-sm"
              )}
            >
              <h3
                className={cn(
                  "text-lg font-semibold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {t(`landing.platform.pillars.${key}.title`)}
              </h3>
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                {t(`landing.platform.pillars.${key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
