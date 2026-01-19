"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Pricing() {
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

  const plans = [
    {
      name: t("landing.pricing.plans.starter.name"),
      price: "$29",
      period: "/month",
      description: t("landing.pricing.plans.starter.description"),
      features: [
        t("landing.pricing.plans.starter.features.0"),
        t("landing.pricing.plans.starter.features.1"),
        t("landing.pricing.plans.starter.features.2"),
        t("landing.pricing.plans.starter.features.3"),
        t("landing.pricing.plans.starter.features.4"),
      ],
      popular: false,
    },
    {
      name: t("landing.pricing.plans.professional.name"),
      price: "$79",
      period: "/month",
      description: t("landing.pricing.plans.professional.description"),
      features: [
        t("landing.pricing.plans.professional.features.0"),
        t("landing.pricing.plans.professional.features.1"),
        t("landing.pricing.plans.professional.features.2"),
        t("landing.pricing.plans.professional.features.3"),
        t("landing.pricing.plans.professional.features.4"),
        t("landing.pricing.plans.professional.features.5"),
      ],
      popular: true,
    },
    {
      name: t("landing.pricing.plans.enterprise.name"),
      price: "$199",
      period: "/month",
      description: t("landing.pricing.plans.enterprise.description"),
      features: [
        t("landing.pricing.plans.enterprise.features.0"),
        t("landing.pricing.plans.enterprise.features.1"),
        t("landing.pricing.plans.enterprise.features.2"),
        t("landing.pricing.plans.enterprise.features.3"),
        t("landing.pricing.plans.enterprise.features.4"),
        t("landing.pricing.plans.enterprise.features.5"),
      ],
      popular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className={cn(
        "py-20 flex items-center justify-center animate-in fade-in-50 slide-in-from-bottom-2 duration-500 transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A]"
          : "bg-gradient-to-b from-white to-gray-50"
      )}
    >
      <div className="container">
        <div className="text-center mb-16">
          <h2
            className={cn(
              "text-3xl lg:text-4xl font-bold text-balance mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {t("landing.pricing.title")}
          </h2>
          <p
            className={cn(
              "text-xl text-balance max-w-2xl mx-auto",
              isDark ? "text-white/70" : "text-gray-600"
            )}
          >
            {t("landing.pricing.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 md:px-0">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative",
                plan.popular
                  ? "border-primary shadow-lg md:scale-105"
                  : "border-border"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    {t("landing.pricing.mostPopular")}
                  </span>
                </div>
              )}
              <Card
                className={cn(
                  isDark
                    ? "bg-gradient-to-br from-[#1A1F3A]/80 to-[#2D1B4E]/80 border-purple-500/20 backdrop-blur-sm"
                    : "bg-white border-gray-200"
                )}
              >
                <CardHeader className="text-center pb-8">
                  <CardTitle
                    className={cn(
                      "text-2xl",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {plan.name}
                  </CardTitle>
                  <CardDescription
                    className={cn(
                      "text-base",
                      isDark ? "text-white/70" : "text-gray-600"
                    )}
                  >
                    {plan.description}
                  </CardDescription>
                  <div className="mt-4">
                    <span
                      className={cn(
                        "text-4xl font-bold",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={isDark ? "text-white/70" : "text-gray-600"}
                    >
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center space-x-3"
                      >
                        <Check className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                        <span
                          className={cn(
                            "text-sm",
                            isDark ? "text-white/80" : "text-gray-700"
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6">
                    <Link href="/auth/register" className="block">
                      <Button
                        className={cn(
                          "w-full",
                          plan.popular
                            ? "bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0"
                            : isDark
                            ? "bg-transparent border-purple-500/30 text-white hover:bg-purple-500/20"
                            : "bg-transparent border-gray-300 text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {t("landing.pricing.startFreeTrial")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
