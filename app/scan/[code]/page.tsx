"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "@/components/client/i18n-provider";
import { Header } from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { scanQrCode } from "@/features/client";
import { initializeAuth } from "@/features/auth/authSlice";
import { isValidLoyaltyQrCode } from "@/lib/loyaltyQr";
import { rememberAuthRedirect } from "@/lib/authRedirect";
import { getAuthenticatedAppHome } from "@/lib/roleDashboard";
import { useSocket } from "@/contexts/SocketContext";
import { balancesService } from "@/features/client/balances/balancesService";

type Status =
  | "boot"
  | "needLocation"
  | "locating"
  | "scanning"
  | "pending"
  | "success"
  | "error";

function applyResolvedStatus(
  resolved: string,
  t: (key: string) => string,
  setStatus: (s: Status) => void,
  setError: (s: string) => void,
  onApproved?: (type?: string, restaurant?: string) => void,
  extra?: { type?: string; restaurantName?: string },
) {
  const status = resolved.toUpperCase();
  if (status === "APPROVED") {
    onApproved?.(extra?.type, extra?.restaurantName);
    setStatus("success");
    return;
  }
  if (status === "REJECTED") {
    setError(t("scan.rejectedMessage"));
    setStatus("error");
    return;
  }
  if (status === "EXPIRED") {
    setError(t("scan.expiredMessage"));
    setStatus("error");
  }
}

async function queryGeoPermission(): Promise<PermissionState | "unknown"> {
  try {
    if (!navigator.permissions?.query) return "unknown";
    const result = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return result.state;
  } catch {
    return "unknown";
  }
}

function requestBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
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
}

function ScanLoyaltyContent() {
  const { t } = useTranslation();
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const { socket } = useSocket();
  const started = useRef(false);
  const [status, setStatus] = useState<Status>("boot");
  const [error, setError] = useState<string>("");
  const [locationBlocked, setLocationBlocked] = useState(false);
  const [approvalId, setApprovalId] = useState<string | null>(null);
  const [scanKind, setScanKind] = useState<"meal" | "drink">("meal");
  const [restaurantName, setRestaurantName] = useState("");

  const code = String(params?.code ?? "").trim();
  const scanPath = `/scan/${code}`;

  const goToSuccess = useCallback(
    (type?: string, restaurant?: string) => {
      const kind = type === "drink" ? "drink" : type === "meal" ? "meal" : scanKind;
      const name = (restaurant || restaurantName).trim();
      const qs = new URLSearchParams({ type: kind });
      if (name) qs.set("restaurant", name);
      router.replace(`/scan/success?${qs.toString()}`);
    },
    [restaurantName, router, scanKind],
  );

  const runScan = useCallback(async () => {
    setStatus("locating");
    setError("");
    setLocationBlocked(false);
    setApprovalId(null);
    try {
      const position = await requestBrowserLocation();

      setStatus("scanning");
      const result = await dispatch(
        scanQrCode({
          qrCode: code,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      );

      if (scanQrCode.fulfilled.match(result)) {
        const data = result.payload as {
          id?: string;
          status?: string;
          type?: string;
          restaurantName?: string;
        } | undefined;
        if (data?.type === "drink" || data?.type === "meal") {
          setScanKind(data.type);
        }
        if (data?.restaurantName) {
          setRestaurantName(data.restaurantName);
        }
        if (data?.status && data.status !== "PENDING") {
          applyResolvedStatus(
            data.status,
            t,
            setStatus,
            setError,
            goToSuccess,
            { type: data.type, restaurantName: data.restaurantName },
          );
          return;
        }
        if (data?.id) {
          setApprovalId(data.id);
          setStatus("pending");
          return;
        }
        setStatus("pending");
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
      const geoUnavailable =
        e?.code === 2 ||
        e?.code === 3 ||
        e?.code === GeolocationPositionError?.POSITION_UNAVAILABLE ||
        e?.code === GeolocationPositionError?.TIMEOUT;
      if (geoDenied) {
        setLocationBlocked(true);
        setError(t("scan.errorLocationDenied"));
        setStatus("needLocation");
        return;
      }
      setError(
        geoUnavailable
          ? t("scan.errorLocationUnavailable")
          : t("scan.errorGeneric"),
      );
      setStatus("error");
    }
  }, [code, dispatch, goToSuccess, t]);

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
    void (async () => {
      const permission = await queryGeoPermission();
      if (permission === "granted") {
        await runScan();
        return;
      }
      setStatus("needLocation");
    })();
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

  useEffect(() => {
    if (status !== "pending" || !approvalId || !socket) return;

    const onResolved = (payload: {
      id?: string;
      status?: string;
      type?: string;
      restaurantName?: string;
    }) => {
      if (payload?.id !== approvalId || !payload.status) return;
      applyResolvedStatus(
        payload.status,
        t,
        setStatus,
        setError,
        goToSuccess,
        { type: payload.type, restaurantName: payload.restaurantName },
      );
    };

    socket.on("loyalty:scan-resolved", onResolved);
    return () => {
      socket.off("loyalty:scan-resolved", onResolved);
    };
  }, [status, approvalId, socket, t, goToSuccess]);

  useEffect(() => {
    if (status !== "pending" || !approvalId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const response = await balancesService.getScanApproval(approvalId);
        const nextStatus = String(response.data?.status ?? "");
        if (cancelled || !nextStatus || nextStatus === "PENDING") return;
        applyResolvedStatus(
          nextStatus,
          t,
          setStatus,
          setError,
          goToSuccess,
          {
            type: response.data?.type,
            restaurantName: response.data?.restaurantName,
          },
        );
      } catch {
        // Keep waiting; socket or the next poll may resolve it.
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [status, approvalId, t, goToSuccess]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 pt-8 pb-16 text-center">
        {status === "boot" ||
        status === "locating" ||
        status === "scanning" ||
        status === "pending" ||
        status === "success" ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              {status === "locating"
                ? t("scan.checkingLocation")
                : status === "pending"
                  ? t("scan.pendingTitle")
                  : t("scan.processing")}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {status === "pending"
                ? t("scan.pendingMessage")
                : t("scan.atRestaurant")}
            </p>
          </>
        ) : null}

        {status === "needLocation" ? (
          <>
            <MapPin className="h-12 w-12 text-primary" />
            <h1 className="mt-4 text-xl font-semibold">
              {locationBlocked
                ? t("scan.locationBlockedTitle")
                : t("scan.needLocationTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {locationBlocked
                ? t("scan.locationBlockedMessage")
                : t("scan.needLocationMessage")}
            </p>
            <Button className="mt-6" onClick={() => void runScan()}>
              {t("scan.allowLocation")}
            </Button>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <AlertCircle className="h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-xl font-semibold">
              {error === t("scan.rejectedMessage")
                ? t("scan.rejectedTitle")
                : error === t("scan.expiredMessage")
                  ? t("scan.expiredTitle")
                  : t("scan.title")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
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
