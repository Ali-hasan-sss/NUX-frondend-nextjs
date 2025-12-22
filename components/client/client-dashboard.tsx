"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { fetchUserBalances } from "@/features/client";
import { QRScanner } from "./qr-scanner";
import { PaymentForm } from "./payment-form";
import { Camera, Coffee, UtensilsCrossed, Wallet, Star } from "lucide-react";
import { RestaurantSelector } from "./restaurant-selector";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";

export function ClientDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { userBalances, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<
    "drink" | "meal" | "wallet"
  >("wallet");
  const [showWelcome, setShowWelcome] = useState(true);

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchUserBalances());
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

  // Hide welcome message after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // Early returns after all hooks
  if (!mounted) {
    return null;
  }

  if (!user || user.role !== "USER") {
    return null;
  }

  const handleScanSuccess = (result: any) => {
    dispatch(fetchUserBalances());
    setShowQRScanner(false);
  };

  const handleScanCode = () => {
    setShowQRScanner(true);
  };

  const handlePayWithWallet = () => {
    setSelectedPaymentType("wallet");
    setShowPaymentForm(true);
  };

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

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {/* Welcome Section */}
      {showWelcome && (
        <div className="px-6 pt-6 pb-4">
          <div
            className="rounded-tl-[60px] rounded-br-[60px] rounded-tr-[20px] rounded-bl-[20px] p-6 text-center"
            style={{
              background:
                "linear-gradient(135deg, #FF6B9D 0%, #A855F7 50%, #00D9FF 100%)",
            }}
          >
            <h1 className="text-2xl font-bold text-white">
              {t("home.welcomeToNux")}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-5 py-5">
        {/* Scan QR Code Button */}
        <button
          onClick={handleScanCode}
          className="w-full rounded-2xl mb-6 p-5 flex items-center gap-4 text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)",
            boxShadow: "0 4px 12px rgba(0, 217, 255, 0.4)",
          }}
          disabled={loading.qrScan}
        >
          <Camera className="h-8 w-8" />
          <div className="flex-1 text-left">
            <p className="text-lg font-bold">{t("home.scanCode")}</p>
            <p className="text-sm opacity-80">{t("home.scanCodeDesc")}</p>
          </div>
        </button>

        {/* Error/Balance Cards */}
        {error.balances ? (
          <div
            className="rounded-2xl p-6 mb-6 text-center"
            style={{
              backgroundColor: "rgba(248, 113, 113, 0.2)",
              borderColor: "#F87171",
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
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
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

        {/* Payment Button */}
        <div className="mt-4">
          <button
            onClick={selectedRestaurant ? handlePayWithWallet : undefined}
            disabled={!selectedRestaurant}
            className={cn(
              "w-full rounded-2xl p-4 shadow-lg transition-all",
              selectedRestaurant
                ? "opacity-100"
                : "opacity-50 cursor-not-allowed"
            )}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            }}
          >
            {/* Balance Icons Row */}
            <div
              className="flex items-center justify-between gap-3 p-3 rounded-3xl mb-3"
              style={{ backgroundColor: "rgba(52, 211, 153, 0.2)" }}
            >
              <div className="flex-1 flex flex-col items-center">
                <Wallet className="h-6 w-6 mb-1" style={{ color: "#34D399" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#34D399" }}
                >
                  {currentBalance.walletBalance.toFixed(2)} $
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <UtensilsCrossed
                  className="h-6 w-6 mb-1"
                  style={{ color: "#00D9FF" }}
                />
                <span
                  className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: "#34D399" }}
                >
                  {currentBalance.mealPoints}{" "}
                  <Star className="h-4 w-4" style={{ color: "#34D399" }} />
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <Coffee className="h-6 w-6 mb-1" style={{ color: "#FF6B9D" }} />
                <span
                  className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: "#34D399" }}
                >
                  {currentBalance.drinkPoints}{" "}
                  <Star className="h-4 w-4" style={{ color: "#34D399" }} />
                </span>
              </div>
            </div>
            <p
              className="text-center font-semibold"
              style={{
                color: selectedRestaurant ? "#1A1A1A" : "rgba(26, 26, 26, 0.5)",
              }}
            >
              {selectedRestaurant
                ? t("home.payWallet")
                : t("home.selectRestaurantFirst")}
            </p>
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={showQRScanner}
        onOpenChange={setShowQRScanner}
        onScanSuccess={handleScanSuccess}
      />

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
    </div>
  );
}
