"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Printer,
  Coffee,
  UtensilsCrossed,
  Store,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchRestaurantAccount,
  regenerateRestaurantQr,
} from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
// Render QR via external image endpoint to avoid extra deps
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  tablesService,
  Table,
} from "@/features/restaurant/tables/tablesService";
import { Badge } from "@/components/ui/badge";
import ConfirmDialog from "@/components/confirmMessage";
import { PlanPermissionErrorCard } from "@/components/restaurant/plan-permission-error-card";
import { toast } from "sonner";

/** Print-only CSS: 5cm×5cm QR + label (title/subtitle) below. Stickers stacked on same page, no blank pages. */
const LABEL_PRINT_STYLES = `
  .print-container {
    display: flex; flex-direction: column; align-items: center; gap: 6mm;
    padding: 0; margin: 0; background: #fff; color: #000;
  }
  .label-sticker {
    width: 5cm; min-height: 6cm; box-sizing: border-box;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
    padding: 5mm; border: 1px solid #ccc; border-radius: 4mm;
    margin: 0; overflow: hidden;
    page-break-inside: avoid; break-inside: avoid;
  }
  .label-sticker .label-qr-box {
    width: 100%; height: 4cm; max-width: 4cm; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .label-qr-wrap {
    position: relative;
    width: 100%;
    max-width: 4cm;
    aspect-ratio: 1;
    max-height: 4cm;
    margin: 0 auto;
  }
  .label-qr-wrap .qr-base {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .label-qr-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .label-qr-badge {
    background: #fff;
    border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .label-sticker .label-caption {
    width: 100%; margin-top: 3mm; padding: 0; box-sizing: border-box;
    font-size: 9pt; line-height: 1.3; text-align: center; font-weight: bold;
    color: #000; min-height: 8mm;
  }
  .label-sticker .label-caption .title { font-size: 8pt; font-weight: bold; }
  .label-sticker .label-caption .subtitle { font-size: 7pt; font-weight: normal; margin-top: 0.5mm; }
  @media print {
    @page { size: auto; margin: 8mm; }
    body { margin: 0; padding: 0; background: #fff; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-container { padding: 0; gap: 6mm; }
    .label-sticker { border: 1px solid #999; border-radius: 4mm; }
  }
`;

/** Inline SVG data-URIs for print (print window has no React / Lucide). */
const PRINT_DRINK_ICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2"/><path d="M10 2v2"/><path d="M14 2v2"/></svg>'
)}`;
const PRINT_MEAL_ICON_DATA_URI = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L22 21"/><path d="m2 2 20 20"/><path d="M4.5 4.5 12 12"/></svg>'
)}`;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

/** Print popup document is about:blank — relative /uploads or /branding URLs must be absolute. */
function absoluteUrlForPrint(href: string): string {
  const v = href.trim();
  if (!v) return v;
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("data:")) {
    return v;
  }
  if (typeof window === "undefined") return v;
  const origin = window.location.origin;
  return v.startsWith("/") ? `${origin}${v}` : `${origin}/${v}`;
}

type PrintStickerOverlay =
  | { kind: "icon"; which: "drink" | "meal" }
  | { kind: "logo"; src: string };

const PRINT_QR_PIXEL = 300;

function buildPrintQrBlock(
  imgSrc: string,
  overlay: PrintStickerOverlay | null | undefined
): string {
  const safeSrc = escapeAttr(imgSrc);
  const px = PRINT_QR_PIXEL;
  if (!overlay) {
    return `<div class="label-qr-wrap"><img class="qr-base" src="${safeSrc}" width="${px}" height="${px}" alt="" /></div>`;
  }
  if (overlay.kind === "icon") {
    const badge = centerOverlaySize(px, "icon");
    const inner = Math.round(badge * 0.72);
    const iconSrc =
      overlay.which === "drink"
        ? PRINT_DRINK_ICON_DATA_URI
        : PRINT_MEAL_ICON_DATA_URI;
    return `<div class="label-qr-wrap"><img class="qr-base" src="${safeSrc}" width="${px}" height="${px}" alt="" /><div class="label-qr-overlay"><div class="label-qr-badge" style="width:${badge}px;height:${badge}px;"><img src="${escapeAttr(iconSrc)}" width="${inner}" height="${inner}" alt="" /></div></div></div>`;
  }
  const badge = centerOverlaySize(px, "logo");
  const safeLogo = escapeAttr(overlay.src);
  return `<div class="label-qr-wrap"><img class="qr-base" src="${safeSrc}" width="${px}" height="${px}" alt="" /><div class="label-qr-overlay"><div class="label-qr-badge" style="width:${badge}px;height:${badge}px;"><img src="${safeLogo}" alt="" style="max-width:90%;max-height:90%;width:auto;height:auto;object-fit:contain;" /></div></div></div>`;
}

