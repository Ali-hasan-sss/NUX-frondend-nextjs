"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { fetchUserBalances, fetchClientProfile } from "@/features/client";
import { RestaurantSelector } from "@/components/client/restaurant-selector";
import { PaymentForm } from "@/components/client/payment-form";
import { GiftModal } from "@/components/client/gift-modal";
import { PackagesModal } from "@/components/client/packages-modal";
import {
  CreditCard,
  Gift,
  Coffee,
  UtensilsCrossed,
  Wallet,
  Camera,
  Share2,
  Loader2,
  Check,
  Circle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { toast } from "sonner";
import html2canvas from "html2canvas";

export default function PurchasePage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { userBalances, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );
  const { profile: clientProfile, loading: profileLoading } = useAppSelector(
    (state) => state.clientAccount
  );
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<
    "drink" | "meal" | "wallet"
  >("wallet");
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const qrShareRef = useRef<HTMLDivElement>(null);

  const handleShareMyCode = useCallback(async () => {
    if (!clientProfile?.qrCode || clientProfile.qrCode.trim() === "" || !qrShareRef.current) return;
    setShareLoading(true);
    try {
      const canvas = await html2canvas(qrShareRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            toast.error(t("account.shareFailed"));
            setShareLoading(false);
            return;
          }
          const file = new File([blob], "my-qr-code.png", { type: "image/png" });
          const canShare =
            "share" in navigator &&
            (navigator.canShare?.({ files: [file] }) ?? true);
          if (canShare) {
            try {
              await navigator.share({
                files: [file],
                title: t("account.myQRCode"),
              });
              toast.success(t("account.shareSuccess") || "QR code shared");
            } catch (shareErr: unknown) {
              if ((shareErr as { name?: string })?.name !== "AbortError") {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "my-qr-code.png";
                a.click();
                URL.revokeObjectURL(url);
                toast.success(t("account.shareDownload") || "QR code saved");
              }
            }
          } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my-qr-code.png";
            a.click();
            URL.revokeObjectURL(url);
            toast.success(t("account.shareDownload") || "QR code saved");
          }
          setShareLoading(false);
        },
        "image/png",
        1
      );
    } catch {
      toast.error(t("account.shareFailed"));
      setShareLoading(false);
    }
  }, [clientProfile?.qrCode, t]);

  // Fetch balances and profile on mount
  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchUserBalances());
      dispatch(fetchClientProfile());
    }
  }, [dispatch, user]);

  // Auto-select first restaurant when balances are loaded
  useEffect(() => {
    if (userBalances.length > 0 && !selectedRestaurantId) {
      const validBalances = userBalances.filter((balance: any) => {
        if (balance.name && balance.targetId) return true;
        if (balance.restaurant && balance.restaurant.name) return true;
        return false;
      });
      if (validBalances.length > 0) {
        const firstBalance = validBalances[0];
        const id =
          (firstBalance as any).targetId || (firstBalance as any).restaurantId;
        setSelectedRestaurantId(id);
      }
    }
  }, [userBalances, selectedRestaurantId]);

  if (!mounted) {
    return null;
  }

  // Get valid restaurants for selector
  const validRestaurants = userBalances.filter((balance: any) => {
    if (balance.name && balance.targetId) return true;
    if (balance.restaurant && balance.restaurant.name) return true;
    return false;
  });

  // Get selected restaurant balance
  const selectedRestaurantBalance = userBalances.find((balance: any) => {
    const id = balance.targetId || balance.restaurantId;
    return id === selectedRestaurantId;
  });

  // Calculate balances and vouchers for selected restaurant
  const bal = selectedRestaurantBalance as any;
  const mealVouchers = bal?.vouchers_meal ?? 0;
  const drinkVouchers = bal?.vouchers_drink ?? 0;
  const mealPerVoucher = bal?.mealPointsPerVoucher || 1;
  const drinkPerVoucher = bal?.drinkPointsPerVoucher || 1;
  const mealStars = bal?.stars_meal ?? 0;
  const drinkStars = bal?.stars_drink ?? 0;
  const mealTowardNext = mealPerVoucher > 0 ? mealStars - mealVouchers * mealPerVoucher : 0;
  const drinkTowardNext = drinkPerVoucher > 0 ? drinkStars - drinkVouchers * drinkPerVoucher : 0;

  const currentBalance = {
    walletBalance: bal?.balance ?? 0,
    mealPoints: mealStars,
    drinkPoints: drinkStars,
    mealVouchers,
    drinkVouchers,
    mealPerVoucher,
    drinkPerVoucher,
    mealTowardNext: Math.min(mealTowardNext, mealPerVoucher),
    drinkTowardNext: Math.min(drinkTowardNext, drinkPerVoucher),
  };

  // Convert to RestaurantSelector format
  const restaurantsWithBalances = validRestaurants.map((balance: any) => {
    const id = balance.targetId || balance.restaurantId;
    const name = balance.name || balance.restaurant?.name;
    return {
      id,
      name: name || "Unknown Restaurant",
      userBalance: {
        walletBalance: balance.balance || 0,
        mealPoints: balance.stars_meal || 0,
        drinkPoints: balance.stars_drink || 0,
      },
    };
  });

  const selectedRestaurant = restaurantsWithBalances.find(
    (r) => r.id === selectedRestaurantId
  );

  const handleRestaurantChange = (restaurant: any) => {
    setSelectedRestaurantId(restaurant.id);
  };

  const handleRecharge = () => {
    if (!selectedRestaurant) {
      alert(t("purchase.selectRestaurantFirst"));
      return;
    }
    setShowPackagesModal(true);
  };

  const handleGiftFriend = () => {
    if (!selectedRestaurant) {
      alert(t("purchase.selectRestaurantFirst"));
      return;
    }
    setShowGiftModal(true);
  };

  const handlePayWithWallet = () => {
    if (!selectedRestaurant) return;
    setSelectedPaymentType("wallet");
    setShowPaymentForm(true);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 px-5 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          {t("purchase.title")}
        </h1>
      </div>

      {/* Error/Balance Cards */}
      {error.balances ? (
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            backgroundColor: `${colors.error}20`,
            borderColor: colors.error,
            borderWidth: "1px",
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.error }}>
            {t("home.errorLoadingData")}
          </p>
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            {error.balances}
          </p>
          <button
            onClick={() => dispatch(fetchUserBalances())}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: colors.error }}
          >
            {t("home.retry")}
          </button>
        </div>
      ) : restaurantsWithBalances.length > 0 ? (
        <RestaurantSelector
          restaurants={restaurantsWithBalances}
          onRestaurantChange={handleRestaurantChange}
          selectedRestaurantId={selectedRestaurantId}
        />
      ) : (
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            backgroundColor: colors.surface,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.text }}>
            {t("home.noBalances")}
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {t("home.noBalancesDesc")}
          </p>
        </div>
      )}

      {/* Balance Cards */}
      {selectedRestaurant && (
        <div className="mb-6 space-y-3">
          {/* Meal Vouchers */}
          <div
            className={cn(
              "rounded-2xl p-4 flex flex-col gap-3 shadow-lg"
            )}
            style={{ backgroundColor: colors.surface }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <UtensilsCrossed className="h-5 w-5" style={{ color: colors.primary }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text }}>
                  {t("purchase.mealVouchers", { count: currentBalance.mealVouchers })}
                </p>
                {currentBalance.mealPerVoucher > 0 && (
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {t("purchase.pointsTowardNext", {
                      current: currentBalance.mealTowardNext,
                      total: currentBalance.mealPerVoucher,
                    })}
                  </p>
                )}
              </div>
            </div>
            {currentBalance.mealPerVoucher > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: currentBalance.mealPerVoucher }, (_, i) => (
                  <div
                    key={`meal-${i}`}
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2",
                      i < currentBalance.mealTowardNext
                        ? "border-transparent"
                        : "border-dashed"
                    )}
                    style={{
                      backgroundColor: i < currentBalance.mealTowardNext ? colors.primary : "transparent",
                      borderColor: i >= currentBalance.mealTowardNext ? colors.textSecondary : undefined,
                    }}
                  >
                    {i < currentBalance.mealTowardNext ? (
                      <Check className="h-5 w-5 text-white" strokeWidth={3} />
                    ) : (
                      <Circle className="h-5 w-5" style={{ color: colors.textSecondary }} strokeWidth={1.5} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drink Vouchers */}
          <div
            className={cn(
              "rounded-2xl p-4 flex flex-col gap-3 shadow-lg"
            )}
            style={{ backgroundColor: colors.surface }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${colors.secondary}20` }}
              >
                <Coffee className="h-5 w-5" style={{ color: colors.secondary }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text }}>
                  {t("purchase.drinkVouchers", { count: currentBalance.drinkVouchers })}
                </p>
                {currentBalance.drinkPerVoucher > 0 && (
                  <p className="text-xs" style={{ color: colors.textSecondary }}>
                    {t("purchase.pointsTowardNext", {
                      current: currentBalance.drinkTowardNext,
                      total: currentBalance.drinkPerVoucher,
                    })}
                  </p>
                )}
              </div>
            </div>
            {currentBalance.drinkPerVoucher > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: currentBalance.drinkPerVoucher }, (_, i) => (
                  <div
                    key={`drink-${i}`}
                    className={cn(
                      "shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2",
                      i < currentBalance.drinkTowardNext
                        ? "border-transparent"
                        : "border-dashed"
                    )}
                    style={{
                      backgroundColor: i < currentBalance.drinkTowardNext ? colors.secondary : "transparent",
                      borderColor: i >= currentBalance.drinkTowardNext ? colors.textSecondary : undefined,
                    }}
                  >
                    {i < currentBalance.drinkTowardNext ? (
                      <Check className="h-5 w-5 text-white" strokeWidth={3} />
                    ) : (
                      <Circle className="h-5 w-5" style={{ color: colors.textSecondary }} strokeWidth={1.5} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wallet Balance Card */}
          <div
            className={cn(
              "rounded-2xl p-4 flex items-center gap-4",
              "shadow-lg"
            )}
            style={{ backgroundColor: colors.surface }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${colors.success}20` }}
            >
              <Wallet className="h-6 w-6" style={{ color: colors.success }} />
            </div>
            <div className="flex-1">
              <p
                className="text-xs mb-1"
                style={{ color: colors.textSecondary }}
              >
                {t("purchase.walletBalance")}
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.text }}>
                ${currentBalance.walletBalance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="space-y-4">
        {/* Recharge Card */}
        <button
          onClick={handleRecharge}
          disabled={!selectedRestaurant}
          className={cn(
            "w-full rounded-2xl p-5 flex items-center gap-4 transition-all",
            "shadow-lg",
            selectedRestaurant ? "opacity-100" : "opacity-50 cursor-not-allowed"
          )}
          style={{ backgroundColor: colors.surface }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <CreditCard className="h-7 w-7" style={{ color: colors.primary }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-lg" style={{ color: colors.text }}>
              {t("purchase.recharge")}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {t("purchase.rechargeDesc")}
            </p>
          </div>
        </button>

        {/* Gift Card */}
        <button
          onClick={handleGiftFriend}
          disabled={!selectedRestaurant}
          className={cn(
            "w-full rounded-2xl p-5 flex items-center gap-4 transition-all",
            "shadow-lg",
            selectedRestaurant ? "opacity-100" : "opacity-50 cursor-not-allowed"
          )}
          style={{ backgroundColor: colors.surface }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${colors.secondary}20` }}
          >
            <Gift className="h-7 w-7" style={{ color: colors.secondary }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-lg" style={{ color: colors.text }}>
              {t("purchase.gift")}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {t("purchase.giftDesc")}
            </p>
          </div>
        </button>

        {/* QR Code Card */}
        <div
          className={cn(
            "w-full rounded-2xl p-5 flex flex-col items-center",
            "shadow-lg"
          )}
          style={{ backgroundColor: colors.surface }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <Camera className="h-7 w-7" style={{ color: colors.primary }} />
          </div>
          <p className="font-bold text-lg mb-2" style={{ color: colors.text }}>
            {t("account.myQRCode")}
          </p>
          <p
            className="text-sm text-center"
            style={{ color: colors.textSecondary }}
          >
            {t("account.qrCodeDesc")}
          </p>
          {/* QR Code - white background in both themes for reliable scanning */}
          {clientProfile?.qrCode && clientProfile.qrCode.trim() !== "" && !profileLoading.profile ? (
            <>
              <div
                ref={qrShareRef}
                className="inline-flex flex-col items-center p-5 rounded-xl bg-white shadow-md mt-4"
              >
                <QRCodeSVG
                  value={clientProfile.qrCode}
                  size={200}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="M"
                  includeMargin={true}
                />
                <p className="text-sm font-medium text-gray-800 mt-3">
                  {clientProfile.fullName || ""}
                </p>
                <p className="text-xs text-gray-500">{clientProfile.email || ""}</p>
              </div>
              <button
                type="button"
                onClick={handleShareMyCode}
                disabled={shareLoading}
                className={cn(
                  "w-full mt-4 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-opacity",
                  shareLoading && "opacity-70 cursor-not-allowed"
                )}
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: "1px",
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                {shareLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Share2 className="h-5 w-5" />
                )}
                {shareLoading
                  ? t("common.loading")
                  : t("account.shareCode")}
              </button>
            </>
          ) : profileLoading.profile ? (
            <div className="mt-4 flex justify-center items-center p-5 rounded-xl bg-white">
              <div className="w-[200px] h-[200px] rounded-lg flex items-center justify-center bg-white">
                <p className="text-sm text-gray-500">{t("common.loading")}...</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-center items-center p-5 rounded-xl bg-white">
              <div className="w-[200px] h-[200px] rounded-lg flex items-center justify-center bg-white">
                <p className="text-sm text-gray-500">{t("account.noQRCode")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Form Modal */}
      {selectedRestaurant && (
        <PaymentForm
          open={showPaymentForm}
          onOpenChange={setShowPaymentForm}
          initialPaymentType={selectedPaymentType}
          restaurantId={selectedRestaurant.id}
          onPaymentSuccess={(result) => {
            dispatch(fetchUserBalances());
            setShowPaymentForm(false);
          }}
        />
      )}

      {/* Gift Modal */}
      {selectedRestaurant && (
        <GiftModal
          open={showGiftModal}
          onOpenChange={setShowGiftModal}
          targetId={selectedRestaurant.id}
        />
      )}

      {/* Packages Modal */}
      {selectedRestaurant && (
        <PackagesModal
          open={showPackagesModal}
          onOpenChange={setShowPackagesModal}
          restaurantId={selectedRestaurant.id}
        />
      )}
    </div>
  );
}
