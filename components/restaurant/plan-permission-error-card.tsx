"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const PLAN_PERMISSION_CODES = ["PLAN_PERMISSION_REQUIRED", "NO_ACTIVE_SUBSCRIPTION"];

export interface PlanPermissionErrorCardProps {
  error: string;
  errorCode?: string | null;
  upgradePlanHintKey: string;
  upgradePlanHintFallback: string;
  goToSubscriptionKey?: string;
  goToSubscriptionFallback?: string;
}

export function PlanPermissionErrorCard({
  error,
  errorCode,
  upgradePlanHintKey,
  upgradePlanHintFallback,
  goToSubscriptionKey = "dashboard.orders.goToSubscription",
  goToSubscriptionFallback = "Go to Subscription",
}: PlanPermissionErrorCardProps) {
  const { t } = useTranslation();
  const planPermissionError =
    !!error && !!errorCode && PLAN_PERMISSION_CODES.includes(errorCode);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-destructive">
            {planPermissionError ? (
              <Lock className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <p>{error}</p>
          </div>
          {planPermissionError && (
            <p className="text-sm text-muted-foreground">
              {t(upgradePlanHintKey) || upgradePlanHintFallback}
            </p>
          )}
          {planPermissionError && (
            <Button asChild variant="default">
              <Link href="/dashboard/subscription">
                {t(goToSubscriptionKey) || goToSubscriptionFallback}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
