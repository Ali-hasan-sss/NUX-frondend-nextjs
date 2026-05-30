"use client";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Building2,
  Smartphone,
  QrCode,
  LayoutDashboard,
  Wallet,
  Gift,
  BarChart3,
  Megaphone,
  Receipt,
  Shield,
  Globe,
  HeadphonesIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ServiceKey =
  | "companyAccounts"
  | "guestApp"
  | "qrCodes"
  | "restaurantOps"
  | "walletPayments"
  | "loyalty"
  | "analytics"
  | "packages"
  | "payments"
  | "security"
  | "mobile"
  | "support";

const SERVICES: {
  key: ServiceKey;
  icon: LucideIcon;
  benefitCount: 3 | 4;
  featured?: boolean;
}[] = [
  { key: "companyAccounts", icon: Building2, benefitCount: 4, featured: true },
  { key: "guestApp", icon: Smartphone, benefitCount: 3 },
  { key: "qrCodes", icon: QrCode, benefitCount: 3 },
  { key: "restaurantOps", icon: LayoutDashboard, benefitCount: 3 },
  { key: "walletPayments", icon: Wallet, benefitCount: 3 },
  { key: "loyalty", icon: Gift, benefitCount: 3 },
  { key: "analytics", icon: BarChart3, benefitCount: 3 },
  { key: "packages", icon: Megaphone, benefitCount: 3 },
  { key: "payments", icon: Receipt, benefitCount: 3 },
  { key: "security", icon: Shield, benefitCount: 3 },
  { key: "mobile", icon: Globe, benefitCount: 3 },
  { key: "support", icon: HeadphonesIcon, benefitCount: 3 },
];

export default function ServicesPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark" || theme === "system";

  return (
    <I18nProvider>
      <div
        className={cn(
          "min-h-screen transition-colors duration-300",
          isDark
            ? "bg-gradient-to-b from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
            : "bg-gradient-to-b from-gray-50 via-white to-gray-100"
        )}
      >
        <Header />
        <ServicesContent isDark={isDark} />
        <Footer />
      </div>
    </I18nProvider>
  );
}

function ServicesContent({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();

  return (
    <main className="pb-16">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0",
            isDark
              ? "bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
              : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
          )}
        />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.services.title")}
            </h1>
            <p
              className={cn(
                "text-lg md:text-xl max-w-2xl mx-auto",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              {t("landing.services.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <Card
            className={cn(
              "border-2",
              isDark
                ? "bg-gradient-to-br from-[#2D1B4E]/90 to-[#1A1F3A] border-cyan-500/40"
                : "bg-gradient-to-r from-cyan-50 to-purple-50 border-cyan-300"
            )}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2
                  className={cn(
                    "h-8 w-8 flex-shrink-0",
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  )}
                />
                <CardTitle
                  className={cn(
                    "text-xl md:text-2xl",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {t("landing.services.companyIntro.title")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  "text-base leading-relaxed",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                {t("landing.services.companyIntro.description")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              const benefits = Array.from(
                { length: service.benefitCount },
                (_, i) => t(`landing.services.${service.key}.benefit${i + 1}`)
              );

              return (
                <motion.div
                  key={service.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={cn(
                    service.featured && "md:col-span-2 lg:col-span-1"
                  )}
                >
                  <Card
                    className={cn(
                      "h-full transition-all duration-300 hover:shadow-xl",
                      service.featured &&
                        (isDark
                          ? "ring-1 ring-cyan-500/50"
                          : "ring-2 ring-cyan-200"),
                      isDark
                        ? "bg-[#1A1F3A] border-purple-500/20 hover:border-purple-500/40"
                        : "bg-white border-gray-200 hover:border-cyan-300"
                    )}
                  >
                    <CardHeader>
                      <div
                        className={cn(
                          "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                          service.featured
                            ? isDark
                              ? "bg-cyan-500/25"
                              : "bg-cyan-100"
                            : isDark
                            ? "bg-purple-500/20"
                            : "bg-cyan-100"
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
                          "text-xl",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {t(`landing.services.${service.key}.title`)}
                      </CardTitle>
                      <CardDescription
                        className={cn(
                          "text-base leading-relaxed",
                          isDark ? "text-gray-300" : "text-gray-600"
                        )}
                      >
                        {t(`landing.services.${service.key}.description`)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {benefits.map((benefit, i) => (
                          <li
                            key={i}
                            className={cn(
                              "flex items-start text-sm gap-2",
                              isDark ? "text-gray-300" : "text-gray-600"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5",
                                isDark ? "text-cyan-400" : "text-cyan-600"
                              )}
                            >
                              ✓
                            </span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
