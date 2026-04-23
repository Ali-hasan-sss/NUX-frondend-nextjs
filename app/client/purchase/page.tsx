"use client";

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import {
  fetchUserBalances,
  fetchClientProfile,
  fetchWalletBalance,
} from "@/features/client";
import { RestaurantSelector } from "@/components/client/restaurant-selector";
import { PackagesModal } from "@/components/client/packages-modal";
import Link from "next/link";
import {
  CreditCard,
  Coffee,
  UtensilsCrossed,
  Camera,
  Share2,
  Loader2,
  Check,
  Circle,
  Info,
  Wallet,
  Gift,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { balanceRowIdFromUserBalance } from "@/lib/paymentQr";
import { walletService } from "@/features/client/wallet/walletService";
import { WalletTopUpDialog } from "@/components/client/wallet-top-up-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type RecipientPreview = {
  code: string;
  name: string | null;
  email: string | null;
};

export default function PurchasePage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, mounted } = useClientTheme();
  const { user } = useAppSelector((state) => state.auth);
  const { userBalances, error } = useAppSelector((state) => state.clientBalances);
  const walletState = useAppSelector((state) => state.clientWallet);
  const { profile: clientProfile, loading: profileLoading } = useAppSelector(
    (state) => state.clientAccount
  );
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"loyalty" | "wallet">("loyalty");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftRecipientCode, setGiftRecipientCode] = useState("");
  const [giftRecipientName, setGiftRecipientName] = useState<string | null>(null);
  const [giftRecipientEmail, setGiftRecipientEmail] = useState<string | null>(null);
  const [giftAmount, setGiftAmount] = useState<10 | 20 | 25 | 50>(10);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftScanning, setGiftScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const qrShareRef = useRef<HTMLDivElement>(null);
  const scannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const scannerStreamRef = useRef<MediaStream | null>(null);
  const scannerFrameRef = useRef<number | null>(null);
  const giftAmountOptions = [10, 20, 25, 50] as const;

  const parseRecipientData = (raw: string): RecipientPreview => {
    const value = raw.trim();
    if (!value) return { code: "", name: null, email: null };
    if (value.startsWith("LOLITY_USER:")) {
      try {
        const parsed = JSON.parse(value.slice("LOLITY_USER:".length));
        if (typeof parsed?.userId === "string") {
          return {
            code: parsed.userId,
            name:
              typeof parsed?.fullName === "string"
                ? parsed.fullName
                : typeof parsed?.name === "string"
                ? parsed.name
                : null,
            email: typeof parsed?.email === "string" ? parsed.email : null,
          };
        }
      } catch {}
    }
    if (value.startsWith("{")) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed?.userId === "string") {
          return {
            code: parsed.userId,
            name:
              typeof parsed?.fullName === "string"
                ? parsed.fullName
                : typeof parsed?.name === "string"
                ? parsed.name
                : null,
            email: typeof parsed?.email === "string" ? parsed.email : null,
          };
        }
      } catch {}
    }
    return { code: value, name: null, email: null };
  };

  const stopGiftScanner = useCallback(() => {
    if (scannerFrameRef.current != null) {
      cancelAnimationFrame(scannerFrameRef.current);
      scannerFrameRef.current = null;
    }
    if (scannerStreamRef.current) {
      scannerStreamRef.current.getTracks().forEach((track) => track.stop());
      scannerStreamRef.current = null;
    }
    setGiftScanning(false);
  }, []);

  const applyScannedRecipient = useCallback(
    (rawValue: string) => {
      const parsed = parseRecipientData(rawValue);
      if (!parsed.code) {
        setScanError(t("gift.invalidCodeScanFriend"));
        return false;
      }
      setGiftRecipientCode(parsed.code);
      setGiftRecipientName(parsed.name);
      setGiftRecipientEmail(parsed.email);
      setScanError(null);
      return true;
    },
    [t]
  );

  const startGiftScanner = useCallback(async () => {
    try {
      setScanError(null);
      const Detector = (window as any).BarcodeDetector;
      if (!Detector) {
        setScanError(t("gift.barcodeNotSupported"));
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      scannerStreamRef.current = stream;
      setGiftScanning(true);

      const video = scannerVideoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      const detector = new Detector({ formats: ["qr_code"] });
      const scanLoop = async () => {
        if (!video || video.readyState < 2) {
          scannerFrameRef.current = requestAnimationFrame(() => void scanLoop());
          return;
        }
        try {
          const codes = await detector.detect(video);
          const raw = codes?.[0]?.rawValue;
          if (typeof raw === "string" && raw.trim()) {
            const accepted = applyScannedRecipient(raw);
            if (accepted) {
              stopGiftScanner();
              return;
            }
          }
        } catch {
          // keep scanning
        }
        scannerFrameRef.current = requestAnimationFrame(() => void scanLoop());
      };
      scannerFrameRef.current = requestAnimationFrame(() => void scanLoop());
    } catch {
      setScanError(t("gift.scanError"));
      stopGiftScanner();
    }
  }, [applyScannedRecipient, stopGiftScanner, t]);

  const scanFromImageFile = useCallback(
    async (file: File) => {
      try {
        setScanError(null);
        const Detector = (window as any).BarcodeDetector;
        if (!Detector) {
          setScanError(t("gift.barcodeNotSupported"));
          return;
        }
        const imageBitmap = await createImageBitmap(file);
        const detector = new Detector({ formats: ["qr_code"] });
        const codes = await detector.detect(imageBitmap);
        const raw = codes?.[0]?.rawValue;
        if (typeof raw === "string" && raw.trim()) {
          const accepted = applyScannedRecipient(raw);
          if (!accepted) {
            setScanError(t("gift.invalidCodeScanFriend"));
          }
          return;
        }
        setScanError(t("gift.scanError"));
      } catch {
        setScanError(t("gift.scanError"));
      }
    },
    [applyScannedRecipient, t]
  );

  const handleGiftFileSelected = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.currentTarget.value = "";
      if (!file) return;
      await scanFromImageFile(file);
    },
    [scanFromImageFile]
  );

  useEffect(() => {
    if (!giftOpen) {
      stopGiftScanner();
      setScanError(null);
      setGiftRecipientCode("");
      setGiftRecipientName(null);
      setGiftRecipientEmail(null);
    }
  }, [giftOpen, stopGiftScanner]);

  useEffect(() => {
    return () => {
      stopGiftScanner();
    };
  }, [stopGiftScanner]);

  const handleGiftVoucher = async () => {
    const recipientCode = parseRecipientData(giftRecipientCode).code;
    if (!recipientCode) {
      toast.error(t("gift.invalidCodeScanFriend"));
      return;
    }
    setGiftLoading(true);
    try {
      await walletService.requestGiftVoucher({
        recipientCode,
        amount: giftAmount,
        initiatedFrom: "web",
      });
      toast.success(
        t("wallet.waitingMobileApprovalHint") ||
          "Waiting for mobile approval (PIN/biometric)."
      );
      setGiftOpen(false);
      dispatch(fetchWalletBalance());
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        t("common.error") ||
        "Gift request failed";
      toast.error(msg);
    } finally {
      setGiftLoading(false);
    }
  };

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

  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchUserBalances());
      dispatch(fetchClientProfile());
      dispatch(fetchWalletBalance());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (userBalances.length > 0 && !selectedRestaurantId) {
      const validBalances = userBalances.filter((balance: any) =>
        Boolean(
          balance.targetId ||
            balance.restaurantId ||
            balance.restaurant?.id ||
            (balance.name && balance.restaurant?.name)
        )
      );
      if (validBalances.length > 0) {
        const id = balanceRowIdFromUserBalance(validBalances[0]);
        if (id) setSelectedRestaurantId(id);
      }
    }
  }, [userBalances, selectedRestaurantId]);

  if (!mounted) {
    return null;
  }

  const validRestaurants = userBalances.filter((balance: any) =>
    Boolean(
      balance.targetId ||
        balance.restaurantId ||
        balance.restaurant?.id ||
        (balance.name && balance.restaurant?.name)
    )
  );

  const selectedRestaurantBalance = userBalances.find(
    (balance: any) => balanceRowIdFromUserBalance(balance) === selectedRestaurantId
  );

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
    mealVouchers,
    drinkVouchers,
    mealPerVoucher,
    drinkPerVoucher,
    mealTowardNext: Math.min(mealTowardNext, mealPerVoucher),
    drinkTowardNext: Math.min(drinkTowardNext, drinkPerVoucher),
  };

  const restaurantsWithBalances = validRestaurants
    .map((balance: any) => {
      const id = balanceRowIdFromUserBalance(balance);
      const name = balance.name || balance.restaurant?.name;
      return {
        id,
        name: name || "Unknown Restaurant",
        userBalance: {
          mealPoints: balance.stars_meal || 0,
          drinkPoints: balance.stars_drink || 0,
        },
      };
    })
    .filter(
      (r): r is { id: string; name: string; userBalance: { mealPoints: number; drinkPoints: number } } =>
        typeof r.id === "string" && r.id.length > 0
    );

  const selectedRestaurant = restaurantsWithBalances.find((r) => r.id === selectedRestaurantId);

  const handleRestaurantChange = (restaurant: { id: string }) => {
    setSelectedRestaurantId(restaurant.id);
  };

  const handleRecharge = () => {
    if (!selectedRestaurant) {
      alert(t("purchase.selectRestaurantFirst"));
      return;
    }
    setShowPackagesModal(true);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 px-5 py-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          {t("purchase.title")}
        </h1>
      </div>

      <Link
        href="/client/home"
        className="flex gap-3 rounded-2xl p-4 mb-6 shadow-lg items-start"
        style={{ backgroundColor: `${colors.primary}18`, borderWidth: 1, borderColor: colors.border }}
      >
        <Info className="h-5 w-5 shrink-0 mt-0.5" style={{ color: colors.primary }} />
        <p className="text-sm" style={{ color: colors.text }}>
          {t("purchase.payOnHomeBanner")}
        </p>
      </Link>

      <div
        className="rounded-2xl p-1 mb-6 flex gap-1"
        style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
      >
        <button
          className="flex-1 rounded-xl py-2 text-sm font-semibold"
          style={{
            backgroundColor: activeTab === "loyalty" ? colors.primary : "transparent",
            color: activeTab === "loyalty" ? "#fff" : colors.text,
          }}
          onClick={() => setActiveTab("loyalty")}
        >
          {t("purchase.tabLoyalty")}
        </button>
        <button
          className="flex-1 rounded-xl py-2 text-sm font-semibold"
          style={{
            backgroundColor: activeTab === "wallet" ? colors.primary : "transparent",
            color: activeTab === "wallet" ? "#fff" : colors.text,
          }}
          onClick={() => setActiveTab("wallet")}
        >
          {t("purchase.tabWallet")}
        </button>
      </div>

      {activeTab === "loyalty" && (
        <>
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
            <div className="rounded-2xl p-6 mb-6 text-center" style={{ backgroundColor: colors.surface }}>
              <p className="font-semibold mb-2" style={{ color: colors.text }}>
                {t("home.noBalances")}
              </p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {t("home.noBalancesDesc")}
              </p>
            </div>
          )}

          {selectedRestaurant && (
            <div className="mb-6 mt-6 space-y-3">
          <div className={cn("rounded-2xl p-4 flex flex-col gap-3 shadow-lg")} style={{ backgroundColor: colors.surface }}>
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
                      i < currentBalance.mealTowardNext ? "border-transparent" : "border-dashed"
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

          <div className={cn("rounded-2xl p-4 flex flex-col gap-3 shadow-lg")} style={{ backgroundColor: colors.surface }}>
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
                      i < currentBalance.drinkTowardNext ? "border-transparent" : "border-dashed"
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

          <p className="text-xs px-1" style={{ color: colors.textSecondary }}>
            {t("wallet.legacyPerRestaurant")}
          </p>
            </div>
          )}
        </>
      )}

      {activeTab === "loyalty" && (
      <div className="space-y-4">
        <button
          onClick={handleRecharge}
          disabled={!selectedRestaurant}
          className={cn(
            "w-full rounded-2xl p-5 flex items-center gap-4 transition-all shadow-lg",
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

        <div
          className={cn("w-full rounded-2xl p-5 flex flex-col items-center shadow-lg")}
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
          <p className="text-sm text-center" style={{ color: colors.textSecondary }}>
            {t("account.qrCodeDesc")}
          </p>
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
                <p className="text-sm font-medium text-gray-800 mt-3">{clientProfile.fullName || ""}</p>
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
                {shareLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
                {shareLoading ? t("common.loading") : t("account.shareCode")}
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
      )}

      {activeTab === "wallet" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 shadow-lg flex items-start gap-4" style={{ backgroundColor: colors.surface }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${colors.primary}25` }}>
              <Wallet className="h-7 w-7" style={{ color: colors.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                {t("wallet.balance")}
              </p>
              {walletState.loading.balance && !walletState.balance ? (
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.primary }} />
              ) : (
                <p className="text-3xl font-bold tabular-nums" style={{ color: colors.text }}>
                  {walletState.balance?.balance ?? "—"} {walletState.balance?.currency ?? "EUR"}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                <Button type="button" size="sm" onClick={() => setTopUpOpen(true)} style={{ backgroundColor: colors.primary, color: "#fff" }}>
                  {t("wallet.addFunds")}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setGiftOpen(true)}>
                  <Gift className="h-4 w-4 mr-1" />
                  {t("purchase.gift")}
                </Button>
              </div>
              <p className="text-xs mt-3" style={{ color: colors.textSecondary }}>
                {t("wallet.waitingMobileApprovalHint")}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedRestaurant && (
        <>
          <PackagesModal
            open={showPackagesModal}
            onOpenChange={setShowPackagesModal}
            restaurantId={selectedRestaurant.id}
          />
        </>
      )}

      <WalletTopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />

      <Dialog open={giftOpen} onOpenChange={setGiftOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>{t("purchase.gift")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={startGiftScanner} disabled={giftScanning}>
                {giftScanning ? (t("gift.scanning") || "Scanning...") : t("gift.scanQRCode")}
              </Button>
              <Button type="button" variant="outline" asChild>
                <label className="cursor-pointer">
                  {t("purchase.giftVoucherUpload") || "Gallery"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGiftFileSelected}
                  />
                </label>
              </Button>
              {giftScanning ? (
                <Button type="button" variant="outline" onClick={stopGiftScanner}>
                  {t("common.cancel") || "Cancel"}
                </Button>
              ) : null}
            </div>

            {giftScanning ? (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: colors.border }}>
                <video ref={scannerVideoRef} className="w-full h-56 object-cover" muted playsInline />
              </div>
            ) : null}

            <Input
              placeholder={t("gift.scanQRCode")}
              value={giftRecipientCode}
              readOnly
            />

            {(giftRecipientName || giftRecipientEmail) && (
              <div
                className="rounded-xl p-3 text-sm"
                style={{
                  backgroundColor: `${colors.primary}12`,
                  borderWidth: 1,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                {giftRecipientName ? <p>{giftRecipientName}</p> : null}
                {giftRecipientEmail ? (
                  <p style={{ color: colors.textSecondary }}>{giftRecipientEmail}</p>
                ) : null}
              </div>
            )}

            {scanError ? (
              <p className="text-xs" style={{ color: colors.error }}>
                {scanError}
              </p>
            ) : null}
            <div className="grid grid-cols-4 gap-2">
              {giftAmountOptions.map((a) => (
                <Button
                  key={a}
                  type="button"
                  variant={giftAmount === a ? "default" : "outline"}
                  onClick={() => setGiftAmount(a)}
                >
                  {a}
                </Button>
              ))}
            </div>
            <p className="text-xs" style={{ color: colors.textSecondary }}>
              {t("wallet.waitingMobileApprovalHint")}
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setGiftOpen(false)}>
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button type="button" onClick={handleGiftVoucher} disabled={giftLoading}>
                {giftLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("purchase.sendGift") || "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
