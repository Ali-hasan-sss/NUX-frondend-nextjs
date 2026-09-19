"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPublicPlans } from "@/features/public/plans/publicPlansThunks";
import { pickLocalizedPlanDescriptionHtml } from "@/features/public/plans/planDescription";
import type { PublicPlan, PublicPlanPermission } from "@/features/public/plans/publicPlansTypes";
import {
  SectionReveal,
  SectionRevealItem,
  SectionShell,
} from "@/components/landing/section-motion";
import { extraDisplayPermissionsFor, isStarterPlusPlan, ORDER_FEATURE_EXTRAS, shouldShowOrderFeatureExtras } from "@/lib/planDisplayExtras";

type BillingCycle = "monthly" | "annual";

const LIMIT_PERMISSION_TYPES = new Set([
  "MAX_MENU_ITEMS",
  "MAX_ADS",
  "MAX_PACKAGES",
  "MAX_GROUP_MEMBERS",
]);

function localeForLanguage(language: string): string {
  if (language === "de") return "de-DE";
  if (language === "tr") return "tr-TR";
  if (language === "ar") return "ar-SA";
  return "en-US";
}

function getPlanPrice(plan: PublicPlan, cycle: BillingCycle): number {
  if (cycle === "annual") {
    return plan.annualPrice ?? (plan.monthlyPrice ?? plan.price) * 12;
  }
  return plan.monthlyPrice ?? plan.price;
}

function isPriceOnRequestPlan(plan: PublicPlan): boolean {
  return Boolean(plan.priceOnRequest) || /enterprise/i.test(plan.title);
}

function plansGridClass(count: number): string {
  if (count === 1) return "grid-cols-1 max-w-sm";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
}

