"use client";

import Link from "next/link";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Target,
  Users,
  Award,
  Zap,
  Smartphone,
  UtensilsCrossed,
  Building2,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
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
        <AboutContent isDark={isDark} />
        <Footer />
      </div>
    </I18nProvider>
  );
}

function AboutContent({ isDark }: { isDark: boolean }) {
  const { t } = useTranslation();

  const values = [
    { icon: Target, titleKey: "mission" },
    { icon: Users, titleKey: "vision" },
    { icon: Award, titleKey: "excellence" },
    { icon: Zap, titleKey: "innovation" },
  ] as const;

  const audience = [
    { icon: Smartphone, key: "guests" },
    { icon: UtensilsCrossed, key: "restaurants" },
    { icon: Building2, key: "companies" },
  ] as const;

  const companyBenefits = ["benefit1", "benefit2", "benefit3", "benefit4"] as const;

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
              {t("landing.about.title")}
            </h1>
            <p
              className={cn(
                "text-lg md:text-xl max-w-2xl mx-auto",
                isDark ? "text-gray-300" : "text-gray-600"
              )}
            >
              {t("landing.about.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl space-y-6">
          {(["p1", "p2", "p3", "p4"] as const).map((key, i) => (
            <motion.p
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "text-lg leading-relaxed",
                isDark ? "text-gray-300" : "text-gray-700"
              )}
            >
              {t(`landing.about.story.${key}`)}
            </motion.p>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-10">
            <h2
              className={cn(
                "text-3xl font-bold mb-3",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.about.audience.title")}
            </h2>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              {t("landing.about.audience.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audience.map(({ icon: Icon, key }, index) => (
              <Card
                key={key}
                className={cn(
                  "h-full",
                  isDark
                    ? "bg-[#1A1F3A] border-purple-500/20"
                    : "bg-white border-gray-200"
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-2",
                      isDark ? "bg-purple-500/20" : "bg-cyan-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      )}
                    />
                  </div>
                  <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
                    {t(`landing.about.audience.${key}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    className={cn(
                      "text-base",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}
                  >
                    {t(`landing.about.audience.${key}.description`)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <Card
            className={cn(
              "border-2 overflow-hidden",
              isDark
                ? "bg-gradient-to-br from-[#2D1B4E]/80 to-[#1A1F3A] border-cyan-500/30"
                : "bg-gradient-to-br from-cyan-50 to-purple-50 border-cyan-200"
            )}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Building2
                  className={cn(
                    "h-8 w-8",
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  )}
                />
                <CardTitle
                  className={cn(
                    "text-2xl",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {t("landing.about.companySpotlight.title")}
                </CardTitle>
              </div>
              <CardDescription
                className={cn(
                  "text-base leading-relaxed",
                  isDark ? "text-gray-300" : "text-gray-700"
                )}
              >
                {t("landing.about.companySpotlight.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {companyBenefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check
                      className={cn(
                        "h-5 w-5 flex-shrink-0 mt-0.5",
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      )}
                    />
                    <span
                      className={cn(
                        isDark ? "text-white/90" : "text-gray-800"
                      )}
                    >
                      {t(`landing.about.companySpotlight.${b}`)}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button className="mt-4 bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0">
                  {t("landing.about.companySpotlight.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2
              className={cn(
                "text-3xl md:text-4xl font-bold mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.about.values.title")}
            </h2>
            <p className={cn(isDark ? "text-gray-300" : "text-gray-600")}>
              {t("landing.about.values.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, titleKey }, index) => (
              <Card
                key={titleKey}
                className={cn(
                  "h-full",
                  isDark
                    ? "bg-[#1A1F3A] border-purple-500/20"
                    : "bg-white border-gray-200"
                )}
              >
                <CardHeader>
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                      isDark ? "bg-purple-500/20" : "bg-cyan-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6",
                        isDark ? "text-cyan-400" : "text-cyan-600"
                      )}
                    />
                  </div>
                  <CardTitle className={isDark ? "text-white" : "text-gray-900"}>
                    {t(`landing.about.${titleKey}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    className={cn(
                      "text-base leading-relaxed",
                      isDark ? "text-gray-300" : "text-gray-600"
                    )}
                  >
                    {t(`landing.about.${titleKey}.description`)}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
