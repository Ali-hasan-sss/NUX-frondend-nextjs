"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  TabletSmartphone,
  Radio,
  LayoutGrid,
  Bell,
  Gift,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SectionReveal,
  SectionRevealItem,
  SectionShell,
  type SectionEntrance,
} from "@/components/landing/section-motion";
import {
  HOMEPAGE_SERVICE_CARDS,
  type HomepageServiceCardKey,
} from "@/lib/planDisplayExtras";

const SERVICE_ICONS: Record<HomepageServiceCardKey, LucideIcon> = {
  secureOrdering: ShieldCheck,
  kitchenDisplay: TabletSmartphone,
  liveTracking: Radio,
  floorTable: LayoutGrid,
  callWaiter: Bell,
  loyaltyVisibility: Gift,
};

const CARD_ENTRANCES: SectionEntrance[] = [
  "slide-left",
  "fade-up",
  "slide-right",
  "zoom-in",
  "blur-in",
  "rotate-in",
];

export function ServiceHighlights() {
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
      id="key-services"
      bg="mesh"
      isDark={isDark}
      className={cn(
        "py-16 lg:py-20 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#1A1F3A] to-[#0A0E27]"
          : "bg-gradient-to-b from-gray-50 to-white"
      )}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <SectionReveal entrance="fade-scale" className="text-center mb-12">
          <h2
            className={cn(
              "text-3xl lg:text-4xl font-bold mb-4 text-balance",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.serviceCards.title")}
          </h2>
          <p
            className={cn(
              "text-lg max-w-2xl mx-auto text-balance",
              isDark ? "text-white/70" : "text-gray-600"
            )}
          >
            {t("landing.serviceCards.subtitle")}
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {HOMEPAGE_SERVICE_CARDS.map((service, index) => {
            const Icon = SERVICE_ICONS[service.key];
            return (
              <SectionRevealItem
                key={service.key}
                entrance={CARD_ENTRANCES[index % CARD_ENTRANCES.length]}
                index={index}
              >
                <motion.a
                  href="#pricing"
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 280 }}
                  className="block h-full"
                  data-plan-permission={service.permission}
                >
                  <Card
                    className={cn(
                      "h-full backdrop-blur-sm transition-all duration-300",
                      isDark
                        ? "bg-gradient-to-br from-[#1A1F3A]/90 to-[#2D1B4E]/80 border-purple-500/20 hover:border-cyan-500/40"
                        : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-lg"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center mb-3",
                          isDark ? "bg-purple-500/25" : "bg-cyan-100"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6",
                            isDark ? "text-cyan-400" : "text-cyan-600"
                          )}
                        />
                      </div>
                      <CardTitle
                        className={cn(
                          "text-lg leading-snug",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {t(`landing.serviceCards.items.${service.key}.title`)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isDark ? "text-white/65" : "text-gray-600"
                        )}
                      >
                        {t(
                          `landing.serviceCards.items.${service.key}.description`
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </motion.a>
              </SectionRevealItem>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
