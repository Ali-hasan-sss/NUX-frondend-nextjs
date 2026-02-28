"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { scanQrCode, fetchUserBalances } from "@/features/client";

const SCAN_AREA_SIZE = 250;
const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function isMenuLink(raw: string): boolean {
  return /\/menu\//i.test(raw.trim());
}

function parseMenuParams(raw: string): { qrCode: string; table?: number } {
  const trimmed = raw.trim();
  const uuidOnly = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
  if (uuidOnly) return { qrCode: trimmed };
  try {
    const urlString = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://dummy.example${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
    const url = new URL(urlString);
    const pathMatch = url.pathname.match(/\/menu\/([0-9a-f-]{36})/i);
    const qrCode = pathMatch ? pathMatch[1] : (trimmed.match(UUID_REGEX)?.[0] ?? trimmed);
    const tableParam = url.searchParams.get("table");
    const table =
      tableParam != null && tableParam !== ""
        ? parseInt(tableParam, 10)
        : undefined;
    const tableValid = table != null && !isNaN(table) && table > 0;
    return { qrCode, table: tableValid ? table : undefined };
  } catch {
    return { qrCode: trimmed.match(UUID_REGEX)?.[0] ?? trimmed };
  }
}

function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true }
    );
  });
}

export interface ScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScanModal({ open, onOpenChange }: ScanModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScannedRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "camera" | "processing" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopScanner = useCallback(() => {
    if (scannerRef.current && scannerRef.current.isScanning()) {
      scannerRef.current
        .stop()
        .catch(() => {});
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(() => {
    if (!containerRef.current) return;
    const id = "scan-qr-reader-" + Date.now();
    containerRef.current.innerHTML = "";
    const div = document.createElement("div");
    div.id = id;
    div.style.width = "100%";
    div.style.minHeight = "300px";
    containerRef.current.appendChild(div);

    const html5QrCode = new Html5Qrcode(id);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE },
      aspectRatio: 1,
    };

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          stopScanner();
          setStatus("processing");

          if (isMenuLink(decodedText)) {
            const { qrCode, table } = parseMenuParams(decodedText);
            const path = table != null ? `/menu/${qrCode}?table=${table}` : `/menu/${qrCode}`;
            onOpenChange(false);
            router.push(path);
            return;
          }

          if (!auth?.tokens?.accessToken) {
            toast.error(t("camera.scanMustLogin") || "Please log in to collect points");
            setStatus("error");
            setErrorMessage(t("camera.scanMustLogin") || "Please log in");
            return;
          }

          getCurrentPosition()
            .then(({ latitude, longitude }) => {
              return dispatch(
                scanQrCode({ qrCode: decodedText, latitude, longitude })
              ).unwrap();
            })
            .then(() => {
              toast.success(t("camera.scanSuccess") || "Scan successful!");
              dispatch(fetchUserBalances());
              onOpenChange(false);
            })
            .catch((err: any) => {
              const msg =
                err?.message ||
                err?.response?.data?.message ||
                t("camera.scanErrorGeneric") ||
                "Scan failed";
              if (
                err?.response?.status === 403 ||
                String(msg).toLowerCase().includes("location") ||
                String(msg).toLowerCase().includes("restaurant")
              ) {
                toast.error(t("camera.scanErrorForbidden") || "You must be at the restaurant to scan");
              } else {
                toast.error(msg);
              }
              setStatus("error");
              setErrorMessage(msg);
            });
        },
        () => {}
      )
      .then(() => setStatus("camera"))
      .catch((err) => {
        console.error("Camera start error:", err);
        setStatus("error");
        setErrorMessage(
          t("camera.cameraPermissionRequired") || "Camera access is required to scan"
        );
      });
  }, [auth?.tokens?.accessToken, dispatch, onOpenChange, router, stopScanner, t]);

  useEffect(() => {
    if (!open) {
      stopScanner();
      hasScannedRef.current = false;
      setStatus("idle");
      setErrorMessage(null);
      return;
    }
    hasScannedRef.current = false;
    setStatus("idle");
    setErrorMessage(null);
    const t = setTimeout(startScanner, 300);
    return () => {
      clearTimeout(t);
      stopScanner();
    };
  }, [open, startScanner, stopScanner]);

  const handleRetry = () => {
    hasScannedRef.current = false;
    setStatus("idle");
    setErrorMessage(null);
    startScanner();
  };

  const handleClose = () => {
    stopScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-[100vw] w-full h-[100dvh] md:max-h-[90vh] md:h-auto md:max-w-lg p-0 gap-0 overflow-hidden border-0 bg-black"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={() => handleClose()}
      >
        <div className="relative flex flex-col h-full md:min-h-[400px]">
          <div className="absolute top-4 right-4 z-10">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full h-10 w-10 bg-black/50 hover:bg-black/70 text-white border-0"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <DialogTitle className="sr-only">
            {t("home.scanCode") || "Scan Code"}
          </DialogTitle>

          <div className="relative flex-1 min-h-[300px] flex items-center justify-center bg-black">
            <div
              ref={containerRef}
              className="absolute inset-0 flex items-center justify-center [&>div]:!max-w-full [&>div]:!rounded-xl [& video]:!object-cover"
            />
            {/* Scan frame overlay - like mobile */}
            {status === "camera" && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden
              >
                <div
                  className="border-2 border-white rounded-2xl bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                  style={{
                    width: SCAN_AREA_SIZE,
                    height: SCAN_AREA_SIZE,
                  }}
                >
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-2xl" />
                </div>
              </div>
            )}

            {status === "processing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 text-white">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="text-sm font-medium">
                  {t("camera.processing") || "Processing..."}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 text-white p-6">
                <p className="text-center text-sm">{errorMessage}</p>
                <Button
                  onClick={handleRetry}
                  variant="secondary"
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {t("camera.retryScan") || "Try again"}
                </Button>
                <Button variant="ghost" onClick={handleClose} className="text-white">
                  {t("camera.cancel") || "Cancel"}
                </Button>
              </div>
            )}
          </div>

          <p className="text-center text-white/90 text-sm py-4 px-4">
            {status === "camera"
              ? t("camera.placeCodeInFrame") || "Position the QR code within the frame"
              : status === "idle"
                ? t("home.scanCodeDesc") || "Scan restaurant QR code"
                : null}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
