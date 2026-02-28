"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { giftBalance, fetchUserBalances } from "@/features/client";
import { balancesService } from "@/features/client/balances/balancesService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Coffee,
  UtensilsCrossed,
  Wallet,
  X,
  Camera,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { QRScanner } from "./qr-scanner";
import { Html5Qrcode } from "html5-qrcode";
import { useRef } from "react";

interface GiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
}

export function GiftModal({ open, onOpenChange, targetId }: GiftModalProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { userBalances, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );
  const [selectedGiftType, setSelectedGiftType] = useState<
    "wallet" | "drink" | "meal"
  >("wallet");
  const [giftAmount, setGiftAmount] = useState("");
  const [scannedQRCode, setScannedQRCode] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [amountError, setAmountError] = useState<string>("");
  const [isScanningImage, setIsScanningImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get selected restaurant balance
  const selectedRestaurantBalance = userBalances.find((balance: any) => {
    const id = balance.targetId || balance.restaurantId;
    return id === targetId;
  });

  // Calculate balances for selected restaurant
  const currentBalance = {
    walletBalance: selectedRestaurantBalance?.balance || 0,
    mealPoints: selectedRestaurantBalance?.stars_meal || 0,
    drinkPoints: selectedRestaurantBalance?.stars_drink || 0,
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setGiftAmount("");
      setSelectedGiftType("wallet");
      setScannedQRCode("");
      setAmountError("");
      setShowQRScanner(false);
    }
  }, [open]);

  // Validate amount against balance
  useEffect(() => {
    if (!giftAmount || giftAmount.trim() === "") {
      setAmountError("");
      return;
    }

    const amount = parseFloat(giftAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setAmountError("");
      return;
    }

    let availableBalance = 0;
    let balanceType = "";

    switch (selectedGiftType) {
      case "wallet":
        availableBalance = currentBalance.walletBalance;
        balanceType = "$";
        break;
      case "meal":
        availableBalance = currentBalance.mealPoints;
        balanceType = t("purchase.mealPoints");
        break;
      case "drink":
        availableBalance = currentBalance.drinkPoints;
        balanceType = t("purchase.drinkPoints");
        break;
    }

    if (amount > availableBalance) {
      setAmountError(
        `${t("payment.insufficientBalance")}. ${t(
          "payment.currentBalance"
        )}: ${availableBalance} ${balanceType}`
      );
    } else {
      setAmountError("");
    }
  }, [giftAmount, selectedGiftType, currentBalance, t]);

  const showInvalidCodeMessage = (reason?: string) => {
    if (reason === "self") {
      alert(t("gift.cannotGiftSelf"));
    } else if (reason === "restaurant_code") {
      alert(t("gift.invalidCodeScanFriend"));
    } else {
      alert(t("gift.recipientNotFound"));
    }
  };

  const handleScanSuccess = async (result: string) => {
    const qrCode = typeof result === "string" ? result.trim() : "";
    if (!qrCode) return;
    try {
      const { valid, reason } = await balancesService.validateGiftRecipient(qrCode);
      if (valid) {
        setScannedQRCode(qrCode);
        setShowQRScanner(false);
      } else {
        showInvalidCodeMessage(reason);
      }
    } catch {
      showInvalidCodeMessage("not_found");
    }
  };

  const handleSendGift = async () => {
    if (!giftAmount || parseFloat(giftAmount) <= 0) {
      return;
    }

    if (!scannedQRCode) {
      setShowQRScanner(true);
      return;
    }

    if (amountError) {
      return;
    }

    const currencyTypeMap = {
      wallet: "balance" as const,
      meal: "stars_meal" as const,
      drink: "stars_drink" as const,
    };

    try {
      const result = await dispatch(
        giftBalance({
          targetId,
          qrCode: scannedQRCode,
          currencyType: currencyTypeMap[selectedGiftType],
          amount: parseFloat(giftAmount),
        })
      );

      if (giftBalance.fulfilled.match(result)) {
        await dispatch(fetchUserBalances());
        setGiftAmount("");
        setScannedQRCode("");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Gift failed:", error);
    }
  };

  const handleScanForGift = () => {
    if (!giftAmount || parseFloat(giftAmount) <= 0) {
      return;
    }

    const amount = parseFloat(giftAmount);
    let availableBalance = 0;

    switch (selectedGiftType) {
      case "wallet":
        availableBalance = currentBalance.walletBalance;
        break;
      case "meal":
        availableBalance = currentBalance.mealPoints;
        break;
      case "drink":
        availableBalance = currentBalance.drinkPoints;
        break;
    }

    if (amount > availableBalance) {
      return;
    }

    setShowQRScanner(true);
  };

  const handlePickImageFromGallery = async () => {
    if (!giftAmount || parseFloat(giftAmount) <= 0) {
      return;
    }

    const amount = parseFloat(giftAmount);
    let availableBalance = 0;

    switch (selectedGiftType) {
      case "wallet":
        availableBalance = currentBalance.walletBalance;
        break;
      case "meal":
        availableBalance = currentBalance.mealPoints;
        break;
      case "drink":
        availableBalance = currentBalance.drinkPoints;
        break;
    }

    if (amount > availableBalance) {
      return;
    }

    // Trigger file input
    fileInputRef.current?.click();
  };

  const handleImageFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert(t("gift.invalidImageType"));
      return;
    }

    setIsScanningImage(true);

    try {
      // Use Html5Qrcode static method to scan QR code from image file
      // @ts-ignore - scanFile exists but TypeScript types may not include it
      const qrCode = await Html5Qrcode.scanFile(file, false);

      if (qrCode) {
        const { valid, reason } = await balancesService.validateGiftRecipient(qrCode);
        if (valid) {
          setScannedQRCode(qrCode);
        } else {
          showInvalidCodeMessage(reason);
        }
      } else {
        alert(t("gift.noQRCodeFound"));
      }
    } catch (error: any) {
      console.error("Error scanning QR code from image:", error);
      // Check if it's a "No QR code found" error
      if (
        error?.message?.includes("No QR code found") ||
        error?.name === "NotFoundException" ||
        error?.message?.includes("QR code parse error") ||
        error?.message?.includes("No QR code detected")
      ) {
        alert(t("gift.noQRCodeFound"));
      } else {
        alert(t("gift.scanError") || "Failed to scan QR code from image");
      }
    } finally {
      setIsScanningImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!mounted) {
    return null;
  }

  const giftOptions = [
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

  const selectedOption = giftOptions.find(
    (option) => option.type === selectedGiftType
  );
  const numericAmount = parseFloat(giftAmount) || 0;
  const hasInsufficientBalance = numericAmount > (selectedOption?.balance || 0);
  const canSendGift =
    giftAmount && numericAmount > 0 && !hasInsufficientBalance && scannedQRCode;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideCloseButton
          className={cn(
            "w-[calc(100vw-2rem)] max-w-md max-h-[90vh] overflow-y-auto p-0 transition-colors",
            isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
          )}
          style={{
            borderColor: colors.border,
          }}
        >
          <DialogHeader
            className={cn("border-b p-5")}
            style={{ borderBottomColor: colors.border }}
          >
            <div className="flex items-center justify-between">
              <DialogTitle
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                {t("purchase.gift")}
              </DialogTitle>
              <button
                onClick={() => onOpenChange(false)}
                disabled={loading.gift}
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
            {error.gift && (
              <Alert
                variant="destructive"
                className="bg-red-500/20 border-red-500 text-red-500"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error.gift}</AlertDescription>
              </Alert>
            )}

            {/* Current Balance Section */}
            <div>
              <p
                className="text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                {t("payment.currentBalance")}
              </p>
            </div>

            {/* Gift Options */}
            <div className="space-y-3">
              {giftOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedGiftType === option.type;

                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() =>
                      !loading.gift && setSelectedGiftType(option.type)
                    }
                    disabled={loading.gift}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border transition-all",
                      isSelected
                        ? `border-[${option.color}] bg-[${option.color}]/20`
                        : isDark
                        ? "border-white/15 bg-white/5 hover:bg-white/10"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100",
                      loading.gift && "opacity-50 cursor-not-allowed"
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

            {/* Gift Amount */}
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
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                disabled={loading.gift}
                className={cn(
                  "w-full p-4 rounded-xl border backdrop-blur-sm",
                  isDark
                    ? "bg-white/10 border-white/15 text-white placeholder:text-white/50"
                    : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
                  hasInsufficientBalance && "border-red-500",
                  loading.gift && "opacity-50 cursor-not-allowed"
                )}
              />
              {amountError && (
                <p className="text-sm mt-2" style={{ color: colors.error }}>
                  {amountError}
                </p>
              )}
            </div>

            {/* QR Code Section */}
            {giftAmount && numericAmount > 0 && !hasInsufficientBalance && (
              <div className="space-y-3">
                {scannedQRCode ? (
                  <>
                    <div
                      className="p-4 rounded-xl border"
                      style={{
                        backgroundColor: `${colors.success}20`,
                        borderColor: colors.success,
                      }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.success }}
                      >
                        {t("gift.qrScanned")}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        {scannedQRCode.substring(0, 20)}...
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => setScannedQRCode("")}
                        disabled={loading.gift}
                        variant="outline"
                        className="flex-1 w-full sm:w-auto"
                        style={{
                          borderColor: colors.error,
                          color: colors.error,
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {t("gift.clearCode")}
                      </Button>
                      <Button
                        onClick={handlePickImageFromGallery}
                        disabled={loading.gift || isScanningImage}
                        variant="outline"
                        className="flex-1 w-full sm:w-auto"
                        style={{
                          borderColor: colors.primary,
                          color: colors.primary,
                        }}
                      >
                        {isScanningImage ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("gift.scanning")}...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {t("gift.selectImage")}
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleScanForGift}
                      disabled={loading.gift || isScanningImage}
                      className="flex-1 w-full sm:w-auto"
                      style={{
                        backgroundColor: colors.primary,
                        color: "white",
                      }}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {t("gift.scanQRCode")}
                    </Button>
                    <Button
                      onClick={handlePickImageFromGallery}
                      disabled={loading.gift || isScanningImage}
                      variant="outline"
                      className="flex-1 w-full sm:w-auto"
                      style={{
                        borderColor: colors.primary,
                        color: colors.primary,
                      }}
                    >
                      {isScanningImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("gift.scanning")}...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {t("gift.selectImage")}
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileSelect}
                />
              </div>
            )}

            {/* Send Gift Button */}
            {canSendGift && (
              <Button
                onClick={handleSendGift}
                disabled={loading.gift}
                className="w-full"
                style={{
                  backgroundColor: colors.primary,
                  color: "white",
                }}
              >
                {loading.gift ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("gift.sending")}...
                  </>
                ) : (
                  t("gift.sendGift")
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal - gift mode: only accept friend's QR, no loyalty API */}
      <QRScanner
        open={showQRScanner}
        onOpenChange={setShowQRScanner}
        mode="gift"
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}
