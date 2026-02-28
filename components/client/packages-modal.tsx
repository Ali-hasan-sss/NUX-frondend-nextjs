"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPublicPackages, fetchUserBalances } from "@/features/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, X, Loader2, AlertCircle, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";

interface PackagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
}

export function PackagesModal({
  open,
  onOpenChange,
  restaurantId,
}: PackagesModalProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { packages, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );

  useEffect(() => {
    if (open && restaurantId) {
      dispatch(fetchPublicPackages(restaurantId));
    }
  }, [open, restaurantId, dispatch]);

  const handlePackageSelect = (selectedPackage: any) => {
    // TODO: Implement payment integration (Stripe, PayPal, etc.)
    console.log("Selected package:", selectedPackage);
    alert(t("packages.comingSoon"));
  };

  const handleRetry = () => {
    if (restaurantId) {
      dispatch(fetchPublicPackages(restaurantId));
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md max-h-[90vh] overflow-y-auto p-0 transition-colors",
          isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
        )}
        hideCloseButton
        style={{
          borderColor: colors.border,
        }}
      >
        <DialogHeader
          className={cn("border-b p-5")}
          style={{ borderBottomColor: colors.border }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" style={{ color: colors.primary }} />
              <DialogTitle
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                {t("packages.title")}
              </DialogTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading.packages}
              className={cn(
                "p-1 rounded-lg transition-colors disabled:opacity-50",
                isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              )}
              style={{ color: colors.text }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-5">
          {loading.packages ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: colors.primary }}
              />
              <p className="mt-4 text-sm" style={{ color: colors.textSecondary }}>
                {t("common.loading")}...
              </p>
            </div>
          ) : error.packages ? (
            <div className="space-y-4">
              <Alert
                variant="destructive"
                className="bg-red-500/20 border-red-500 text-red-500"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.packages}</AlertDescription>
              </Alert>
              <Button
                onClick={handleRetry}
                className="w-full"
                style={{
                  backgroundColor: colors.error,
                  color: "white",
                }}
              >
                {t("home.retry")}
              </Button>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <Package
                className="h-12 w-12 mx-auto mb-4"
                style={{ color: colors.textSecondary }}
              />
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {t("packages.noPackages")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg: any) => (
                <div
                  key={pkg.id}
                  className={cn(
                    "rounded-xl p-5 border transition-all",
                    isDark
                      ? "border-white/15 bg-white/5 hover:bg-white/10"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  )}
                  style={{
                    borderColor: colors.border,
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                        {pkg.title}
                      </h3>
                      {pkg.description && (
                        <p
                          className="text-sm mt-1"
                          style={{ color: colors.textSecondary }}
                        >
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl" style={{ color: colors.primary }}>
                        {pkg.price} {pkg.currency}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {pkg.balance > 0 && (
                      <div
                        className="rounded-lg p-2 text-center"
                        style={{ backgroundColor: `${colors.success}20` }}
                      >
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          {t("payment.walletBalance")}
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: colors.success }}
                        >
                          ${pkg.balance}
                        </p>
                      </div>
                    )}
                    {pkg.stars_meal > 0 && (
                      <div
                        className="rounded-lg p-2 text-center"
                        style={{ backgroundColor: `${colors.primary}20` }}
                      >
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          {t("payment.mealPoints")}
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: colors.primary }}
                        >
                          {pkg.stars_meal}
                        </p>
                      </div>
                    )}
                    {pkg.stars_drink > 0 && (
                      <div
                        className="rounded-lg p-2 text-center"
                        style={{ backgroundColor: `${colors.secondary}20` }}
                      >
                        <p className="text-xs" style={{ color: colors.textSecondary }}>
                          {t("payment.drinkPoints")}
                        </p>
                        <p
                          className="font-bold text-sm"
                          style={{ color: colors.secondary }}
                        >
                          {pkg.stars_drink}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => handlePackageSelect(pkg)}
                    className="w-full"
                    style={{
                      backgroundColor: colors.primary,
                      color: "white",
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t("packages.purchase")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

