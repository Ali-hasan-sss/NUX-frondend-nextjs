"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Smartphone,
  QrCode,
  LayoutDashboard,
  Wallet,
  BarChart3,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const HIGHLIGHT_KEYS = [
  { key: "mobileApp", icon: Smartphone },
  { key: "qrMenu", icon: QrCode },
  { key: "dashboard", icon: LayoutDashboard },
  { key: "wallet", icon: Wallet },
  { key: "analytics", icon: BarChart3 },
  { key: "multilingual", icon: Globe },
] as const;

export function Features() {
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
      id="features"
      className={cn(
        "py-16 lg:py-20 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#1A1F3A] to-[#0A0E27]"
          : "bg-gradient-to-b from-gray-100 to-white"
      )}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2
            className={cn(
              "text-3xl lg:text-4xl font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.highlights.title")}
          </h2>
          <p
            className={cn(
              "text-lg max-w-2xl mx-auto",
              isDark ? "text-white/70" : "text-gray-600"
            )}
          >
            {t("landing.highlights.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HIGHLIGHT_KEYS.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className={cn(
                  "h-full backdrop-blur-sm transition-all duration-300",
                  isDark
                    ? "bg-gradient-to-br from-[#1A1F3A]/90 to-[#2D1B4E]/80 border-purple-500/20 hover:border-cyan-500/40"
                    : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-lg"
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mb-3",
                      isDark ? "bg-purple-500/25" : "bg-cyan-100"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-6 w-6",
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      )}
                    />
                  </div>
                  <CardTitle
                    className={cn(
                      "text-lg",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {t(`landing.highlights.items.${item.key}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    className={cn(
                      "text-base leading-relaxed",
                      isDark ? "text-white/70" : "text-gray-600"
                    )}
                  >
                    {t(`landing.highlights.items.${item.key}.description`)}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
