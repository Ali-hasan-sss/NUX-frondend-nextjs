"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { scanQrCode } from "@/features/client";
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
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.clientBalances);
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
    if (hasScanned) return;
    setHasScanned(true);

    // Stop scanner
    if (scanner) {
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
        setScanResult(result.payload);
        onScanSuccess?.(result.payload);
      }
    } catch (error) {
      console.error("Scan failed:", error);
      setHasScanned(false);
    }
  };

  const startScanner = async () => {
    if (scanner || isInitializing) return;

    setIsInitializing(true);
    console.log("Starting direct camera scanner...");

    try {
      const scannerId = "qr-scanner-element";
      const newScanner = new Html5Qrcode(scannerId);

      // Start camera directly
      console.log("Starting camera...");
      await newScanner.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.0,
          disableFlip: true, // Disable flipping to prevent mirroring
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
      // Reset state
      setHasScanned(false);
      setScanResult(null);
      setLocationAccuracy(null);
      setLocationWarning("");
      setIpLocation(null);

      // Get IP location as backup
      getLocationFromIP();

      // Show scanner container first
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

  // Separate effect for starting scanner when container is shown
  useEffect(() => {
    if (showScanner && open && !scanner && !isInitializing) {
      console.log("Scanner container ready, starting scanner...");
      setTimeout(startScanner, 1000);
    }
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
    stopScanner();
    setTimeout(() => {
      setHasScanned(false);
      setScanResult(null);
      setShowScanner(true);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm w-full mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan QR Code
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Point your camera at the restaurant's QR code to earn loyalty points
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {locationWarning && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{locationWarning}</AlertDescription>
            </Alert>
          )}

          {error.qrScan && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.qrScan}</AlertDescription>
            </Alert>
          )}

          {scanResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Scan successful!</p>
                  <p className="text-sm">You've earned loyalty points.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {loading.qrScan && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Processing scan...</span>
            </div>
          )}

          {isInitializing && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Starting camera...</span>
            </div>
          )}

          {showScanner && !scanResult && !loading.qrScan && (
            <div className="space-y-4">
              <div className="relative w-full max-w-sm mx-auto">
                <div
                  id="qr-scanner-element"
                  className="w-full h-[300px] bg-black rounded-xl overflow-hidden border-2 border-gray-200"
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
                  Position the QR code within the frame
                </p>
                <p className="text-xs text-muted-foreground">
                  Make sure you're at the restaurant location
                </p>
                {locationAccuracy && (
                  <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    GPS Accuracy: ±{locationAccuracy.toFixed(1)}m
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {scanResult ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleTryAgain}
                  className="flex-1"
                >
                  Scan Another
                </Button>
                <Button onClick={handleClose} className="flex-1">
                  Done
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
