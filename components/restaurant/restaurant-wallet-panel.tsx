"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { walletService } from "@/features/client";

interface RestaurantWalletPanelProps {
  showRefresh?: boolean;
}

export function RestaurantWalletPanel({ showRefresh = false }: RestaurantWalletPanelProps) {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<{ balance: string; currency: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(() => {
    setLoading(true);
    setError(null);
    walletService
      .getRestaurantWalletBalance()
      .then(setBalance)
      .catch(() => setError(t("dashboard.wallet.loadError")))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <Card className="border-emerald-500/25 bg-emerald-500/5">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-emerald-600" />
            {t("dashboard.wallet.title")}
          </CardTitle>
          <CardDescription>{t("dashboard.wallet.description")}</CardDescription>
        </div>
        {showRefresh && (
          <Button type="button" variant="outline" size="sm" disabled={loading} onClick={fetchBalance}>
            {loading ? t("common.loading") : t("dashboard.wallet.refresh")}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading && !balance ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <p className="text-2xl font-bold tabular-nums">
            {balance?.balance ?? "—"} {balance?.currency ?? ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