export function Pricing() {
  const { t, i18n } = useTranslation();
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
  const [billingCycles, setBillingCycles] = useState<Record<number, BillingCycle>>(
    {}
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      dispatch(fetchPublicPlans(i18n.language));
    }
  }, [mounted, dispatch, i18n.language]);

  const formatPrice = useCallback(
    (price: number | null | undefined, currency: string | null | undefined) => {
      if (!price || price <= 0) return t("landing.pricing.free");
      return new Intl.NumberFormat(localeForLanguage(i18n.language), {
        style: "currency",
        currency: (currency || "EUR").toUpperCase(),
      }).format(price);
    },
    [i18n.language, t]
  );

  const getBillingCycle = (planId: number): BillingCycle =>
    billingCycles[planId] ?? "monthly";

  const setBillingCycle = (planId: number, cycle: BillingCycle) => {
    setBillingCycles((prev) => ({ ...prev, [planId]: cycle }));
  };

  const getPermissionLabel = (permission: PublicPlanPermission): string => {
    const { type, value, isUnlimited } = permission;
    const label = t(`landing.pricing.permissions.${type}`, {
      defaultValue: type.replace(/_/g, " "),
    });
    if (!LIMIT_PERMISSION_TYPES.has(type)) {
      return label;
    }
    if (isUnlimited) {
      return `${label} (${t("landing.pricing.unlimited")})`;
    }
    if (value != null) {
      return t("landing.pricing.permissionWithValue", {
        label,
        value,
      });
    }
    return label;
  };

  const getPlanFeatures = (plan: PublicPlan): string[] => {
    const features: string[] = [];
    for (const permission of plan.permissions || []) {
      features.push(getPermissionLabel(permission));
      for (const extra of extraDisplayPermissionsFor(permission.type)) {
        features.push(
          t(`landing.pricing.permissions.${extra}`, {
            defaultValue: extra.replace(/_/g, " "),
          })
        );
      }
    }
    if (shouldShowOrderFeatureExtras(plan)) {
      for (const extra of ORDER_FEATURE_EXTRAS) {
        features.push(t(`landing.pricing.featureExtras.${extra}`));
      }
    }
    const unique = Array.from(new Set(features.filter(Boolean)));
    return unique.length > 0 ? unique : [plan.title];
  };

  const activePlans = useMemo(
    () =>
      (apiPlans || [])
        .filter((p) => p.isActive)
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    [apiPlans]
  );

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <SectionShell
      id="pricing"
      bg="radial"
      isDark={isDark}
      className={cn(
        "py-20 flex items-center justify-center transition-colors",
        isDark
          ? "bg-gradient-to-b from-[#0A0E27] to-[#1A1F3A]"
          : "bg-gradient-to-b from-white to-gray-50"
      )}
    >
      <div className="container">
        <SectionReveal entrance="fade-scale" className="text-center mb-16">
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
        </SectionReveal>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[1400px] mx-auto px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card
                key={i}
                className={cn(
                  "min-h-[420px] flex flex-col",
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
              onClick={() => dispatch(fetchPublicPlans(i18n.language))}
              className={isDark ? "border-purple-500/30 text-white" : ""}
            >
              {t("landing.pricing.retry")}
            </Button>
          </div>
        ) : activePlans.length === 0 ? (
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
              "grid gap-6 mx-auto px-4",
              activePlans.length >= 5 ? "max-w-[1400px]" : "max-w-7xl",
              plansGridClass(activePlans.length)
            )}
          >
            {activePlans.map((plan, index) => {
              const cycle = getBillingCycle(plan.id);
              const priceOnRequest = isPriceOnRequestPlan(plan);
              const priceValue = getPlanPrice(plan, cycle);
              const isFree = !priceOnRequest && (!priceValue || priceValue <= 0);
              const popular = isStarterPlusPlan(plan.title);
              const description = pickLocalizedPlanDescriptionHtml(
                plan,
                i18n.language
              );
              const features = getPlanFeatures(plan);

              return (
                <SectionRevealItem
                  key={plan.id}
                  entrance={index % 3 === 0 ? "slide-up" : index % 3 === 1 ? "zoom-in" : "fade-up"}
                  index={index}
                  className={cn(
                    "relative",
                    popular ? "border-primary shadow-lg lg:scale-[1.02]" : "border-border"
                  )}
                >
                  {popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        {t("landing.pricing.mostPopular")}
                      </span>
                    </div>
                  )}
                  <Card
                    className={cn(
                      "flex flex-col min-h-[420px]",
                      popular && "ring-2 ring-cyan-400/80 shadow-lg",
                      isDark
                        ? "bg-gradient-to-br from-[#1A1F3A]/80 to-[#2D1B4E]/80 border-purple-500/20 backdrop-blur-sm"
                        : "bg-white border-gray-200"
                    )}
                  >
                    <CardHeader className="text-center pb-4">
                      <CardTitle
                        className={cn(
                          "text-xl lg:text-2xl",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {plan.title}
                      </CardTitle>
                      {description ? (
                        <CardDescription
                          className={cn(
                            "text-sm",
                            isDark ? "text-white/70" : "text-gray-600"
                          )}
                        >
                          <div
                            className="prose prose-sm dark:prose-invert max-w-none text-inherit [&_p]:my-1 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5"
                            dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}
                            dangerouslySetInnerHTML={{ __html: description }}
                          />
                        </CardDescription>
                      ) : null}

                      {!priceOnRequest && (
                      <div
                        className={cn(
                          "mt-4 flex items-center justify-center gap-2 rounded-lg border px-3 py-2",
                          isDark
                            ? "border-purple-500/20 bg-white/5"
                            : "border-gray-200 bg-gray-50"
                        )}
                      >
                        <Label
                          htmlFor={`billing-${plan.id}`}
                          className={cn(
                            "text-xs font-medium cursor-pointer",
                            cycle === "monthly"
                              ? isDark
                                ? "text-cyan-400"
                                : "text-cyan-600"
                              : isDark
                                ? "text-white/60"
                                : "text-gray-500"
                          )}
                        >
                          {t("landing.pricing.monthly")}
                        </Label>
                        <Switch
                          id={`billing-${plan.id}`}
                          checked={cycle === "annual"}
                          onCheckedChange={(checked) =>
                            setBillingCycle(plan.id, checked ? "annual" : "monthly")
                          }
                        />
                        <Label
                          htmlFor={`billing-${plan.id}`}
                          className={cn(
                            "text-xs font-medium cursor-pointer",
                            cycle === "annual"
                              ? isDark
                                ? "text-cyan-400"
                                : "text-cyan-600"
                              : isDark
                                ? "text-white/60"
                                : "text-gray-500"
                          )}
                        >
                          {t("landing.pricing.annual")}
                        </Label>
                      </div>
                      )}

                      <div className="mt-3">
                        {priceOnRequest ? (
                          <span
                            className={cn(
                              "text-xl font-bold",
                              isDark ? "text-white" : "text-gray-900"
                            )}
                          >
                            {t("landing.pricing.priceOnRequest")}
                          </span>
                        ) : (
                          <>
                            <span
                              className={cn(
                                "text-3xl font-bold",
                                isDark ? "text-white" : "text-gray-900"
                              )}
                            >
                              {formatPrice(priceValue, plan.currency)}
                            </span>
                            {!isFree && (
                              <span
                                className={cn(
                                  "text-sm",
                                  isDark ? "text-white/70" : "text-gray-600"
                                )}
                              >
                                {cycle === "annual"
                                  ? t("landing.pricing.perYear")
                                  : t("landing.pricing.perMonth")}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1 flex flex-col pt-0">
                      <ul className="space-y-2 flex-1">
                        {features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-2"
                          >
                            <Check className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
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
                        <Link
                          href={priceOnRequest ? "/contact" : "/auth/register"}
                          className="block"
                        >
                          <Button
                            className={cn(
                              "w-full",
                              popular
                                ? "bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0"
                                : isDark
                                  ? "bg-transparent border-purple-500/30 text-white hover:bg-purple-500/20"
                                  : "bg-transparent border-gray-300 text-gray-900 hover:bg-gray-100"
                            )}
                          >
                            {priceOnRequest
                              ? t("landing.pricing.contactUs")
                              : isFree
                                ? t("landing.pricing.startFree")
                                : t("landing.pricing.startNow")}
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </SectionRevealItem>
              );
            })}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
