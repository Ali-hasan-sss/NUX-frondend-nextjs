"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SectionReveal, SectionShell } from "@/components/landing/section-motion";

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
    <SectionShell
      bg="glow"
      isDark={isDark}
      className={cn(
        "py-20 flex items-center justify-center transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E]"
          : "bg-gradient-to-b from-gray-100 to-white"
      )}
    >
      <div className="container">
        <SectionReveal entrance="expand" className="max-w-3xl mx-auto text-center">
          <motion.h2
            className={cn(
              "text-3xl lg:text-4xl font-bold text-balance mb-6",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.cta.title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className={cn(
              "text-xl text-balance mb-8",
              isDark ? "text-white/80" : "text-gray-700"
            )}
          >
            {t("landing.cta.description")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
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
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                )}
              >
                {t("landing.cta.contactSales")}
              </Button>
            </Link>
          </motion.div>
        </SectionReveal>
      </div>
    </SectionShell>
  );
}
