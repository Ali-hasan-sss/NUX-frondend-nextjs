"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchUserBalances, payAtRestaurant } from "@/features/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentQrScanner } from "@/components/client/payment-qr-scanner";
import {
  parsePaymentQrPayload,
  balanceRowIdFromUserBalance,
} from "@/lib/paymentQr";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Coffee,
  Loader2,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Step = "scan" | "method" | "points";

export type ClientCheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Restaurant UUID for wallet API (mobile approval flow) */
  onOpenWalletPay: (args: {
    restaurantId: string;
    restaurantName: string;
  }) => void;
};

export function ClientCheckoutDialog({
  open,
  onOpenChange,
  onOpenWalletPay,
}: ClientCheckoutDialogProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { userBalances, error } = useAppSelector((s) => s.clientBalances);

  const [step, setStep] = useState<Step>("scan");
  const [displayName, setDisplayName] = useState("");
  const [loyaltyTargetId, setLoyaltyTargetId] = useState("");
  const [walletRestaurantId, setWalletRestaurantId] = useState("");
  const [isGroupBalance, setIsGroupBalance] = useState(false);
  const [pointsKind, setPointsKind] = useState<"meal" | "drink" | null>(null);
  const [payingPoints, setPayingPoints] = useState(false);

  const reset = useCallback(() => {
    setStep("scan");
    setDisplayName("");
    setLoyaltyTargetId("");
    setWalletRestaurantId("");
    setIsGroupBalance(false);
    setPointsKind(null);
    setPayingPoints(false);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (open) void dispatch(fetchUserBalances());
  }, [open, dispatch]);

  const handleDecoded = async (raw: string) => {
    const parsed = parsePaymentQrPayload(raw);
    const rid = parsed.restaurantId;
    if (!rid) {
      toast.error(t("payment.scanRestaurantInvalid"));
      return;
    }
    try {
      const balances = await dispatch(fetchUserBalances()).unwrap();
      const item = balances.find(
        (b: any) =>
          b.restaurantId === rid ||
          b.targetId === rid ||
          b.restaurant?.id === rid ||
          b.id === rid,
      );
      if (!item) {
        toast.error(t("payment.scanRestaurantNotFound"));
        return;
      }
      const rowId = balanceRowIdFromUserBalance(item) ?? rid;
      const walletId = (item as any).restaurant?.id ?? rid;
      setLoyaltyTargetId(rowId);
      setWalletRestaurantId(walletId);
      const venueName =
        (item as any).restaurant?.name ??
        parsed.restaurantNameEn ??
        t("restaurant.restaurant");
      setDisplayName(venueName);
      setIsGroupBalance(Boolean((item as any).isGroup));
      setStep("method");
      toast.success(t("purchase.restaurantSelected", { name: venueName }));
    } catch {
      toast.error(t("payment.scanRestaurantNotFound"));
    }
  };

  const balanceRow = userBalances.find(
    (b: any) => balanceRowIdFromUserBalance(b) === loyaltyTargetId,
  ) as any;

  const mealPer = balanceRow?.mealPointsPerVoucher ?? null;
  const drinkPer = balanceRow?.drinkPointsPerVoucher ?? null;
  const mealStars = balanceRow?.stars_meal ?? 0;
  const drinkStars = balanceRow?.stars_drink ?? 0;

  const pointsPerVoucher = pointsKind === "meal" ? mealPer : drinkPer;
  const starsAvailable = pointsKind === "meal" ? mealStars : drinkStars;

  const canPayOneVoucher =
    pointsPerVoucher != null &&
    pointsPerVoucher > 0 &&
    starsAvailable >= pointsPerVoucher;

  const handlePayVoucher = async () => {
    if (
      !loyaltyTargetId ||
      !pointsKind ||
      !pointsPerVoucher ||
      !canPayOneVoucher
    )
      return;
    setPayingPoints(true);
    try {
      const currencyType =
        pointsKind === "meal"
          ? ("stars_meal" as const)
          : ("stars_drink" as const);
      const result = await dispatch(
        payAtRestaurant({
          targetId: loyaltyTargetId,
          currencyType,
          amount: pointsPerVoucher,
        }),
      );
      if (payAtRestaurant.fulfilled.match(result)) {
        await dispatch(fetchUserBalances());
        toast.success(t("checkout.voucherPaidSuccess"));
        onOpenChange(false);
      } else if (payAtRestaurant.rejected.match(result)) {
        toast.error(
          typeof result.payload === "string"
            ? result.payload
            : t("common.error"),
        );
      }
    } finally {
      setPayingPoints(false);
    }
  };

  const openWallet = () => {
    if (!walletRestaurantId) return;
    if (isGroupBalance) {
      toast.error(t("wallet.groupWalletHint"));
      return;
    }
    onOpenWalletPay({
      restaurantId: walletRestaurantId,
      restaurantName: displayName,
    });
    onOpenChange(false);
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md max-h-[90vh] overflow-y-auto",
          isDark ? "bg-[rgba(26,31,58,0.98)] border-white/10" : "",
        )}
        style={{ borderColor: colors.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: colors.text }}>
            {step === "scan" && t("payment.scanRestaurantQr")}
            {step === "method" && t("checkout.choosePayment")}
            {step === "points" &&
              (pointsKind === "meal"
                ? t("checkout.payOneMealVoucher")
                : t("checkout.payOneDrinkVoucher"))}
          </DialogTitle>
        </DialogHeader>

        {error.payment && step === "points" && (
          <Alert variant="destructive" className="bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.payment}</AlertDescription>
          </Alert>
        )}

        {step === "scan" && (
          <div className="space-y-4">
            <PaymentQrScanner
              onDecoded={(r) => void handleDecoded(r)}
              disabled={false}
            />
          </div>
        )}

        {step === "method" && (
          <div className="space-y-4">
            <p className="text-sm font-medium" style={{ color: colors.text }}>
              {displayName}
            </p>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setPointsKind("meal");
                  setStep("points");
                }}
                className="rounded-xl p-4 flex items-center gap-3 text-left border transition-colors"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${colors.primary}22` }}
                >
                  <UtensilsCrossed
                    className="h-6 w-6"
                    style={{ color: colors.primary }}
                  />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: colors.text }}>
                    {t("payment.mealPoints")}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {t("checkout.oneVoucherSubtitle")}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPointsKind("drink");
                  setStep("points");
                }}
                className="rounded-xl p-4 flex items-center gap-3 text-left border transition-colors"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${colors.secondary}22` }}
                >
                  <Coffee
                    className="h-6 w-6"
                    style={{ color: colors.secondary }}
                  />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: colors.text }}>
                    {t("payment.drinkPoints")}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {t("checkout.oneVoucherSubtitle")}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={openWallet}
                disabled={isGroupBalance}
                className={cn(
                  "rounded-xl p-4 flex items-center gap-3 text-left border transition-colors",
                  isGroupBalance && "opacity-50 cursor-not-allowed",
                )}
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${colors.success}22` }}
                >
                  <Wallet
                    className="h-6 w-6"
                    style={{ color: colors.success }}
                  />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: colors.text }}>
                    {t("checkout.walletEur")}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {t("checkout.walletMobileConfirmHint")}
                  </p>
                </div>
              </button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="w-full gap-2"
              onClick={() => setStep("scan")}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("checkout.scanAgain")}
            </Button>
          </div>
        )}

        {step === "points" && pointsKind && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {displayName}
            </p>
            {mealPer == null || mealPer <= 0 ? (
              pointsKind === "meal" ? (
                <p className="text-sm" style={{ color: colors.error }}>
                  {t("checkout.voucherNotConfigured")}
                </p>
              ) : null
            ) : null}
            {drinkPer == null || drinkPer <= 0 ? (
              pointsKind === "drink" ? (
                <p className="text-sm" style={{ color: colors.error }}>
                  {t("checkout.voucherNotConfigured")}
                </p>
              ) : null
            ) : null}
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <p
                className="text-sm font-medium mb-1"
                style={{ color: colors.text }}
              >
                {t("payment.currentBalance")}
              </p>
              <p
                className="text-lg font-bold tabular-nums"
                style={{ color: colors.text }}
              >
                {pointsKind === "meal" ? mealStars : drinkStars}{" "}
                {pointsKind === "meal"
                  ? t("payment.mealPoints")
                  : t("payment.drinkPoints")}
              </p>
              {pointsPerVoucher != null && pointsPerVoucher > 0 && (
                <p
                  className="text-sm mt-2"
                  style={{ color: colors.textSecondary }}
                >
                  {t("payment.oneVoucher", { points: pointsPerVoucher })}
                </p>
              )}
              {!canPayOneVoucher &&
                pointsPerVoucher != null &&
                pointsPerVoucher > 0 && (
                  <p className="text-sm mt-2" style={{ color: colors.error }}>
                    {t("payment.insufficientBalance")}
                  </p>
                )}
            </div>
            <Button
              type="button"
              className="w-full"
              style={{ backgroundColor: colors.primary }}
              disabled={!canPayOneVoucher || payingPoints}
              onClick={() => void handlePayVoucher()}
            >
              {payingPoints ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("payment.payNow")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => setStep("method")}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("checkout.backToMethods")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
