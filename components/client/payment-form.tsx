"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { payAtRestaurant, fetchUserBalances } from "@/features/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Coffee,
  UtensilsCrossed,
  Wallet,
  X,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPaymentType?: "drink" | "meal" | "wallet";
  restaurantId?: string;
  onPaymentSuccess?: (result: any) => void;
}

export function PaymentForm({
  open,
  onOpenChange,
  initialPaymentType = "wallet",
  restaurantId,
  onPaymentSuccess,
}: PaymentFormProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { userBalances, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );
  const [selectedPaymentType, setSelectedPaymentType] = useState<
    "drink" | "meal" | "wallet"
  >(initialPaymentType);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedRestaurantBalance = userBalances.find((b: any) => {
    const id = b.targetId || b.restaurantId;
    return id === restaurantId;
  }) as any;
  const mealPerVoucher = selectedRestaurantBalance?.mealPointsPerVoucher ?? null;
  const drinkPerVoucher = selectedRestaurantBalance?.drinkPointsPerVoucher ?? null;

  const isVoucherPayment =
    selectedPaymentType === "meal" || selectedPaymentType === "drink";
  const pointsPerVoucher =
    selectedPaymentType === "meal" ? mealPerVoucher : drinkPerVoucher;
  const useVoucherAmount =
    isVoucherPayment && pointsPerVoucher != null && pointsPerVoucher > 0;

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAmount("");
      setSelectedPaymentType(initialPaymentType);
      setIsProcessing(false);
    }
  }, [open, initialPaymentType]);

  // Update payment type when initialPaymentType changes
  useEffect(() => {
    if (initialPaymentType) {
      setSelectedPaymentType(initialPaymentType);
    }
  }, [initialPaymentType]);

  // When switching to meal/drink with voucher: set amount to one voucher
  useEffect(() => {
    if (useVoucherAmount && pointsPerVoucher) {
      setAmount(String(pointsPerVoucher));
    } else if (selectedPaymentType === "wallet") {
      setAmount("");
    }
  }, [selectedPaymentType, useVoucherAmount, pointsPerVoucher]);

  if (!mounted) {
    return null;
  }

  // Calculate balances for selected restaurant
  const currentBalance = {
    walletBalance: selectedRestaurantBalance?.balance || 0,
    mealPoints: selectedRestaurantBalance?.stars_meal || 0,
    drinkPoints: selectedRestaurantBalance?.stars_drink || 0,
  };

  // Payment options
  const paymentOptions = [
    {
      type: "wallet" as const,
      label: t("payment.walletBalance"),
      icon: Wallet,
      balance: currentBalance.walletBalance,
      color: colors.success,
      prefix: "$",
    },
    {
      type: "drink" as const,
      label: t("payment.drinkPoints"),
      icon: Coffee,
      balance: currentBalance.drinkPoints,
      color: colors.secondary,
      prefix: "",
    },
    {
      type: "meal" as const,
      label: t("payment.mealPoints"),
      icon: UtensilsCrossed,
      balance: currentBalance.mealPoints,
      color: colors.primary,
      prefix: "",
    },
  ];

  const selectedOption = paymentOptions.find(
    (option) => option.type === selectedPaymentType
  );
  const numericAmount = parseFloat(amount) || 0;
  const hasInsufficientBalance = numericAmount > (selectedOption?.balance || 0);

  const handlePayNow = async () => {
    if (!restaurantId) return;
    const payAmount = useVoucherAmount ? (pointsPerVoucher ?? 0) : numericAmount;
    if (!payAmount || payAmount <= 0) return;
    if (payAmount > (selectedOption?.balance || 0)) return;

    setIsProcessing(true);
    try {
      const currencyTypeMap = {
        wallet: "balance" as const,
        meal: "stars_meal" as const,
        drink: "stars_drink" as const,
      };
      const result = await dispatch(
        payAtRestaurant({
          targetId: restaurantId,
          currencyType: currencyTypeMap[selectedPaymentType],
          amount: payAmount,
        })
      );
      if (payAtRestaurant.fulfilled.match(result)) {
        await dispatch(fetchUserBalances());
        onPaymentSuccess?.(result.payload);
        setAmount("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const canPay =
    !isProcessing &&
    (useVoucherAmount
      ? (pointsPerVoucher ?? 0) > 0 &&
        (pointsPerVoucher ?? 0) <= (selectedOption?.balance ?? 0)
      : numericAmount > 0 && !hasInsufficientBalance);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md max-h-[90vh] overflow-y-auto p-0 transition-colors",
          isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
        )}
        style={{
          borderColor: colors.border,
        }}
      >
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
            <div
              className={cn(
                "backdrop-blur-md rounded-2xl p-8 flex flex-col items-center gap-4",
                isDark ? "bg-white/10" : "bg-gray-900/10"
              )}
            >
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: colors.primary }}
              />
              <p className="font-medium" style={{ color: colors.text }}>
                {t("payment.processingPayment")}
              </p>
            </div>
          </div>
        )}

        <DialogHeader
          className={cn("border-b p-5")}
          style={{ borderBottomColor: colors.border }}
        >
          <div className="flex items-center justify-between">
            <DialogTitle
              className="text-lg font-bold"
              style={{ color: colors.text }}
            >
              {t("payment.selectPaymentMethod")}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
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

        <div className="p-5 space-y-6">
          {error.payment && (
            <Alert
              variant="destructive"
              className="bg-red-500/20 border-red-500 text-red-500"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.payment}</AlertDescription>
            </Alert>
          )}

          {/* Current Balance Section */}
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: colors.text }}
            >
              {t("payment.currentBalance")} -{" "}
              {selectedRestaurantBalance?.restaurant?.name ||
                (selectedRestaurantBalance as any)?.name ||
                t("restaurant.restaurant")}
            </p>
            <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>
              {t("payment.selectedMethod")}: {selectedOption?.label}
            </p>
          </div>

          {/* Payment Options */}
          <div className="space-y-3">
            {paymentOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = selectedPaymentType === option.type;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() =>
                    !isProcessing && setSelectedPaymentType(option.type)
                  }
                  disabled={isProcessing}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                    isSelected
                      ? `border-[${option.color}] bg-[${option.color}]/20`
                      : isDark
                      ? "border-white/15 bg-white/5 hover:bg-white/10"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    borderColor: isSelected ? option.color : colors.border,
                    backgroundColor: isSelected
                      ? `${option.color}20`
                      : isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <IconComponent
                    className="h-6 w-6"
                    style={{ color: option.color }}
                  />
                  <div className="flex-1 text-left">
                    <p className="font-medium" style={{ color: colors.text }}>
                      {option.label}
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: option.color }}
                    >
                      {option.prefix}
                      {option.balance}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Payment Amount */}
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: colors.text }}
            >
              {t("payment.paymentAmount")}
            </p>
            {useVoucherAmount ? (
              <div
                className={cn(
                  "w-full p-4 rounded-xl border",
                  isDark
                    ? "bg-white/10 border-white/15"
                    : "bg-white border-gray-200"
                )}
              >
                <p className="font-semibold" style={{ color: colors.text }}>
                  {t("payment.oneVoucher", { points: pointsPerVoucher })}
                </p>
              </div>
            ) : (
              <>
                <Input
                  type="number"
                  step={selectedPaymentType === "wallet" ? "0.01" : "1"}
                  min="0"
                  placeholder={
                    selectedPaymentType === "wallet"
                      ? "0.00"
                      : t("payment.enterPoints")
                  }
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isProcessing}
                  className={cn(
                    "w-full p-4 rounded-xl border backdrop-blur-sm",
                    isDark
                      ? "bg-white/10 border-white/15 text-white placeholder:text-white/50"
                      : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                    hasInsufficientBalance && "border-red-500",
                    isProcessing && "opacity-50 cursor-not-allowed"
                  )}
                />
                {hasInsufficientBalance && (
                  <p className="text-sm mt-2" style={{ color: colors.error }}>
                    {t("payment.insufficientBalance")}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Pay Now Button */}
          <div className="mt-6">
            <Button
              onClick={handlePayNow}
              disabled={!canPay}
              className={cn(
                "w-full h-14 rounded-full font-semibold text-base gap-2 transition-all",
                !canPay && "opacity-50 cursor-not-allowed"
              )}
              style={{
                background: canPay
                  ? `linear-gradient(to right, ${colors.primary}, ${colors.accent || colors.primary})`
                  : colors.surface,
                color: canPay ? "white" : colors.textSecondary,
                borderColor: colors.border,
              }}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
              {t("payment.payNow")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
