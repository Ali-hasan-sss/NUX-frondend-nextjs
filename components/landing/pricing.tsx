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
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPublicPlans } from "@/features/public/plans/publicPlansThunks";
import type { PublicPlan } from "@/features/public/plans/publicPlansTypes";
import { PERMISSION_LABELS } from "@/features/admin/plans/permissionsConstants";

function formatPrice(
  price: number | null | undefined,
  currency: string | null | undefined
): string {
  if (!price || price <= 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "EUR").toUpperCase(),
  }).format(price);
}

function formatDuration(duration: number | null | undefined): string {
  if (!duration || duration <= 0) return "";
  if (duration === 1) return "/day";
  if (duration < 30) return `/${duration} days`;
  if (duration < 365) {
    const months = Math.round(duration / 30);
    return `/${months} month${months > 1 ? "s" : ""}`;
  }
  const years = Math.floor(duration / 365);
  return `/${years} year${years > 1 ? "s" : ""}`;
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function planToDisplay(plan: PublicPlan, index: number, totalCount: number) {
  const title = plan.title || "";
  // "الأكثر شعبية" لخطة واحدة فقط: الخطة الثانية (index 1) إن وُجدت
  const popular = totalCount > 2 && index === 2;
  const isFree = !plan.price || plan.price <= 0;
  const features = (plan.permissions || []).map((p) => {
    const label = (PERMISSION_LABELS as Record<string, string>)[p.type];
    if (label) return label;
    if (p.isUnlimited) return `${p.type.replace(/_/g, " ")} (Unlimited)`;
    if (p.value != null) return `${p.type.replace(/_/g, " ")}: ${p.value}`;
    return p.type.replace(/_/g, " ");
  });
  return {
    id: plan.id,
    name: title,
    price: formatPrice(plan.price, plan.currency),
    period: formatDuration(plan.duration),
    description: stripHtml(plan.description) || undefined,
    features: features.length > 0 ? features : [title],
    popular,
    isFree,
  };
}

export function Pricing() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const {
    plans: apiPlans,
    loading,
    error,
  } = useAppSelector((state) => ({
    plans: state.publicPlans.plans,
    loading: state.publicPlans.loading.plans,
    error: state.publicPlans.error.plans,
  }));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      dispatch(fetchPublicPlans());
    }
  }, [mounted, dispatch]);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";
  const activePlans = (apiPlans || []).filter((p) => p.isActive);
  const plans = activePlans.map((p, i) =>
    planToDisplay(p, i, activePlans.length)
  );

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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className={cn(
                  "min-h-[380px] flex flex-col",
                  isDark
                    ? "bg-gradient-to-br from-[#1A1F3A]/80 to-[#2D1B4E]/80 border-purple-500/20"
                    : "bg-white border-gray-200"
                )}
              >
                <CardHeader className="text-center pb-6">
                  <div className="h-8 w-40 bg-muted rounded mx-auto animate-pulse" />
                  <div className="h-4 w-28 bg-muted rounded mx-auto mt-2 animate-pulse" />
                  <div className="h-10 w-20 bg-muted rounded mx-auto mt-4 animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {[1, 2, 3, 4].map((j) => (
                      <li
                        key={j}
                        className="h-5 bg-muted rounded animate-pulse"
                      />
                    ))}
                  </ul>
                  <div className="h-10 bg-muted rounded animate-pulse mt-auto pt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center px-4">
            <p
              className={cn(
                "text-lg mb-4",
                isDark ? "text-white/80" : "text-gray-600"
              )}
            >
              {error}
            </p>
            <Button
              variant="outline"
              onClick={() => dispatch(fetchPublicPlans())}
              className={isDark ? "border-purple-500/30 text-white" : ""}
            >
              {t("landing.pricing.retry") || "Try again"}
            </Button>
          </div>
        ) : plans.length === 0 ? (
          <p
            className={cn(
              "text-center text-lg",
              isDark ? "text-white/70" : "text-gray-600"
            )}
          >
            {t("landing.pricing.noPlans")}
          </p>
        ) : (
          <div
            className={cn(
              "grid gap-6 max-w-7xl mx-auto px-4",
              plans.length === 1
                ? "grid-cols-1 max-w-sm"
                : plans.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : plans.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            )}
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "relative",
                  plan.popular
                    ? "border-primary shadow-lg lg:scale-[1.02]"
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
                    "flex flex-col min-h-[380px]",
                    isDark
                      ? "bg-gradient-to-br from-[#1A1F3A]/80 to-[#2D1B4E]/80 border-purple-500/20 backdrop-blur-sm"
                      : "bg-white border-gray-200"
                  )}
                >
                  <CardHeader className="text-center pb-6">
                    <CardTitle
                      className={cn(
                        "text-xl lg:text-2xl",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {plan.name}
                    </CardTitle>
                    {plan.description && (
                      <CardDescription
                        className={cn(
                          "text-sm",
                          isDark ? "text-white/70" : "text-gray-600"
                        )}
                      >
                        {plan.description}
                      </CardDescription>
                    )}
                    <div className="mt-3">
                      <span
                        className={cn(
                          "text-3xl font-bold",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {plan.price}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          isDark ? "text-white/70" : "text-gray-600"
                        )}
                      >
                        {plan.period}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
                    <ul className="space-y-2 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
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

                    <div className="mt-auto pt-4">
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
                          {plan.isFree
                            ? t("landing.pricing.startFree")
                            : t("landing.pricing.startNow")}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
