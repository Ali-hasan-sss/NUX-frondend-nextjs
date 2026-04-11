"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { Camera, CameraOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Props = {
  onDecoded: (raw: string) => void;
  disabled?: boolean;
};

export function PaymentQrScanner({ onDecoded, disabled }: Props) {
  const { t } = useTranslation();
  const { colors, mounted } = useClientTheme();
  const reactId = useId().replace(/:/g, "");
  const readerDomId = `payment-qr-${reactId}`;
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const html5Ref = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const q = html5Ref.current;
    if (!q) {
      setScanning(false);
      return;
    }
    try {
      await q.stop();
    } catch {
      /* already stopped */
    }
    try {
      q.clear();
    } catch {
      /* */
    }
    html5Ref.current = null;
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (disabled || !mounted) return;
    handledRef.current = false;
    setStarting(true);
    try {
      await stopScanner();
      const html5 = new Html5Qrcode(readerDomId, false);
      html5Ref.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (text) => {
          if (handledRef.current || disabled) return;
          handledRef.current = true;
          await stopScanner();
          onDecoded(text);
        },
        () => {},
      );
      setScanning(true);
    } catch {
      toast.error(t("payment.cameraStartFailed"));
      await stopScanner();
    } finally {
      setStarting(false);
    }
  }, [disabled, mounted, onDecoded, readerDomId, stopScanner, t]);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    if (disabled && scanning) void stopScanner();
  }, [disabled, scanning, stopScanner]);

  const applyManual = () => {
    const v = manual.trim();
    if (!v) return;
    onDecoded(v);
    setManual("");
  };

  if (!mounted) return null;

  return (
    <div
      className="rounded-2xl p-4 space-y-3 shadow-lg"
      style={{ backgroundColor: colors.surface }}
    >
      <div>
        <p className="text-sm font-semibold" style={{ color: colors.text }}>
          {t("payment.scanRestaurantQr")}
        </p>
        <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
          {t("payment.scanRestaurantQrHint")}
        </p>
      </div>

      <div
        className={cn(
          "relative rounded-xl overflow-hidden bg-black/10 min-h-[220px]",
          !scanning && "border border-dashed",
          disabled && "opacity-50 pointer-events-none",
        )}
        style={{ borderColor: colors.border }}
      >
        <div id={readerDomId} className="min-h-[220px] w-full" />
        {!scanning && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none px-4"
            aria-hidden
          >
            <p
              className="text-xs text-center"
              style={{ color: colors.textSecondary }}
            >
              {t("payment.cameraPreviewHint")}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {!scanning ? (
          <Button
            type="button"
            size="sm"
            disabled={disabled || starting}
            onClick={() => void startScanner()}
            style={{ backgroundColor: colors.primary, color: "#fff" }}
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Camera className="h-4 w-4 mr-2" />
            )}
            {t("payment.startCameraScan")}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => void stopScanner()}
          >
            <CameraOff className="h-4 w-4 mr-2" />
            {t("payment.stopCameraScan")}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <p
          className="text-xs font-medium"
          style={{ color: colors.textSecondary }}
        >
          {t("payment.enterCodeManually")}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={t("payment.enterCodePlaceholder")}
            disabled={disabled}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && applyManual()}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={applyManual}
          >
            {t("payment.applyCode")}
          </Button>
        </div>
      </div>
    </div>
  );
}
