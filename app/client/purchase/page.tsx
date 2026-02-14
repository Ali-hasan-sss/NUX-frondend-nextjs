"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";

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

  // Calculate balances for selected restaurant
  const currentBalance = {
    walletBalance: selectedRestaurantBalance?.balance || 0,
    mealPoints: selectedRestaurantBalance?.stars_meal || 0,
    drinkPoints: selectedRestaurantBalance?.stars_drink || 0,
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
          {/* Meal and Drink Points Row */}
          <div className="flex gap-3">
            <div
              className={cn(
                "flex-1 rounded-2xl p-4 flex flex-col items-center",
                "shadow-lg"
              )}
              style={{ backgroundColor: colors.surface }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <UtensilsCrossed
                  className="h-6 w-6"
                  style={{ color: colors.primary }}
                />
              </div>
              <p
                className="text-xs mb-1"
                style={{ color: colors.textSecondary }}
              >
                {t("purchase.mealPoints")}
              </p>
              <p className="text-xl font-bold" style={{ color: colors.text }}>
                {currentBalance.mealPoints}
              </p>
            </div>

            <div
              className={cn(
                "flex-1 rounded-2xl p-4 flex flex-col items-center",
                "shadow-lg"
              )}
              style={{ backgroundColor: colors.surface }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${colors.secondary}20` }}
              >
                <Coffee
                  className="h-6 w-6"
                  style={{ color: colors.secondary }}
                />
              </div>
              <p
                className="text-xs mb-1"
                style={{ color: colors.textSecondary }}
              >
                {t("purchase.drinkPoints")}
              </p>
              <p className="text-xl font-bold" style={{ color: colors.text }}>
                {currentBalance.drinkPoints}
              </p>
            </div>
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
          <div className="mt-4 flex justify-center items-center p-5 rounded-xl bg-white">
            {profileLoading.profile ? (
              <div className="w-[200px] h-[200px] rounded-lg flex items-center justify-center bg-white">
                <p className="text-sm text-gray-500">{t("common.loading")}...</p>
              </div>
            ) : clientProfile?.qrCode && clientProfile.qrCode.trim() !== "" ? (
              <QRCodeSVG
                value={clientProfile.qrCode}
                size={200}
                fgColor="#000000"
                bgColor="#ffffff"
                level="M"
                includeMargin={true}
              />
            ) : (
              <div className="w-[200px] h-[200px] rounded-lg flex items-center justify-center bg-white">
                <p className="text-sm text-gray-500">{t("account.noQRCode")}</p>
              </div>
            )}
          </div>
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