/** Build print window with only label stickers stacked vertically; wait for images then print. */
function printLabelStickers(
  stickers: {
    imgSrc: string;
    title: string;
    subtitle: string;
    overlay?: PrintStickerOverlay | null;
  }[],
  styles: string
) {
  const stickersHtml = stickers
    .map(
      (s) => `
    <div class="label-sticker">
      <div class="label-qr-box">
        ${buildPrintQrBlock(s.imgSrc, s.overlay)}
      </div>
      <div class="label-caption">
        <div class="title">${escapeHtml(s.title)}</div>
        <div class="subtitle">${escapeHtml(s.subtitle)}</div>
      </div>
    </div>`
    )
    .join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Print QR Labels</title><style>${styles}</style></head><body><div class="print-container">${stickersHtml}</div></body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  const doc = win.document;
  const imgs = doc.querySelectorAll(".print-container img");
  const waitAll = Array.from(imgs).map(
    (img) =>
      new Promise<void>((resolve) => {
        const el = img as HTMLImageElement;
        if (el.complete) resolve();
        else el.onload = () => resolve();
        el.onerror = () => resolve();
      })
  );
  Promise.all(waitAll).then(() => {
    win.focus();
    win.print();
    win.close();
  });
}
function escapeHtml(text: string) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

function buildPaymentQrPayload(restaurantId: string, restaurantName: string) {
  const englishName = restaurantName.trim().replace(/\s+/g, " ");
  return `PAYMENT::${restaurantId}::${englishName}`;
}

/** High ECC so a small center mark (icon/logo) does not break scanning (goqr.me API). */
function qrServerUrl(data: string, size: number) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&ecc=H&data=${encodeURIComponent(data)}`;
}

function noxLogoSrc() {
  const u = process.env.NEXT_PUBLIC_NOX_LOGO_URL?.trim();
  if (u && u.length > 0) return u;
  return "/branding/nox-logo.png";
}

/** Backend often stores `/uploads/...`; browser must load from API host, not the Next.js origin. */
function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const api =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "https://localhost:5000/api";
  const base = api.replace(/\/api\/?$/, "");
  const pathClean = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${pathClean}`;
}

/** ~13% icon / ~17% logo at ecc=H — larger than before but still within typical safe range. */
function centerOverlaySize(size: number, kind: "icon" | "logo") {
  if (kind === "icon") {
    return Math.min(52, Math.max(28, Math.round(size * 0.13)));
  }
  return Math.min(68, Math.max(36, Math.round(size * 0.168)));
}

