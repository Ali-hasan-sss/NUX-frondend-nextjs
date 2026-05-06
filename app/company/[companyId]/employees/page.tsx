"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, QrCode, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { companyOwnerApi, type CompanyDetail } from "@/features/company/companyOwnerApi";

function extractUserCode(raw: string): string {
  const text = raw.trim();
  if (!text) return "";
  const match = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return match?.[0] ?? text;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

export default function CompanyEmployeesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const companyId = String(params.companyId ?? "");

  const [data, setData] = useState<CompanyDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addUserCode, setAddUserCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [scanOpen, setScanOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanReady, setScanReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const canUseBarcodeDetector = useMemo(
    () => typeof window !== "undefined" && "BarcodeDetector" in window,
    []
  );

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const c = await companyOwnerApi.getCompany(companyId);
      setData(c);
    } catch {
      setLoadError(t("companyPortal.loadError"));
    }
  }, [companyId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const stopScanner = useCallback(() => {
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanReady(false);
  }, []);

  useEffect(() => {
    if (!scanOpen) {
      stopScanner();
      return;
    }
    let cancelled = false;
    const start = async () => {
      setScanError(null);
      if (!canUseBarcodeDetector) {
        setScanError(t("companyPortal.scanNotSupported"));
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanReady(true);

        const detector = new (window as unknown as { BarcodeDetector: new (...args: unknown[]) => {
          detect: (input: HTMLVideoElement) => Promise<Array<{ rawValue?: string }>>;
        } }).BarcodeDetector({ formats: ["qr_code"] });

        const loop = async () => {
          if (!videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            const raw = codes[0]?.rawValue?.trim();
            if (raw) {
              const parsed = extractUserCode(raw);
              if (parsed) {
                setAddUserCode(parsed);
                setScanOpen(false);
                stopScanner();
                toast.success(t("companyPortal.scanSuccess"));
                return;
              }
            }
          } catch {
            // Keep scanning on transient decode failures.
          }
          rafRef.current = window.requestAnimationFrame(loop);
        };

        rafRef.current = window.requestAnimationFrame(loop);
      } catch {
        setScanError(t("companyPortal.scanCameraError"));
      }
    };

    void start();
    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [canUseBarcodeDetector, scanOpen, stopScanner, t]);

  const handleAddEmployee = async () => {
    const raw = addUserCode.trim();
    if (!raw) return;
    const payload = isUuid(raw) ? { userId: raw } : { userCode: raw };
    setAdding(true);
    try {
      await companyOwnerApi.addEmployee(companyId, payload);
      setAddUserCode("");
      toast.success(t("companyPortal.employeeAdded"));
      await load();
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      if (status === 404) toast.error(t("companyPortal.resolveUserNotFound"));
      else toast.error(t("companyPortal.employeeError"));
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!window.confirm(t("companyPortal.removeEmployee") + "?")) return;
    setRemovingId(userId);
    try {
      await companyOwnerApi.removeEmployee(companyId, userId);
      toast.success(t("companyPortal.employeeRemoved"));
      await load();
    } catch {
      toast.error(t("companyPortal.employeeError"));
    } finally {
      setRemovingId(null);
    }
  };

  if (loadError) return <p className="text-sm text-destructive">{loadError}</p>;
  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-foreground">{t("companyPortal.employeesTitle")}</h1>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap gap-2">
          <Input
            className="max-w-sm font-mono text-sm"
            placeholder={t("companyPortal.addEmployeeUserCodePlaceholder")}
            value={addUserCode}
            onChange={(e) => setAddUserCode(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          <Button type="button" onClick={() => void handleAddEmployee()} disabled={adding}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : t("companyPortal.addEmployee")}
          </Button>
          <Button type="button" variant="outline" onClick={() => setScanOpen(true)}>
            <ScanLine className="mr-2 h-4 w-4" />
            {t("companyPortal.scanEmployeeCode")}
          </Button>
        </div>
      </div>

      {!data.employees?.length ? (
        <p className="text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {data.employees.map((em) => (
            <li key={em.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-foreground">{em.user.email}</p>
                {em.user.fullName && (
                  <p className="text-xs text-muted-foreground">{em.user.fullName}</p>
                )}
                {em.user.qrCode && (
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {t("companyPortal.userCodeLabel")}: {em.user.qrCode}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={removingId === em.userId}
                onClick={() => void handleRemove(em.userId)}
              >
                {removingId === em.userId ? <Loader2 className="h-4 w-4 animate-spin" /> : t("companyPortal.removeEmployee")}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {t("companyPortal.scanEmployeeCode")}
            </DialogTitle>
            <DialogDescription>{t("companyPortal.scanEmployeeCodeHint")}</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <video ref={videoRef} className="h-72 w-full object-cover" muted playsInline />
          </div>
          {scanError ? (
            <p className="text-sm text-destructive">{scanError}</p>
          ) : !scanReady ? (
            <p className="text-sm text-muted-foreground">{t("companyPortal.scanStarting")}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("companyPortal.scanWaiting")}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

