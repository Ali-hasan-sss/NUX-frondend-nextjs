"use client";

import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Smartphone,
  QrCode,
  LayoutDashboard,
  Wallet,
  Gift,
  Building2,
  MapPin,
  Check,
  type LucideIcon,
} from "lucide-react";

const SECTION_CONFIG: {
  id: string;
  key: string;
  icon: LucideIcon;
  reverse?: boolean;
}[] = [
  { id: "guest-app", key: "guestApp", icon: Smartphone },
  { id: "menu-qr", key: "digitalMenu", icon: QrCode, reverse: true },
  { id: "restaurant-dashboard", key: "restaurantOps", icon: LayoutDashboard },
  { id: "wallet-payments", key: "walletPayments", icon: Wallet, reverse: true },
  { id: "loyalty-promotions", key: "loyaltyPromotions", icon: Gift },
  { id: "company-accounts", key: "companyAccounts", icon: Building2, reverse: true },
  { id: "discover", key: "discover", icon: MapPin },
];

export function FeatureSections() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark" || theme === "system";

  return (
    <div id="platform-features">
      {SECTION_CONFIG.map((section, sectionIndex) => {
        const Icon = section.icon;
        const bullets = t(`landing.sections.${section.key}.bullets`, {
          returnObjects: true,
        }) as string[] | string;
        const bulletList = Array.isArray(bullets) ? bullets : [];

        return (
          <section
            key={section.id}
            id={section.id}
            className={cn(
              "py-16 lg:py-20 transition-colors",
              sectionIndex % 2 === 0
                ? isDark
                  ? "bg-[#1A1F3A]"
                  : "bg-gray-50"
                : isDark
                ? "bg-[#0A0E27]"
                : "bg-white"
            )}
          >
            <div className="container max-w-6xl mx-auto px-4 sm:px-6">
              <div
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center",
                  section.reverse && "lg:[direction:rtl]"
                )}
              >
                <motion.div
                  initial={{ opacity: 0, x: section.reverse ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={cn(section.reverse && "lg:[direction:ltr]")}
                >
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6",
                      isDark ? "bg-purple-500/20" : "bg-cyan-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-7 w-7",
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      )}
                    />
                  </div>
                  <h3
                    className={cn(
                      "text-2xl sm:text-3xl font-bold mb-3",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {t(`landing.sections.${section.key}.title`)}
                  </h3>
                  <p
                    className={cn(
                      "text-base sm:text-lg mb-6 leading-relaxed",
                      isDark ? "text-cyan-300/90" : "text-cyan-700"
                    )}
                  >
                    {t(`landing.sections.${section.key}.subtitle`)}
                  </p>
                  <p
                    className={cn(
                      "text-base leading-relaxed mb-8",
                      isDark ? "text-white/75" : "text-gray-600"
                    )}
                  >
                    {t(`landing.sections.${section.key}.description`)}
                  </p>
                  <ul className="space-y-3">
                    {bulletList.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            "h-5 w-5 flex-shrink-0 mt-0.5",
                            isDark ? "text-cyan-400" : "text-cyan-600"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm sm:text-base",
                            isDark ? "text-white/85" : "text-gray-700"
                          )}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: section.reverse ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={cn(
                    "flex justify-center lg:justify-center",
                    section.reverse && "lg:[direction:ltr]"
                  )}
                >
                  <div
                    className={cn(
                      "w-full max-w-md aspect-[4/3] rounded-3xl border flex flex-col items-center justify-center p-8 text-center",
                      isDark
                        ? "bg-gradient-to-br from-[#2D1B4E]/60 to-[#1A1F3A]/80 border-purple-500/30"
                        : "bg-gradient-to-br from-cyan-50 to-purple-50 border-cyan-200"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-20 w-20 mb-4 opacity-80",
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      )}
                    />
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-white/60" : "text-gray-500"
                      )}
                    >
                      {t(`landing.sections.${section.key}.visualLabel`)}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