/** Small center island on top of QR; pair with qrServerUrl (ecc=H). */
function QrCodeWithCenterMark({
  qrData,
  size,
  alt,
  onLoad,
  center,
  centerKind,
}: {
  qrData: string;
  size: number;
  alt: string;
  onLoad?: () => void;
  center: ReactNode;
  centerKind: "icon" | "logo";
}) {
  const badge = centerOverlaySize(size, centerKind);
  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: size, height: size }}
    >
      <img
        src={qrServerUrl(qrData, size)}
        width={size}
        height={size}
        alt={alt}
        className="block h-full w-full object-contain"
        onLoad={onLoad}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/10"
          style={{ width: badge, height: badge }}
        >
          {centerKind === "icon" ? (
            <div className="flex h-[72%] w-[72%] items-center justify-center [&_svg]:h-full [&_svg]:w-full">
              {center}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-0.5">
              {center}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuQrCenterLogo({ logoRaw }: { logoRaw: string | null | undefined }) {
  const resolved = useMemo(() => resolveMediaUrl(logoRaw), [logoRaw]);
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [resolved]);
  if (!resolved || imgFailed) {
    return (
      <Store
        className="max-h-[90%] max-w-[90%] text-muted-foreground"
        strokeWidth={2}
        aria-hidden
      />
    );
  }
  return (
    <img
      src={resolved}
      alt=""
      className="max-h-[90%] max-w-[90%] object-contain"
      onError={() => setImgFailed(true)}
    />
  );
}

function PaymentQrCenterLogo() {
  const primary = noxLogoSrc();
  const [src, setSrc] = useState(primary);
  useEffect(() => {
    setSrc(primary);
  }, [primary]);
  return (
    <img
      src={src}
      alt=""
      className="max-h-[90%] max-w-[90%] object-contain"
      onError={() =>
        setSrc((prev) =>
          prev.endsWith("nox-logo.svg") ? prev : "/branding/nox-logo.svg"
        )
      }
    />
  );
}

function PrintableFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="label-sticker border rounded-lg p-3 sm:p-4 w-full max-w-[320px] bg-white text-black">
      <div className="label-qr-box flex justify-center items-center min-h-[200px]">
        {children}
      </div>
      <div className="label-caption text-center space-y-0.5 mt-2">
        <div className="text-lg font-bold">{title}</div>
        {subtitle ? (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

export function QRCodeManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useAppSelector((s) => s.restaurantAccount);
  const printRef = useRef<HTMLDivElement>(null);
  const drinkRef = useRef<HTMLDivElement>(null);
  const mealRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshEnabledRef = useRef<boolean>(false);
  const [drinkImgLoaded, setDrinkImgLoaded] = useState(false);
  const [mealImgLoaded, setMealImgLoaded] = useState(false);
  const [menuImgLoaded, setMenuImgLoaded] = useState(false);
  const [paymentImgLoaded, setPaymentImgLoaded] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  useEffect(() => {
    setDrinkImgLoaded(false);
    setMealImgLoaded(false);
    setMenuImgLoaded(false);
    setPaymentImgLoaded(false);
  }, [data?.qrCode_drink, data?.qrCode_meal, data?.id]);

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const menuUrl = useMemo(() => {
    if (!data?.id) return "";
    // Public menu URL generated from restaurant id
    return `${appBaseUrl}/menu/${data.id}`;
  }, [appBaseUrl, data?.id]);
  const paymentQrValue = useMemo(() => {
    if (!data?.id) return "";
    return buildPaymentQrPayload(data.id, data.name ?? "Restaurant");
  }, [data?.id, data?.name]);

  const handlePrint = () => {
    const stickers: {
      imgSrc: string;
      title: string;
      subtitle: string;
      overlay?: PrintStickerOverlay | null;
    }[] = [];
    const name = data?.name ?? "Restaurant";
    const menuLogoResolved = resolveMediaUrl(data?.logo);
    if (data?.qrCode_drink) {
      stickers.push({
        imgSrc: qrServerUrl(data.qrCode_drink, 300),
        title: name,
        subtitle: t("dashboard.qrCodes.drinkQR"),
        overlay: { kind: "icon", which: "drink" },
      });
    }
    if (data?.qrCode_meal) {
      stickers.push({
        imgSrc: qrServerUrl(data.qrCode_meal, 300),
        title: name,
        subtitle: t("dashboard.qrCodes.mealQR"),
        overlay: { kind: "icon", which: "meal" },
      });
    }
    if (menuUrl) {
      stickers.push({
        imgSrc: qrServerUrl(menuUrl, 300),
        title: name,
        subtitle: t("dashboard.qrCodes.menuQR"),
        overlay:
          menuLogoResolved != null
            ? { kind: "logo", src: menuLogoResolved }
            : null,
      });
    }
    if (paymentQrValue) {
      stickers.push({
        imgSrc: qrServerUrl(paymentQrValue, 300),
        title: name,
        subtitle: t("dashboard.qrCodes.paymentQR"),
        overlay: {
          kind: "logo",
          src: absoluteUrlForPrint(noxLogoSrc()),
        },
      });
    }
    if (stickers.length === 0) return;
    printLabelStickers(stickers, LABEL_PRINT_STYLES);
  };

  const needDrink = !!data?.qrCode_drink;
  const needMeal = !!data?.qrCode_meal;
  const needMenu = !!menuUrl;
  const needPayment = !!paymentQrValue;
  const mainPrintReady =
    (!needDrink || drinkImgLoaded) &&
    (!needMeal || mealImgLoaded) &&
    (!needMenu || menuImgLoaded) &&
    (!needPayment || paymentImgLoaded);

  const runRegenerate = async () => {
    setRegenerateLoading(true);
    try {
      const res: any = await dispatch(regenerateRestaurantQr());
      if (res?.type?.endsWith?.("fulfilled")) {
        toast.success(t("dashboard.qrCodes.regenerateSuccess"));
      } else {
        const msg = res?.payload?.message ?? res?.error?.message ?? t("dashboard.qrCodes.regenerateError");
        toast.error(typeof msg === "string" ? msg : t("dashboard.qrCodes.regenerateError"));
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? t("dashboard.qrCodes.regenerateError");
      toast.error(typeof msg === "string" ? msg : t("dashboard.qrCodes.regenerateError"));
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleRegenerate = async () => {
    await runRegenerate();
  };

  const handlePrintSingle = (type: "drink" | "meal" | "menu" | "payment") => {
    const name = data?.name ?? "Restaurant";
    let imgSrc = "";
    let subtitle = "";
    let overlay: PrintStickerOverlay | null = null;
    if (type === "drink" && data?.qrCode_drink) {
      imgSrc = qrServerUrl(data.qrCode_drink, 300);
      subtitle = t("dashboard.qrCodes.drinkQR");
      overlay = { kind: "icon", which: "drink" };
    } else if (type === "meal" && data?.qrCode_meal) {
      imgSrc = qrServerUrl(data.qrCode_meal, 300);
      subtitle = t("dashboard.qrCodes.mealQR");
      overlay = { kind: "icon", which: "meal" };
    } else if (type === "menu" && menuUrl) {
      imgSrc = qrServerUrl(menuUrl, 300);
      subtitle = t("dashboard.qrCodes.menuQR");
      const r = resolveMediaUrl(data?.logo);
      overlay = r ? { kind: "logo", src: r } : null;
    } else if (type === "payment" && paymentQrValue) {
      imgSrc = qrServerUrl(paymentQrValue, 300);
      subtitle = t("dashboard.qrCodes.paymentQR");
      overlay = { kind: "logo", src: absoluteUrlForPrint(noxLogoSrc()) };
    }
    if (!imgSrc) return;
    printLabelStickers([{ imgSrc, title: name, subtitle, overlay }], LABEL_PRINT_STYLES);
  };

  // Auto-refresh QR (drink/meal) every 5 minutes when enabled
  const setAutoRefresh = (enabled: boolean) => {
    autoRefreshEnabledRef.current = enabled;
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    if (enabled) {
      autoRefreshRef.current = setInterval(() => {
        if (autoRefreshEnabledRef.current) {
          runRegenerate();
        }
      }, 5 * 60 * 1000);
    }
  };

  return (
    <div className="w-full min-w-0 p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground break-words">
            {t("dashboard.qrCodes.title")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground break-words mt-0.5">
            {t("dashboard.qrCodes.description")}
          </p>
        </div>
      </div>

      <div className="w-full min-w-0 space-y-4 sm:space-y-6 mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end w-full min-w-0">
            <div className="flex items-center gap-2 order-first sm:order-none">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {t("dashboard.qrCodes.autoRefresh")}
              </span>
              <Switch
                onCheckedChange={(checked) => setAutoRefresh(!!checked)}
                aria-label="Auto refresh QR every 5 minutes"
              />
              {regenerateLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isLoading || regenerateLoading}
                size="sm"
                className="flex-1 sm:flex-none min-w-0 text-xs sm:text-sm"
              >
                {regenerateLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5 sm:mr-2 shrink-0" />
                    {t("dashboard.qrCodes.regenerateDrinkMeal")}
                  </>
                ) : (
                  t("dashboard.qrCodes.regenerateDrinkMeal")
                )}
              </Button>
              <Button
                onClick={handlePrint}
                size="sm"
                className="flex-1 sm:flex-none min-w-0 text-xs sm:text-sm"
                disabled={!mainPrintReady}
                title={!mainPrintReady ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR images to load" : undefined}
              >
                {t("dashboard.qrCodes.printAll")}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full min-w-0" ref={printRef}>
            <Card className="w-full min-w-0 overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">
                  {t("dashboard.qrCodes.loyaltySectionTitle")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("dashboard.qrCodes.loyaltySectionDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full min-w-0">
                  <div className="flex flex-col items-center min-w-0">
                    <p className="text-sm font-semibold text-foreground text-center">
                      {t("dashboard.qrCodes.drinkQR")}
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1 mb-3 px-1">
                      {t("dashboard.qrCodes.scanToCollectDrink")}{" "}
                      {data?.name ?? t("dashboard.qrCodes.drinkQR")}
                    </p>
                    <div ref={drinkRef} className="frame w-full max-w-[300px] mx-auto">
                      <PrintableFrame
                        title={data?.name ?? "Restaurant"}
                        subtitle={t("dashboard.qrCodes.drinkQR")}
                      >
                        {data?.qrCode_drink ? (
                          <QrCodeWithCenterMark
                            qrData={data.qrCode_drink}
                            size={240}
                            alt={t("dashboard.qrCodes.drinkQR")}
                            onLoad={() => setDrinkImgLoaded(true)}
                            centerKind="icon"
                            center={
                              <Coffee
                                className="text-amber-800"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                            }
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {t("dashboard.qrCodes.noDrinkQRAvailable")}
                          </div>
                        )}
                      </PrintableFrame>
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => handlePrintSingle("drink")}
                        disabled={!data?.qrCode_drink}
                        title={
                          !data?.qrCode_drink
                            ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR"
                            : undefined
                        }
                      >
                        {t("dashboard.qrCodes.print")}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="text-xs sm:text-sm">
                            {t("dashboard.qrCodes.fullscreen")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100vw-2rem)] max-w-[640px]">
                          <DialogHeader>
                            <DialogTitle>{t("dashboard.qrCodes.drinkQR")}</DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            {data?.qrCode_drink ? (
                              <QrCodeWithCenterMark
                                qrData={data.qrCode_drink}
                                size={512}
                                alt={t("dashboard.qrCodes.drinkQR")}
                                centerKind="icon"
                                center={
                                  <Coffee
                                    className="text-amber-800"
                                    strokeWidth={2.25}
                                    aria-hidden
                                  />
                                }
                              />
                            ) : null}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="flex flex-col items-center min-w-0">
                    <p className="text-sm font-semibold text-foreground text-center">
                      {t("dashboard.qrCodes.mealQR")}
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1 mb-3 px-1">
                      {t("dashboard.qrCodes.scanToCollectMeal")}{" "}
                      {data?.name ?? t("dashboard.qrCodes.mealQR")}
                    </p>
                    <div ref={mealRef} className="frame w-full max-w-[300px] mx-auto">
                      <PrintableFrame
                        title={data?.name ?? "Restaurant"}
                        subtitle={t("dashboard.qrCodes.mealQR")}
                      >
                        {data?.qrCode_meal ? (
                          <QrCodeWithCenterMark
                            qrData={data.qrCode_meal}
                            size={240}
                            alt={t("dashboard.qrCodes.mealQR")}
                            onLoad={() => setMealImgLoaded(true)}
                            centerKind="icon"
                            center={
                              <UtensilsCrossed
                                className="text-emerald-700"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                            }
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {t("dashboard.qrCodes.noMealQRAvailable")}
                          </div>
                        )}
                      </PrintableFrame>
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => handlePrintSingle("meal")}
                        disabled={!data?.qrCode_meal}
                        title={
                          !data?.qrCode_meal
                            ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR"
                            : undefined
                        }
                      >
                        {t("dashboard.qrCodes.print")}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="text-xs sm:text-sm">
                            {t("dashboard.qrCodes.fullscreen")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100vw-2rem)] max-w-[640px]">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                              {t("dashboard.qrCodes.mealQR")}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            {data?.qrCode_meal ? (
                              <QrCodeWithCenterMark
                                qrData={data.qrCode_meal}
                                size={512}
                                alt={t("dashboard.qrCodes.mealQR")}
                                centerKind="icon"
                                center={
                                  <UtensilsCrossed
                                    className="text-emerald-700"
                                    strokeWidth={2.25}
                                    aria-hidden
                                  />
                                }
                              />
                            ) : null}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full min-w-0 overflow-hidden">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg">
                  {t("dashboard.qrCodes.paymentMenuSectionTitle")}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {t("dashboard.qrCodes.paymentMenuSectionDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 w-full min-w-0">
                  <div className="flex flex-col items-center min-w-0">
                    <p className="text-sm font-semibold text-foreground text-center">
                      {t("dashboard.qrCodes.paymentQR")}
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1 mb-3 px-1">
                      {t("dashboard.qrCodes.paymentQRScanHint")}
                    </p>
                    <div className="frame w-full max-w-[300px] mx-auto">
                      <PrintableFrame
                        title={data?.name ?? "Restaurant"}
                        subtitle={t("dashboard.qrCodes.paymentQR")}
                      >
                        {paymentQrValue ? (
                          <QrCodeWithCenterMark
                            qrData={paymentQrValue}
                            size={240}
                            alt={t("dashboard.qrCodes.paymentQR")}
                            onLoad={() => setPaymentImgLoaded(true)}
                            centerKind="logo"
                            center={<PaymentQrCenterLogo />}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground text-center px-2">
                            {t("dashboard.qrCodes.paymentQRNotAvailable")}
                          </div>
                        )}
                      </PrintableFrame>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground break-all text-center w-full max-w-[300px] mx-auto px-1">
                      {paymentQrValue}
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => handlePrintSingle("payment")}
                        disabled={!paymentQrValue}
                      >
                        {t("dashboard.qrCodes.print")}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="text-xs sm:text-sm">
                            {t("dashboard.qrCodes.fullscreen")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100vw-2rem)] max-w-[640px]">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                              {t("dashboard.qrCodes.paymentQR")}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            {paymentQrValue ? (
                              <QrCodeWithCenterMark
                                qrData={paymentQrValue}
                                size={512}
                                alt={t("dashboard.qrCodes.paymentQR")}
                                centerKind="logo"
                                center={<PaymentQrCenterLogo />}
                              />
                            ) : null}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="flex flex-col items-center min-w-0">
                    <p className="text-sm font-semibold text-foreground text-center">
                      {t("dashboard.qrCodes.menuQR")}
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1 mb-3 px-1">
                      {t("dashboard.qrCodes.scanToViewMenu")} {data?.name ?? ""}
                    </p>
                    <div ref={menuRef} className="frame w-full max-w-[300px] mx-auto">
                      <PrintableFrame
                        title={data?.name ?? "Restaurant"}
                        subtitle={t("dashboard.qrCodes.menuQR")}
                      >
                        {menuUrl ? (
                          <QrCodeWithCenterMark
                            qrData={menuUrl}
                            size={240}
                            alt={t("dashboard.qrCodes.menuQR")}
                            onLoad={() => setMenuImgLoaded(true)}
                            centerKind="logo"
                            center={<MenuQrCenterLogo logoRaw={data?.logo} />}
                          />
                        ) : (
                          <div className="text-sm text-muted-foreground text-center px-2">
                            {t("dashboard.qrCodes.menuUrlNotAvailable")}
                          </div>
                        )}
                      </PrintableFrame>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground break-all text-center w-full max-w-[300px] mx-auto px-1">
                      {menuUrl}
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                        onClick={() => handlePrintSingle("menu")}
                        disabled={!menuUrl}
                        title={
                          !menuUrl
                            ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR"
                            : undefined
                        }
                      >
                        {t("dashboard.qrCodes.print")}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="text-xs sm:text-sm">
                            {t("dashboard.qrCodes.fullscreen")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100vw-2rem)] max-w-[640px]">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg">
                              {t("dashboard.qrCodes.menuQR")}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="flex justify-center">
                            {menuUrl ? (
                              <QrCodeWithCenterMark
                                qrData={menuUrl}
                                size={512}
                                alt={t("dashboard.qrCodes.menuQR")}
                                centerKind="logo"
                                center={<MenuQrCenterLogo logoRaw={data?.logo} />}
                              />
                            ) : null}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
            <Card className="min-w-0 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Codes</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </div>
  );
}

