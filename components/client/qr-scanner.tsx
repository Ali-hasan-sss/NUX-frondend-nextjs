"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { scanQrCode, clearQrScanError } from "@/features/client";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import "@/styles/qr-scanner.css";

/** Map API error message to translated string (avoids client-side exception from raw messages) */
function getScanErrorMessage(apiMessage: string | null | undefined, t: (key: string) => string): string {
  if (apiMessage == null || typeof apiMessage !== "string") return t("scan.errorGeneric");
  const msg = apiMessage.trim().toLowerCase();
  if (msg.includes("invalid") && msg.includes("qr")) return t("scan.errorInvalidQrCode");
  if (msg.includes("restaurant location") || msg.includes("must be at")) return t("scan.errorMustBeAtRestaurant");
  return t("scan.errorGeneric");
}

interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanSuccess?: (result: any) => void;
}

export function QRScanner({
  open,
  onOpenChange,
  onScanSuccess,
}: QRScannerProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.clientBalances);
  const displayError = useMemo(
    () => (error.qrScan ? getScanErrorMessage(error.qrScan, t) : null),
    [error.qrScan, t]
  );
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationWarning, setLocationWarning] = useState<string>("");
  const [ipLocation, setIpLocation] = useState<{
    lat: number;
    lng: number;
    source: string;
  } | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  /** Guard: only one scan request per modal open (library may fire callback multiple times) */
  const requestSentRef = useRef(false);

  const getLocationFromIP = async () => {
    try {
      // Try multiple IP geolocation services
      const services = [
        {
          url: "https://ipapi.co/json/",
          parser: (data: any) => ({
            lat: data.latitude,
            lng: data.longitude,
            source: "ipapi.co",
          }),
        },
        {
          url: "https://ip-api.com/json/",
          parser: (data: any) => ({
            lat: data.lat,
            lng: data.lon,
            source: "ip-api.com",
          }),
        },
        {
          url: "https://ipinfo.io/json",
          parser: (data: any) => {
            const [lat, lng] = data.loc.split(",").map(Number);
            return { lat, lng, source: "ipinfo.io" };
          },
        },
      ];

      for (const service of services) {
        try {
          const response = await fetch(service.url);
          const data = await response.json();
          const location = service.parser(data);

          if (location.lat && location.lng) {
            console.log(
              `🌐 QR Scanner IP Location from ${location.source}:`,
              location
            );
            setIpLocation(location);

            // Check if this looks more accurate than GPS
            const isInMiddleEast =
              location.lat >= 25 &&
              location.lat <= 42 &&
              location.lng >= 25 &&
              location.lng <= 50;
            if (isInMiddleEast) {
              console.log("✅ IP location seems more accurate for QR scanning");
              return location;
            }
            break;
          }
        } catch (error) {
          console.warn(`Failed to get location from ${service.url}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.warn("Failed to get IP location:", error);
    }
    return null;
  };

  const handleScanSuccess = async (qrCodeMessage: string) => {
    if (requestSentRef.current || hasScanned) return;
    requestSentRef.current = true;
    setHasScanned(true);

    // Stop scanner immediately so callback cannot fire again (one request per modal open)
    if (scanner) {
      scanner.stop().catch(console.error);
      scanner.clear().catch(console.error);
    }

    try {
      // Get location with high accuracy settings
      console.log("Getting location for QR scan...");
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0, // Don't use cached location
          });
        }
      );

      console.log("QR Scanner Location Details:", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date(position.timestamp).toISOString(),
      });

      // Alert if location seems incorrect (far from expected region)
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Check if location is in Middle East region (rough bounds)
      const isInMiddleEast = lat >= 25 && lat <= 42 && lng >= 25 && lng <= 50;

      // Detect specific wrong locations
      let locationName = "Unknown";
      if (lat >= 35.5 && lat <= 35.8 && lng >= 139.5 && lng <= 139.8) {
        locationName = "Tokyo, Japan";
      } else if (lat >= 51.0 && lat <= 51.2 && lng >= -1.9 && lng <= -1.7) {
        locationName = "Reading, UK";
      } else if (lat >= 52.3 && lat <= 52.4 && lng >= 4.8 && lng <= 4.9) {
        locationName = "Amsterdam, Netherlands";
      }

      if (!isInMiddleEast) {
        console.warn(
          "⚠️ QR Scanner GPS location seems incorrect! Expected Middle East region, got:",
          { lat, lng, detectedLocation: locationName }
        );

        // Try to get location from IP as fallback
        console.log("🔄 Trying IP-based location as fallback...");
        const ipLoc = await getLocationFromIP();

        if (
          ipLoc &&
          ipLoc.lat >= 25 &&
          ipLoc.lat <= 42 &&
          ipLoc.lng >= 25 &&
          ipLoc.lng <= 50
        ) {
          console.log("✅ Using IP location instead of GPS");
          const result = await dispatch(
            scanQrCode({
              qrCode: qrCodeMessage,
              latitude: ipLoc.lat,
              longitude: ipLoc.lng,
            })
          );

          if (scanQrCode.fulfilled.match(result)) {
            onOpenChange(false);
            setScanResult(result.payload);
            onScanSuccess?.(result.payload);
          }
          return;
        } else {
          console.log(
            "💡 To use correct location, run: window.useRealLocation = true; then scan again"
          );
          setLocationWarning(
            `GPS detected: ${locationName} (${lat.toFixed(6)}, ${lng.toFixed(
              6
            )}) - This is incorrect! Check VPN/Proxy settings.`
          );
        }
      }

      // Developer override - check if real location should be used
      if ((window as any).useRealLocation) {
        console.log("🔧 Using real location override");
        const result = await dispatch(
          scanQrCode({
            qrCode: qrCodeMessage,
            latitude: 36.020214,
            longitude: 35.0134549,
          })
        );

        if (scanQrCode.fulfilled.match(result)) {
          onOpenChange(false);
          setScanResult(result.payload);
          onScanSuccess?.(result.payload);
        }
        return;
      }

      setLocationAccuracy(position.coords.accuracy);

      const result = await dispatch(
        scanQrCode({
          qrCode: qrCodeMessage,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      );

      if (scanQrCode.fulfilled.match(result)) {
        onOpenChange(false);
        setScanResult(result.payload);
        onScanSuccess?.(result.payload);
      }
    } catch (error) {
      console.error("Scan failed:", error);
      setHasScanned(false);
      requestSentRef.current = false;
    }
  };

  const startScanner = async () => {
    if (scanner || isInitializing) return;

    setIsInitializing(true);
    console.log("Starting direct camera scanner...");

    try {
      const scannerId = "qr-scanner-element";
      const newScanner = new Html5Qrcode(scannerId);

      // Start camera with low resolution & low FPS for smooth video (less CPU = less choppy)
      console.log("Starting camera...");
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const scanFps = isMobile ? 5 : 8;
      await newScanner.start(
        { facingMode: "environment" },
        {
          fps: scanFps,
          qrbox: { width: isMobile ? 150 : 200, height: isMobile ? 150 : 200 },
          aspectRatio: 1.0,
          disableFlip: true,
          ...({
            videoConstraints: {
              width: { ideal: isMobile ? 480 : 640, max: 640 },
              height: { ideal: isMobile ? 360 : 480, max: 480 },
              frameRate: { ideal: scanFps + 2, max: 12 },
            },
          } as { videoConstraints?: MediaTrackConstraints }),
        },
        handleScanSuccess,
        (errorMessage: string) => {
          // Only log important errors
          if (
            !errorMessage.includes("QR code parse error") &&
            !errorMessage.includes("No QR code found") &&
            !errorMessage.includes("NotFoundException")
          ) {
            console.warn("QR Scan error:", errorMessage);
          }
        }
      );

      setScanner(newScanner);
      setIsInitializing(false);
      console.log("Camera started successfully");
    } catch (error) {
      console.error("Camera initialization failed:", error);
      alert(
        "Cannot access camera. Please make sure camera permissions are enabled and try again."
      );
      setIsInitializing(false);
    }
  };

  const stopScanner = () => {
    console.log("Stopping scanner...");
    if (scanner) {
      try {
        scanner.stop().catch((error) => {
          console.warn("Error stopping scanner:", error);
        });
        scanner.clear().catch((error) => {
          console.warn("Error clearing scanner:", error);
        });
      } catch (error) {
        console.warn("Error in stopScanner:", error);
      }
      setScanner(null);
    }
    setScanResult(null);
    setHasScanned(false);
    setIsInitializing(false);
    setShowScanner(false);
    console.log("Scanner stopped");
  };

  useEffect(() => {
    if (open) {
      console.log("QR Scanner modal opened");
      requestSentRef.current = false;
      dispatch(clearQrScanError());
      setHasScanned(false);
      setScanResult(null);
      setLocationAccuracy(null);
      setLocationWarning("");
      setIpLocation(null);

      getLocationFromIP();
      setShowScanner(true);
    } else {
      console.log("QR Scanner modal closed");
      setShowScanner(false);
      stopScanner();
    }

    // Cleanup function
    return () => {
      console.log("QR Scanner component unmounting, cleaning up...");
      if (scanner) {
        scanner.stop().catch(() => {});
        scanner.clear().catch(() => {});
      }
    };
  }, [open, scanner]);

  // Start scanner after modal layout is fully settled (reduces choppy video from layout thrashing)
  useEffect(() => {
    if (!showScanner || !open || scanner || isInitializing) return;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const delay = isMobile ? 600 : 400;
    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log("Scanner container ready, starting scanner...");
          startScanner();
        });
      });
    }, delay);
    return () => clearTimeout(t);
  }, [showScanner, open, scanner, isInitializing]);

  const handleClose = () => {
    console.log("Handling modal close...");
    stopScanner();

    // Force close after a short delay if needed
    setTimeout(() => {
      onOpenChange(false);
    }, 100);
  };

  const handleTryAgain = () => {
    dispatch(clearQrScanError());
    stopScanner();
    setTimeout(() => {
      setHasScanned(false);
      setScanResult(null);
      setShowScanner(true);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-sm !max-h-[90vh] flex flex-col p-4 sm:p-6 overflow-hidden"
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <DialogTitle className="flex items-center gap-2 min-w-0 truncate text-base sm:text-lg">
              <Camera className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{t("scan.title")}</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8 flex-shrink-0 touch-manipulation"
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-left text-sm">
            {t("scan.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {locationWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{locationWarning}</AlertDescription>
            </Alert>
          )}

          {displayError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {scanResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">{t("scan.successTitle")}</p>
                  <p className="text-sm">{t("scan.successMessage")}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {loading.qrScan && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>{t("scan.processing")}</span>
            </div>
          )}

          {isInitializing && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>{t("scan.startingCamera")}</span>
            </div>
          )}

          {showScanner && !scanResult && !loading.qrScan && !displayError && (
            <div className="space-y-4 min-w-0">
              <div className="relative w-full mx-auto h-[240px] sm:h-[300px] bg-black rounded-xl overflow-hidden border-2 border-gray-200">
                <div
                  id="qr-scanner-element"
                  className="w-full h-full bg-black rounded-xl overflow-hidden"
                />
                {/* QR Frame Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-white rounded-lg shadow-lg">
                      <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t("scan.positionFrame")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("scan.atRestaurant")}
                </p>
                {locationAccuracy && (
                  <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    GPS Accuracy: ±{locationAccuracy.toFixed(1)}m
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 flex-shrink-0">
            {scanResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleTryAgain}
                  className="flex-1 min-h-[44px] touch-manipulation"
                  type="button"
                >
                  {t("scan.scanAnother")}
                </Button>
                <Button onClick={handleClose} className="flex-1 min-h-[44px] touch-manipulation" type="button">
                  {t("scan.done")}
                </Button>
              </>
            ) : displayError ? (
              <>
                <Button
                  variant="default"
                  onClick={handleTryAgain}
                  className="flex-1 min-h-[44px] touch-manipulation"
                  type="button"
                >
                  {t("scan.scanAnother")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 min-h-[44px] touch-manipulation"
                  type="button"
                >
                  {t("scan.cancel")}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full min-h-[44px] touch-manipulation"
                type="button"
              >
                <X className="h-4 w-4 mr-2" />
                {t("scan.cancel")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
