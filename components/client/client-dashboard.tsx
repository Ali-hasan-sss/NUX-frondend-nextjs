"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { fetchUserBalances, fetchWalletBalance } from "@/features/client";
import { QRScanner } from "./qr-scanner";
import { ClientCheckoutDialog } from "./client-checkout-dialog";
import { WalletPayRestaurantDialog } from "./wallet-pay-restaurant-dialog";
import { Camera, Wallet, UtensilsCrossed, Coffee, Star, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";

export function ClientDashboard() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, mounted } = useClientTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { userBalances, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );
  const { balance: appWalletBalance } = useAppSelector((state) => state.clientWallet);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [walletPayOpen, setWalletPayOpen] = useState(false);
  const [walletFixedId, setWalletFixedId] = useState<string | undefined>();
  const [walletFixedName, setWalletFixedName] = useState<string | undefined>();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchUserBalances());
      dispatch(fetchWalletBalance());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  if (!user || user.role !== "USER") {
    return null;
  }

  const handleScanSuccess = () => {
    dispatch(fetchUserBalances());
    setShowQRScanner(false);
  };

  const totalMealPoints = userBalances.reduce(
    (acc, b: any) => acc + (b.stars_meal || 0),
    0
  );
  const totalDrinkPoints = userBalances.reduce(
    (acc, b: any) => acc + (b.stars_drink || 0),
    0
  );

  const openWalletFromCheckout = (args: { restaurantId: string; restaurantName: string }) => {
    setWalletFixedId(args.restaurantId);
    setWalletFixedName(args.restaurantName);
    setWalletPayOpen(true);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20">
      {showWelcome && (
        <div className="px-6 pt-6 pb-4">
          <div
            className="rounded-tl-[60px] rounded-br-[60px] rounded-tr-[20px] rounded-bl-[20px] p-6 text-center"
            style={{
              background:
                "linear-gradient(135deg, #FF6B9D 0%, #A855F7 50%, #00D9FF 100%)",
            }}
          >
            <h1 className="text-2xl font-bold text-white">{t("home.welcomeToNux")}</h1>
          </div>
        </div>
      )}

      <div className="px-5 py-5 space-y-4">
        {/* Pay at venue — only checkout entry for payment */}
        <button
          type="button"
          onClick={() => setCheckoutOpen(true)}
          className="w-full rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
          }}
        >
          <Banknote className="h-9 w-9 shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-lg font-bold">{t("home.payAtVenue")}</p>
            <p className="text-sm opacity-90">{t("home.payAtVenueDesc")}</p>
          </div>
        </button>

        <button
          onClick={() => setShowQRScanner(true)}
          className="w-full rounded-2xl p-5 flex items-center gap-4 text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #00D9FF 0%, #A855F7 100%)",
            boxShadow: "0 4px 12px rgba(0, 217, 255, 0.4)",
          }}
          disabled={loading.qrScan}
        >
          <Camera className="h-8 w-8 shrink-0" />
          <div className="flex-1 text-left">
            <p className="text-lg font-bold">{t("home.scanCode")}</p>
            <p className="text-sm opacity-80">{t("home.scanCodeDesc")}</p>
          </div>
        </button>

        {error.balances ? (
          <div
            className="rounded-2xl p-6 text-center"
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
        ) : (
          <div
            className="rounded-2xl p-4 shadow-lg flex flex-col gap-3"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              {t("home.balancesSummary")}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center flex-1 py-2 rounded-xl" style={{ backgroundColor: `${colors.success}18` }}>
                <Wallet className="h-6 w-6 mb-1" style={{ color: colors.success }} />
                <span className="text-xs font-semibold tabular-nums" style={{ color: colors.text }}>
                  {appWalletBalance?.balance ?? "—"} {appWalletBalance?.currency ?? "EUR"}
                </span>
              </div>
              <div className="flex flex-col items-center flex-1 py-2 rounded-xl" style={{ backgroundColor: `${colors.primary}18` }}>
                <UtensilsCrossed className="h-6 w-6 mb-1" style={{ color: colors.primary }} />
                <span className="text-xs font-semibold tabular-nums flex items-center gap-1" style={{ color: colors.text }}>
                  {totalMealPoints} <Star className="h-3 w-3" style={{ color: colors.primary }} />
                </span>
              </div>
              <div className="flex flex-col items-center flex-1 py-2 rounded-xl" style={{ backgroundColor: `${colors.secondary}18` }}>
                <Coffee className="h-6 w-6 mb-1" style={{ color: colors.secondary }} />
                <span className="text-xs font-semibold tabular-nums flex items-center gap-1" style={{ color: colors.text }}>
                  {totalDrinkPoints} <Star className="h-3 w-3" style={{ color: colors.secondary }} />
                </span>
              </div>
            </div>
            <Link
              href="/client/purchase"
              className={cn(
                "text-center text-sm font-semibold py-2 rounded-xl border",
                "transition-opacity hover:opacity-90"
              )}
              style={{ borderColor: colors.border, color: colors.primary }}
            >
              {t("home.loyaltyPackagesLink")}
            </Link>
          </div>
        )}
      </div>

      <QRScanner
        open={showQRScanner}
        onOpenChange={setShowQRScanner}
        onScanSuccess={handleScanSuccess}
      />

      <ClientCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        onOpenWalletPay={openWalletFromCheckout}
      />

      <WalletPayRestaurantDialog
        open={walletPayOpen}
        onOpenChange={(v) => {
          setWalletPayOpen(v);
          if (!v) {
            setWalletFixedId(undefined);
            setWalletFixedName(undefined);
          }
        }}
        fixedRestaurantId={walletFixedId}
        fixedRestaurantName={walletFixedName}
      />
    </div>
  );
}