// Table Card Component
function TableCard({
  table,
  restaurantLogo,
  onEdit,
  onDelete,
  onSessionToggle,
  onPrintTable,
  printElement,
  t,
}: {
  table: Table;
  restaurantLogo?: string | null;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  onSessionToggle: (table: Table, isSessionOpen: boolean) => void;
  onPrintTable: (table: Table) => void;
  printElement?: (el: HTMLElement) => void;
  t: any;
}) {
  const handlePrint = () => {
    if (onPrintTable) onPrintTable(table);
    else if (printElement && tableRef.current) printElement(tableRef.current);
  };
  const tableRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => setImageLoaded(false), [table.id]);

  return (
    <Card className="hover:shadow-md transition-shadow w-full min-w-0 overflow-hidden">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between min-w-0">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
              <span className="break-words">{table.name}</span>
              {!table.isActive && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  {t("dashboard.tables.inactive") || "Inactive"}
                </Badge>
              )}
              <Badge
                variant={table.isSessionOpen ? "default" : "secondary"}
                className="text-xs shrink-0"
              >
                {table.isSessionOpen
                  ? t("dashboard.tables.sessionOpen") || "Session open"
                  : t("dashboard.tables.sessionClosed") || "Session closed"}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              {t("dashboard.tables.tableNumber") || "Table"} #{table.number}
            </CardDescription>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(table)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onDelete(table)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="flex justify-center gap-2 mb-3 sm:mb-4">
          <Button
            variant={table.isSessionOpen ? "outline" : "default"}
            size="sm"
            onClick={() => onSessionToggle(table, !table.isSessionOpen)}
          >
            {table.isSessionOpen
              ? t("dashboard.tables.closeSession") || "Close session"
              : t("dashboard.tables.openSession") || "Open session"}
          </Button>
        </div>
        <div className="flex justify-center mb-3 sm:mb-4 min-w-0">
          <div ref={tableRef} className="frame w-full max-w-[320px]">
            <PrintableFrame
              title={table.name}
              subtitle={`${t("dashboard.tables.tableNumber") || "Table"} #${
                table.number
              }`}
            >
              <QrCodeWithCenterMark
                qrData={table.qrCode}
                size={200}
                alt={table.name}
                onLoad={() => setImageLoaded(true)}
                centerKind="logo"
                center={<MenuQrCenterLogo logoRaw={restaurantLogo} />}
              />
            </PrintableFrame>
          </div>
        </div>
        <div className="text-xs text-muted-foreground break-all text-center mb-2">
          {table.qrCode}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm"
            onClick={handlePrint}
            disabled={!imageLoaded}
            title={!imageLoaded ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR to load" : undefined}
          >
            {t("dashboard.qrCodes.print") || "Print"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="text-xs sm:text-sm">
                {t("dashboard.qrCodes.fullscreen") || "Fullscreen"}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-[640px]">
              <DialogHeader>
                <DialogTitle>{table.name}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <QrCodeWithCenterMark
                  qrData={table.qrCode}
                  size={512}
                  alt={table.name}
                  centerKind="logo"
                  center={<MenuQrCenterLogo logoRaw={restaurantLogo} />}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

const PLAN_PERMISSION_CODES = [
  "PLAN_PERMISSION_REQUIRED",
  "NO_ACTIVE_SUBSCRIPTION",
];

// Tables Management Component – exported for standalone table-codes page
export function TablesManagement({
  restaurantId,
  restaurantLogo,
}: {
  restaurantId: string;
  restaurantLogo?: string | null;
}) {
  const { t, i18n } = useTranslation();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [tablesErrorCode, setTablesErrorCode] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableCount, setTableCount] = useState(1);
  const [tableName, setTableName] = useState("Table");
  const [editTableName, setEditTableName] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsSessionOpen, setEditIsSessionOpen] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadTables();
    }
  }, [restaurantId]);

  const tableStickerLogoSrc = useMemo(() => {
    const r = resolveMediaUrl(restaurantLogo);
    if (!r) return null;
    return absoluteUrlForPrint(r);
  }, [restaurantLogo]);

  const loadTables = async () => {
    setLoading(true);
    setTablesError(null);
    setTablesErrorCode(null);
    try {
      const response = await tablesService.getTables();
      setTables(response.data);
    } catch (error: any) {
      console.error("Error loading tables:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to load tables";
      const code = data?.code;
      setTablesError(message);
      setTablesErrorCode(code ?? null);
      if (!code || !PLAN_PERMISSION_CODES.includes(code)) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTables = async () => {
    if (!tableCount || tableCount < 1 || tableCount > 1000) {
      toast.error(
        t("dashboard.tables.invalidCount") || "Count must be between 1 and 1000"
      );
      return;
    }

    try {
      await tablesService.createTables({
        count: tableCount,
        name: tableName || undefined,
      });
      await loadTables();
      setIsCreateDialogOpen(false);
      setTableCount(1);
      setTableName("Table");
      toast.success(
        t("dashboard.tables.tablesCreated") || "Tables created successfully!"
      );
    } catch (error: any) {
      console.error("Error creating tables:", error);
      const data = error?.response?.data;
      const code = data?.code;
      const message =
        data?.message || error?.message || "Failed to create tables";
      if (code && PLAN_PERMISSION_CODES.includes(code)) {
        setTablesError(message);
        setTablesErrorCode(code);
      } else {
        toast.error(message);
      }
    }
  };

  const handleEditTable = async () => {
    if (!selectedTable) return;

    try {
      await tablesService.updateTable(selectedTable.id, {
        name: editTableName,
        isActive: editIsActive,
        isSessionOpen: editIsSessionOpen,
      });
      await loadTables();
      setIsEditDialogOpen(false);
      setSelectedTable(null);
      toast.success(
        t("dashboard.tables.tableUpdated") || "Table updated successfully!"
      );
    } catch (error: any) {
      console.error("Error updating table:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to update table";
      if (data?.code && PLAN_PERMISSION_CODES.includes(data.code)) {
        setTablesError(message);
        setTablesErrorCode(data.code);
      } else {
        toast.error(message);
      }
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;

    try {
      await tablesService.deleteTable(selectedTable.id);
      await loadTables();
      setIsDeleteDialogOpen(false);
      setSelectedTable(null);
      toast.success(
        t("dashboard.tables.tableDeleted") || "Table deleted successfully!"
      );
    } catch (error: any) {
      console.error("Error deleting table:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to delete table";
      if (data?.code && PLAN_PERMISSION_CODES.includes(data.code)) {
        setTablesError(message);
        setTablesErrorCode(data.code);
      } else {
        toast.error(message);
      }
    }
  };

  const openEditDialog = (table: Table) => {
    setSelectedTable(table);
    setEditTableName(table.name);
    setEditIsActive(table.isActive);
    setEditIsSessionOpen(table.isSessionOpen);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (table: Table) => {
    setSelectedTable(table);
    setIsDeleteDialogOpen(true);
  };

  const handleSessionToggle = async (table: Table, isSessionOpen: boolean) => {
    try {
      await tablesService.updateTable(table.id, { isSessionOpen });
      await loadTables();
      const msg = isSessionOpen
        ? t("dashboard.tables.sessionOpened") ||
          "Session opened for this table."
        : t("dashboard.tables.sessionClosedMsg") ||
          "Session closed for this table.";
      toast.success(msg);
    } catch (error: any) {
      console.error("Error updating table session:", error);
      const data = error?.response?.data;
      const message =
        data?.message || error?.message || "Failed to update session";
      if (data?.code && PLAN_PERMISSION_CODES.includes(data.code)) {
        setTablesError(message);
        setTablesErrorCode(data.code);
      } else {
        toast.error(message);
      }
    }
  };

  const handlePrintSingleTable = (table: Table) => {
    const tableLabel = t("dashboard.tables.tableNumber") || "Table";
    printLabelStickers(
      [
        {
          imgSrc: qrServerUrl(table.qrCode, 300),
          title: table.name,
          subtitle: `${tableLabel} #${table.number}`,
          overlay:
            tableStickerLogoSrc != null
              ? { kind: "logo", src: tableStickerLogoSrc }
              : null,
        },
      ],
      LABEL_PRINT_STYLES
    );
  };

  const handlePrintAllTables = () => {
    if (tables.length === 0) return;
    const tableLabel = t("dashboard.tables.tableNumber") || "Table";
    const overlay =
      tableStickerLogoSrc != null
        ? ({ kind: "logo" as const, src: tableStickerLogoSrc })
        : null;
    const stickers = tables.map((table) => ({
      imgSrc: qrServerUrl(table.qrCode, 300),
      title: table.name,
      subtitle: `${tableLabel} #${table.number}`,
      overlay,
    }));
    printLabelStickers(stickers, LABEL_PRINT_STYLES);
  };

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (loading && tables.length === 0 && !tablesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tablesError) {
    return (
      <PlanPermissionErrorCard
        error={tablesError}
        errorCode={tablesErrorCode}
        upgradePlanHintKey="dashboard.tables.upgradePlanHint"
        upgradePlanHintFallback="Your current plan does not include Table QR codes. Subscribe or upgrade your plan to create and manage table codes."
        goToSubscriptionKey="dashboard.tables.goToSubscription"
        goToSubscriptionFallback="Go to Subscription"
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold break-words">
            {t("dashboard.tables.title") || "Table Management"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground break-words mt-0.5">
            {t("dashboard.tables.description") ||
              "Create and manage table QR codes"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {tables.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
              onClick={handlePrintAllTables}
              disabled={tables.length === 0}
              title={
                tables.length === 0
                  ? t("dashboard.qrCodes.waitForQrLoad") || "Waiting for QR images to load"
                  : undefined
              }
            >
              <Printer className="h-4 w-4 mr-1.5 sm:mr-2" />
              {t("dashboard.tables.printAll")}
            </Button>
          )}
          <Button size="sm" className="text-xs sm:text-sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5 sm:mr-2" />
            {t("dashboard.tables.createTables") || "Create Tables"}
          </Button>
        </div>
      </div>

      {tables.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t("dashboard.tables.noTables") || "No tables found"}
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.tables.createFirstTable") ||
                  "Create Your First Table"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              restaurantLogo={restaurantLogo}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onSessionToggle={handleSessionToggle}
              onPrintTable={handlePrintSingleTable}
              printElement={(_el: HTMLElement) => handlePrintSingleTable(table)}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Create Tables Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.tables.createTables") || "Create Tables"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="count">
                {t("dashboard.tables.numberOfTables") || "Number of Tables"}
              </Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="1000"
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="name">
                {t("dashboard.tables.tableNamePrefix") ||
                  "Table Name Prefix (Optional)"}
              </Label>
              <Input
                id="name"
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Table"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button onClick={handleCreateTables}>
                {t("dashboard.tables.create") || "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.tables.editTable") || "Edit Table"}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">
                  {t("dashboard.tables.tableName") || "Table Name"}
                </Label>
                <Input
                  id="editName"
                  type="text"
                  value={editTableName}
                  onChange={(e) => setEditTableName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="editActive"
                  checked={editIsActive}
                  onCheckedChange={setEditIsActive}
                />
                <Label htmlFor="editActive">
                  {t("dashboard.tables.isActive") || "Active"}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  id="editSessionOpen"
                  checked={editIsSessionOpen}
                  onCheckedChange={setEditIsSessionOpen}
                />
                <Label htmlFor="editSessionOpen">
                  {t("dashboard.tables.sessionOpen") || "Session open"}
                </Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("common.cancel") || "Cancel"}
                </Button>
                <Button onClick={handleEditTable}>
                  {t("common.save") || "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        title={t("dashboard.tables.deleteTable") || "Delete Table"}
        message={
          t("dashboard.tables.deleteTableConfirm") ||
          `Are you sure you want to delete ${selectedTable?.name}? This action cannot be undone.`
        }
        onConfirm={handleDeleteTable}
      />
    </div>
  );
}
