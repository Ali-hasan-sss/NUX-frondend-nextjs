"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  payRestaurantWithWallet,
  fetchWalletBalance,
  fetchUserBalances,
} from "@/features/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getRestaurants } from "@/features/public/restaurants/publicRestaurantsService";
import type { PublicRestaurant } from "@/features/public/restaurants/publicRestaurantsTypes";

interface WalletPayRestaurantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, restaurant picker is hidden and this id is used */
  fixedRestaurantId?: string;
  fixedRestaurantName?: string;
}

export function WalletPayRestaurantDialog({
  open,
  onOpenChange,
  fixedRestaurantId,
  fixedRestaurantName,
}: WalletPayRestaurantDialogProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { loading, error, balance } = useAppSelector((s) => s.clientWallet);
  const [amount, setAmount] = useState("");
  const [restaurants, setRestaurants] = useState<PublicRestaurant[]>([]);
  const [selectedId, setSelectedId] = useState(fixedRestaurantId || "");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (open && !fixedRestaurantId) {
      setLoadingList(true);
      getRestaurants({ limit: 80, search: search || undefined })
        .then((res) => setRestaurants(res.restaurants || []))
        .catch(() => setRestaurants([]))
        .finally(() => setLoadingList(false));
    }
  }, [open, fixedRestaurantId, search]);

  useEffect(() => {
    if (open) {
      setAmount("");
      if (fixedRestaurantId) setSelectedId(fixedRestaurantId);
    }
  }, [open, fixedRestaurantId]);

  const handlePay = async () => {
    const restaurantId = fixedRestaurantId || selectedId;
    const n = parseFloat(amount);
    if (!restaurantId) {
      toast.error(t("wallet.selectRestaurant"));
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      toast.error(t("wallet.invalidAmount"));
      return;
    }
    const idem =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? `web_${crypto.randomUUID()}`
        : `web_${Date.now()}`;
    const result = await dispatch(
      payRestaurantWithWallet({
        restaurantId,
        amount: n,
        currency: balance?.currency || "EUR",
        idempotencyKey: idem,
      })
    );
    if (payRestaurantWithWallet.fulfilled.match(result)) {
      toast.success(t("wallet.paySuccess"));
      await dispatch(fetchWalletBalance());
      await dispatch(fetchUserBalances());
      setAmount("");
      onOpenChange(false);
    }
  };

  if (!mounted) return null;

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md max-h-[85vh] overflow-y-auto",
          isDark ? "bg-[rgba(26,31,58,0.98)] border-white/10" : ""
        )}
        style={{ borderColor: colors.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: colors.text }}>{t("wallet.payRestaurant")}</DialogTitle>
        </DialogHeader>

        {error.pay && (
          <Alert variant="destructive" className="bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.pay}</AlertDescription>
          </Alert>
        )}

        {fixedRestaurantId ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {fixedRestaurantName || t("restaurant.restaurant")}
          </p>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder={t("wallet.searchRestaurant")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div
              className="max-h-40 overflow-y-auto rounded-md border p-1 space-y-1"
              style={{ borderColor: colors.border }}
            >
              {loadingList ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : (
                filtered.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm",
                      selectedId === r.id ? "font-semibold" : ""
                    )}
                    style={{
                      backgroundColor:
                        selectedId === r.id ? `${colors.primary}30` : "transparent",
                      color: colors.text,
                    }}
                  >
                    {r.name}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium" style={{ color: colors.text }}>
            {t("wallet.amount")} ({balance?.currency || "EUR"})
          </label>
          <Input
            type="number"
            min={0.01}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
          {balance && (
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              {t("wallet.available")}: {balance.balance} {balance.currency}
            </p>
          )}
        </div>

        <Button
          type="button"
          onClick={handlePay}
          disabled={loading.pay}
          className="w-full"
          style={{ backgroundColor: colors.primary }}
        >
          {loading.pay ? <Loader2 className="h-4 w-4 animate-spin" /> : t("payment.payNow")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
