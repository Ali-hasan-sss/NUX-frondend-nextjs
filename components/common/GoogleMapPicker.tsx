"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Navigation, Search } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

const LeafletMapView = dynamic(
  () => import("./LeafletMapView").then((m) => m.LeafletMapView),
  { ssr: false }
);

const GoogleMapView = dynamic(
  () => import("./GoogleMapView").then((m) => m.GoogleMapView),
  { ssr: false }
);

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface GoogleMapPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number;
  initialLng?: number;
  /** When provided, map will be centered on this address (Google Geocoding) */
  initialAddress?: string;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];

function geocodeAddress(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  return fetch(url)
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    })
    .catch(() => null);
}

function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<string | null> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  return fetch(url)
    .then((r) => r.json())
    .then((data) => {
      if (data.status === "OK" && data.results?.[0]?.formatted_address) {
        return data.results[0].formatted_address;
      }
      return null;
    })
    .catch(() => null);
}

export function GoogleMapPicker({
  open,
  onOpenChange,
  initialLat = 0,
  initialLng = 0,
  initialAddress,
  onSelect,
}: GoogleMapPickerProps) {
  const { t } = useTranslation();
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [geoError, setGeoError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setGeoError("");
      setLatitude(initialLat);
      setLongitude(initialLng);
      setSearchQuery(initialAddress || "");
      setLocationAccuracy(null);
      setResolvedAddress(null);
      // Geocode initial address when using Google and address provided
      if (
        GOOGLE_MAPS_API_KEY &&
        initialAddress?.trim() &&
        (initialLat === 0 || initialLng === 0)
      ) {
        geocodeAddress(initialAddress.trim(), GOOGLE_MAPS_API_KEY).then(
          (coords) => {
            if (coords) {
              setLatitude(coords.lat);
              setLongitude(coords.lng);
              setResolvedAddress(initialAddress.trim());
            }
          }
        );
      }
    }
  }, [open, initialLat, initialLng, initialAddress]);

  const center: [number, number] =
    latitude !== 0 && longitude !== 0
      ? [latitude, longitude]
      : initialLat !== 0 && initialLng !== 0
        ? [initialLat, initialLng]
        : DEFAULT_CENTER;

  const handlePositionChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    setResolvedAddress(null);
    if (GOOGLE_MAPS_API_KEY) {
      reverseGeocode(lat, lng, GOOGLE_MAPS_API_KEY).then((addr) => {
        setResolvedAddress(addr);
      });
    }
  }, []);

  const handleUseDeviceLocation = async () => {
    setGeoError("");
    setIsLoading(true);
    try {
      if (navigator.permissions && (navigator as any).permissions.query) {
        try {
          const perm = await (navigator as any).permissions.query({
            name: "geolocation",
          });
          if (perm.state === "denied") {
            throw new Error(
              "Location permission denied. Please enable it in browser settings."
            );
          }
        } catch {
          // ignore
        }
      }
      // طلب واحد سريع (حد أقصى 12 ثانية) بدل انتظار دقة عالية طويل — يكفي لتحديد الموقع على الخريطة
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 60000, // قبول موقع مخزّن حتى 1 دقيقة للاستجابة السريعة
          }
        );
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy ?? null;
      setLatitude(lat);
      setLongitude(lng);
      setLocationAccuracy(acc);
      setResolvedAddress(null);
      if (GOOGLE_MAPS_API_KEY) {
        reverseGeocode(lat, lng, GOOGLE_MAPS_API_KEY).then((addr) => {
          setResolvedAddress(addr);
        });
      }
      if (acc !== null) {
        if (acc <= 5) setGeoError(`Excellent accuracy: ±${acc.toFixed(1)}m`);
        else if (acc <= 10) setGeoError(`High accuracy: ±${acc.toFixed(1)}m`);
        else if (acc <= 20) setGeoError(`Good accuracy: ±${acc.toFixed(1)}m`);
        else if (acc <= 50)
          setGeoError(`Moderate accuracy: ±${acc.toFixed(1)}m - move outdoors`);
        else
          setGeoError(
            `Low accuracy: ±${acc.toFixed(1)}m - try outdoors or enable GPS`
          );
      } else {
        setGeoError("Location obtained, but accuracy unknown.");
      }
    } catch (err: any) {
      console.error("GPS error:", err);
      setGeoError(
        err.message ||
          "Unable to obtain location. Please allow location access and try outdoors."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setGeoError("");
    try {
      if (GOOGLE_MAPS_API_KEY) {
        const coords = await geocodeAddress(
          searchQuery.trim(),
          GOOGLE_MAPS_API_KEY
        );
        if (coords) {
          setLatitude(coords.lat);
          setLongitude(coords.lng);
          setResolvedAddress(searchQuery.trim() || null);
        } else {
          setGeoError(t("landing.auth.mapLocationNotFound"));
        }
      } else {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
          { headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const { lat, lon } = data[0];
          setLatitude(parseFloat(lat));
          setLongitude(parseFloat(lon));
          setResolvedAddress(null);
        } else {
          setGeoError(t("landing.auth.mapLocationNotFound"));
        }
      }
    } catch {
      setGeoError(t("landing.auth.mapSearchError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!latitude || !longitude) return;
    onSelect({ latitude, longitude });
    onOpenChange(false);
  };

  const useGoogleMap = Boolean(GOOGLE_MAPS_API_KEY);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-md md:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader className="min-w-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg truncate">
            <MapPin className="h-5 w-5 shrink-0" />
            <span className="min-w-0 truncate">
              {t("landing.auth.stepSelectLocationOnMap")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="search">{t("landing.auth.mapSearchPlaceholder")}</Label>
            <div className="flex gap-2 min-w-0">
              <Input
                id="search"
                type="text"
                placeholder={t("landing.auth.mapSearchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchLocation())}
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSearchLocation}
                disabled={isLoading || !searchQuery.trim()}
                className="shrink-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 min-w-0">
            <Label className="text-sm font-medium">
              {t("landing.auth.mapPickLocationDescription")}
            </Label>
            <div className="w-full min-w-0 h-[240px] sm:h-[300px] overflow-hidden rounded-md border relative">
              {mounted && open && useGoogleMap && (
                <GoogleMapView
                  center={center}
                  zoom={15}
                  initialPosition={
                    latitude !== 0 && longitude !== 0
                      ? [latitude, longitude]
                      : initialLat !== 0 && initialLng !== 0
                        ? [initialLat, initialLng]
                        : null
                  }
                  onPositionChange={handlePositionChange}
                  className="w-full h-full rounded-md"
                />
              )}
              {mounted && open && !useGoogleMap && (
                <LeafletMapView
                  center={center}
                  zoom={15}
                  initialPosition={
                    initialLat !== 0 && initialLng !== 0
                      ? [initialLat, initialLng]
                      : null
                  }
                  onPositionChange={handlePositionChange}
                  className="w-full h-full rounded-md"
                />
              )}
            </div>
            <div className="text-xs text-muted-foreground space-y-1 break-words">
              <p>
                <strong>How to use:</strong> Drag to move, scroll to zoom, click
                to place marker
              </p>
              <p>
                <strong>Search:</strong> Use the search box above (OpenStreetMap
                Nominatim)
              </p>
              <p className="break-all">
                <strong>{t("landing.auth.locationSelected")}</strong>
                {latitude !== 0 && longitude !== 0 ? "" : `: ${t("landing.auth.validation.locationRequired")}`}
              </p>
            </div>
          </div>

          {latitude !== 0 && longitude !== 0 && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded min-w-0 break-words">
              <div className="flex items-start gap-1 min-w-0">
                <MapPin className="h-3 w-3 text-green-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-medium text-green-700 dark:text-green-400">
                    {t("landing.auth.locationSelected")}
                  </span>
                  {resolvedAddress && (
                    <p className="mt-1 text-foreground/90 break-words">
                      {resolvedAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 min-w-0">
            <div className="flex flex-col sm:flex-row gap-2 min-w-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseDeviceLocation}
                disabled={isLoading}
                className="w-full sm:flex-1 min-w-0"
              >
                <Navigation className="h-4 w-4 mr-2 shrink-0" />
                <span className="min-w-0 truncate">
                  {isLoading ? "..." : t("landing.auth.mapGetMyLocation")}
                </span>
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!latitude || !longitude || isLoading}
                className="w-full sm:flex-1 min-w-0"
              >
                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                <span className="min-w-0 truncate">
                  {t("landing.auth.mapConfirmLocation")}
                </span>
              </Button>
            </div>

            {geoError && geoError.includes("Low accuracy") && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setLatitude(36.020214);
                  setLongitude(35.0134549);
                  setLocationAccuracy(null);
                  setGeoError(
                    "Using manual location (GPS failed) - Please verify this is correct"
                  );
                }}
                className="w-full min-w-0 text-xs"
              >
                Use fallback location (GPS failed)
              </Button>
            )}
          </div>

          {geoError && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded min-w-0 break-words">
              {geoError}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GoogleMapPicker;
