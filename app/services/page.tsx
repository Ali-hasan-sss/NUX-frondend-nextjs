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
  QrCode,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  Shield,
  Smartphone,
  HeadphonesIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ServicesPage() {
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
        <ServicesContent />
        <Footer />
      </div>
    </I18nProvider>
  );
}

function ServicesContent() {
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

  const services = [
    {
      icon: QrCode,
      title:
        t("landing.services.qrCodes.title") ||
        "QR Code Management",
      description:
        t("landing.services.qrCodes.description") ||
        "Generate and manage QR codes for drinks, meals, and menu viewing.",
      benefits: [
        t("landing.services.qrCodes.benefit1") ||
          "Easy customer engagement",
        t("landing.services.qrCodes.benefit2") ||
          "Contactless menu viewing",
        t("landing.services.qrCodes.benefit3") ||
          "Automated reward collection",
      ],
    },
    {
      icon: BarChart3,
      title:
        t("landing.services.analytics.title") ||
        "Customer Analytics",
      description:
        t("landing.services.analytics.description") ||
        "Track customer behavior and make data-driven decisions.",
      benefits: [
        t("landing.services.analytics.benefit1") ||
          "Real-time statistics",
        t("landing.services.analytics.benefit2") ||
          "Customer insights",
        t("landing.services.analytics.benefit3") ||
          "Performance tracking",
      ],
    },
    {
      icon: Users,
      title:
        t("landing.services.loyalty.title") ||
        "Loyalty Programs",
      description:
        t("landing.services.loyalty.description") ||
        "Create automated loyalty programs with points and rewards.",
      benefits: [
        t("landing.services.loyalty.benefit1") ||
          "Automated tracking",
        t("landing.services.loyalty.benefit2") ||
          "Custom rewards",
        t("landing.services.loyalty.benefit3") ||
          "Retention tools",
      ],
    },
    {
      icon: Package,
      title:
        t("landing.services.packages.title") ||
        "Package Management",
      description:
        t("landing.services.packages.description") ||
        "Create packages and promotions to attract customers.",
      benefits: [
        t("landing.services.packages.benefit1") ||
          "Flexible pricing",
        t("landing.services.packages.benefit2") ||
          "Campaigns",
        t("landing.services.packages.benefit3") ||
          "Revenue optimization",
      ],
    },
    {
      icon: ShoppingCart,
      title:
        t("landing.services.payments.title") ||
        "Payment Tracking",
      description:
        t("landing.services.payments.description") ||
        "Monitor payments and manage revenue streams.",
      benefits: [
        t("landing.services.payments.benefit1") ||
          "Multiple payment types",
        t("landing.services.payments.benefit2") ||
          "Payment history",
        t("landing.services.payments.benefit3") ||
          "Financial reporting",
      ],
    },
    {
      icon: Shield,
      title:
        t("landing.services.security.title") ||
        "Secure Platform",
      description:
        t("landing.services.security.description") ||
        "Enterprise-grade security for your data.",
      benefits: [
        t("landing.services.security.benefit1") ||
          "Data encryption",
        t("landing.services.security.benefit2") ||
          "Secure transactions",
        t("landing.services.security.benefit3") ||
          "99.9% uptime",
      ],
    },
    {
      icon: Smartphone,
      title:
        t("landing.services.mobile.title") ||
        "Mobile-Friendly",
      description:
        t("landing.services.mobile.description") ||
        "Manage your restaurant from any device.",
      benefits: [
        t("landing.services.mobile.benefit1") ||
          "Responsive design",
        t("landing.services.mobile.benefit2") ||
          "Mobile app support",
        t("landing.services.mobile.benefit3") ||
          "Real-time updates",
      ],
    },
    {
      icon: HeadphonesIcon,
      title:
        t("landing.services.support.title") ||
        "24/7 Support",
      description:
        t("landing.services.support.description") ||
        "Get assistance whenever you need it.",
      benefits: [
        t("landing.services.support.benefit1") ||
          "24/7 support",
        t("landing.services.support.benefit2") ||
          "Training resources",
        t("landing.services.support.benefit3") ||
          "Regular updates",
      ],
    },
  ];

  return (
    <main className=" pb-16">
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Dynamic gradient background */}
        <div
          className={cn(
            "absolute inset-0 transition-colors duration-300",
            isDark
              ? "bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
              : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
          )}
        />

        {/* Animated glowing particles and lines */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, -40, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
          {/* Glowing lines effect */}
          <div className="absolute top-0 left-0 w-full h-full">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 30,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-cyan-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
            />
            <motion.div
              animate={{
                rotate: [360, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{
                duration: 25,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-pink-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1
              className={cn(
                "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.services.title") || "Our Services"}
            </h1>
            <p
              className={cn(
                "text-lg md:text-xl mb-8 max-w-2xl mx-auto",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              {t("landing.services.subtitle") ||
                "Comprehensive solutions for your restaurant"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    "h-full transition-all duration-300 hover:shadow-xl",
                    isDark
                      ? "bg-[#1A1F3A] border-purple-500/20 hover:border-purple-500/40"
                      : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-cyan-100"
                  )}
                >
                  <CardHeader>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                        isDark ? "bg-purple-500/20" : "bg-cyan-100"
                      )}
                    >
                      <service.icon
                        className={cn(
                          "h-6 w-6",
                          isDark ? "text-cyan-400" : "text-cyan-600"
                        )}
                      />
                    </div>
                    <CardTitle
                      className={cn(
                        "text-xl mb-2",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {service.title}
                    </CardTitle>
                    <CardDescription
                      className={cn(
                        "text-base leading-relaxed mb-4",
                        isDark ? "text-gray-300" : "text-gray-600"
                      )}
                    >
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, i) => (
                        <li
                          key={i}
                          className={cn(
                            "flex items-start text-sm",
                            isDark ? "text-gray-300" : "text-gray-600"
                          )}
                        >
                          <span
                            className={cn(
                              "mr-2 mt-1",
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
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
