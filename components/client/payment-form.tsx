"use client";

import { useState, useEffect, useRef } from "react";
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
  ArrowRight,
  Loader2,
  AlertCircle,
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
  const [slidePosition, setSlidePosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAmount("");
      setSelectedPaymentType(initialPaymentType);
      setIsProcessing(false);
      setSlidePosition(0);
      setIsDragging(false);
    }
  }, [open, initialPaymentType]);

  // Update payment type when initialPaymentType changes
  useEffect(() => {
    if (initialPaymentType) {
      setSelectedPaymentType(initialPaymentType);
    }
  }, [initialPaymentType]);

  // Mouse drag handlers
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth - 60; // 60px for button width + padding
    const newPosition = Math.max(
      0,
      Math.min(e.clientX - startXRef.current, containerWidth)
    );
    setSlidePosition(newPosition);

    // If dragged more than 80% of the way, trigger payment
    if (newPosition >= containerWidth * 0.8) {
      handleSlideConfirm();
      setIsDragging(false);
      setSlidePosition(0);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const containerWidth = containerRef.current?.offsetWidth || 0;
    const threshold = (containerWidth - 60) * 0.8;

    if (slidePosition < threshold) {
      // Snap back to start
      setSlidePosition(0);
    }
    setIsDragging(false);
  };

  // Touch drag handlers
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth - 60;
    const newPosition = Math.max(
      0,
      Math.min(e.touches[0].clientX - startXRef.current, containerWidth)
    );
    setSlidePosition(newPosition);

    if (newPosition >= containerWidth * 0.8) {
      handleSlideConfirm();
      setIsDragging(false);
      setSlidePosition(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const containerWidth = containerRef.current?.offsetWidth || 0;
    const threshold = (containerWidth - 60) * 0.8;

    if (slidePosition < threshold) {
      setSlidePosition(0);
    }
    setIsDragging(false);
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
      const mouseUpHandler = () => handleMouseUp();

      window.addEventListener("mousemove", mouseMoveHandler);
      window.addEventListener("mouseup", mouseUpHandler);
      return () => {
        window.removeEventListener("mousemove", mouseMoveHandler);
        window.removeEventListener("mouseup", mouseUpHandler);
      };
    }
  }, [isDragging, slidePosition]);

  // Touch event listeners
  useEffect(() => {
    if (isDragging) {
      const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
      const touchEndHandler = () => handleTouchEnd();

      window.addEventListener("touchmove", touchMoveHandler as any, {
        passive: false,
      });
      window.addEventListener("touchend", touchEndHandler);
      return () => {
        window.removeEventListener("touchmove", touchMoveHandler as any);
        window.removeEventListener("touchend", touchEndHandler);
      };
    }
  }, [isDragging, slidePosition]);

  if (!mounted) {
    return null;
  }

  // Get selected restaurant balance
  const selectedRestaurantBalance = userBalances.find((balance: any) => {
    const id = balance.targetId || balance.restaurantId;
    return id === restaurantId;
  });

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

  const handleSlideConfirm = async () => {
    if (!restaurantId) {
      return;
    }

    if (!amount || numericAmount <= 0) {
      return;
    }

    if (hasInsufficientBalance) {
      return;
    }

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
          amount: numericAmount,
        })
      );

      if (payAtRestaurant.fulfilled.match(result)) {
        // Refresh balances
        await dispatch(fetchUserBalances());
        onPaymentSuccess?.(result.payload);
        setAmount("");
        setSlidePosition(0);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      isProcessing ||
      !amount ||
      numericAmount <= 0 ||
      hasInsufficientBalance
    ) {
      return;
    }
    setIsDragging(true);
    startXRef.current = e.clientX - slidePosition;
    e.preventDefault();
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (
      isProcessing ||
      !amount ||
      numericAmount <= 0 ||
      hasInsufficientBalance
    ) {
      return;
    }
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX - slidePosition;
  };

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
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
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
          </div>

          {/* Slide to Pay Button */}
          <div className="mt-6">
            <div
              ref={containerRef}
              className={cn(
                "relative h-14 rounded-full flex items-center justify-center border overflow-hidden",
                isDark
                  ? "bg-white/10 border-white/15"
                  : "bg-gray-100 border-gray-200"
              )}
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              {/* Arrow hints in background */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 pointer-events-none">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ArrowRight
                    key={index}
                    className="h-4 w-4"
                    style={{ color: colors.textSecondary }}
                  />
                ))}
              </div>

              {/* Draggable button */}
              <div
                ref={slideRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                className={cn(
                  "absolute left-1 h-12 w-12 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-all z-10",
                  isProcessing && "opacity-50 cursor-not-allowed"
                )}
                style={{
                  transform: `translateX(${slidePosition}px)`,
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                  userSelect: "none",
                  touchAction: "none",
                }}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <ArrowRight className="h-6 w-6 text-white" />
                )}
              </div>

              {/* Text overlay */}
              <span
                className="text-sm font-medium pointer-events-none z-0"
                style={{ color: colors.textSecondary }}
              >
                {t("payment.slideToConfirm")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
