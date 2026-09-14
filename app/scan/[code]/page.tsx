"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "@/components/client/i18n-provider";
import { Header } from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { scanQrCode } from "@/features/client";
import { initializeAuth } from "@/features/auth/authSlice";
import {
  isValidLoyaltyQrCode,
} from "@/lib/loyaltyQr";
import { rememberAuthRedirect } from "@/lib/authRedirect";
import { getAuthenticatedAppHome } from "@/lib/roleDashboard";

type Status = "boot" | "locating" | "scanning" | "success" | "error";

function ScanLoyaltyContent() {
  const { t } = useTranslation();
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const started = useRef(false);
  const [status, setStatus] = useState<Status>("boot");
  const [error, setError] = useState<string>("");

  const code = String(params?.code ?? "").trim();
  const scanPath = `/scan/${code}`;

  const runScan = useCallback(async () => {
    setStatus("locating");
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("geo"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        });
      });

      setStatus("scanning");
      const result = await dispatch(
        scanQrCode({
          qrCode: code,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      );

      if (scanQrCode.fulfilled.match(result)) {
        setStatus("success");
        return;
      }

      const payload = typeof result.payload === "string" ? result.payload : "";
      const lower = payload.toLowerCase();
      if (lower.includes("restaurant location") || lower.includes("must be at")) {
        setError(t("scan.errorMustBeAtRestaurant"));
      } else if (lower.includes("invalid") && lower.includes("qr")) {
        setError(t("scan.errorInvalidQrCode"));
      } else {
        setError(payload || t("scan.errorGeneric"));
      }
      setStatus("error");
    } catch (e: any) {
      const geoDenied =
        e?.code === 1 ||
        e?.code === GeolocationPositionError?.PERMISSION_DENIED;
      setError(
        geoDenied ? t("scan.errorLocationDenied") : t("scan.errorGeneric"),
      );
      setStatus("error");
    }
  }, [code, dispatch, t]);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (auth.isLoading) return;
    if (started.current) return;

    if (!isValidLoyaltyQrCode(code)) {
      started.current = true;
      setError(t("scan.errorInvalidQrCode"));
      setStatus("error");
      return;
    }

    if (!auth.isAuthenticated || !auth.user) {
      started.current = true;
      rememberAuthRedirect(scanPath);
      router.replace(`/auth/login?next=${encodeURIComponent(scanPath)}`);
      return;
    }

    if (auth.user.role !== "USER") {
      started.current = true;
      setError(t("scan.errorGuestOnly"));
      setStatus("error");
      return;
    }

    const mustVerify =
      auth.user.emailVerified === false || auth.user.emailVerified === undefined;
    if (mustVerify) {
      started.current = true;
      rememberAuthRedirect(scanPath);
      router.replace(
        `/auth/verify-email?email=${encodeURIComponent(auth.user.email ?? "")}`,
      );
      return;
    }

    started.current = true;
    void runScan();
  }, [
    auth.isAuthenticated,
    auth.isLoading,
    auth.user,
    code,
    router,
    runScan,
    scanPath,
    t,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 pt-8 pb-16 text-center">
        {status === "boot" || status === "locating" || status === "scanning" ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              {status === "locating"
                ? t("scan.checkingLocation")
                : t("scan.processing")}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {t("scan.atRestaurant")}
            </p>
          </>
        ) : null}

        {status === "success" ? (
          <>
            <CheckCircle className="h-12 w-12 text-emerald-500" />
            <h1 className="mt-4 text-xl font-semibold">{t("scan.successTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("scan.successMessage")}
            </p>
            <Button asChild className="mt-6">
              <Link href={getAuthenticatedAppHome("USER")}>{t("scan.done")}</Link>
            </Button>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-xl font-semibold">{t("scan.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  started.current = false;
                  setError("");
                  void runScan();
                }}
              >
                {t("scan.scanAnother")}
              </Button>
              <Button asChild>
                <Link href={getAuthenticatedAppHome("USER")}>{t("scan.done")}</Link>
              </Button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default function ScanLoyaltyPage() {
  return (
    <I18nProvider>
      <ScanLoyaltyContent />
    </I18nProvider>
  );
}
