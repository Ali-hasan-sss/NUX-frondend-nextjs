"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export interface InlineMapPickerProps {
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
  className?: string;
}

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];

export function InlineMapPicker({
  initialAddress = "",
  initialLat = 0,
  initialLng = 0,
  onSelect,
  className = "",
}: InlineMapPickerProps) {
  const { t } = useTranslation();
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [geoError, setGeoError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialAddress);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  // Sync from parent and geocode initial address
  useEffect(() => {
    setLatitude(initialLat);
    setLongitude(initialLng);
    setSearchQuery((q) => initialAddress || q);
    setGeoError("");
    setLocationAccuracy(null);
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
            onSelect({ latitude: coords.lat, longitude: coords.lng });
          }
        }
      );
    }
  }, [initialAddress, initialLat, initialLng]);

  const center: [number, number] =
    latitude !== 0 && longitude !== 0
      ? [latitude, longitude]
      : initialLat !== 0 && initialLng !== 0
        ? [initialLat, initialLng]
        : DEFAULT_CENTER;

  const handlePositionChange = useCallback(
    (lat: number, lng: number) => {
      setLatitude(lat);
      setLongitude(lng);
      setGeoError("");
      setResolvedAddress(null);
      onSelect({ latitude: lat, longitude: lng });
      if (GOOGLE_MAPS_API_KEY) {
        reverseGeocode(lat, lng, GOOGLE_MAPS_API_KEY).then((addr) => {
          setResolvedAddress(addr);
        });
      }
    },
    [onSelect]
  );

  const handleUseDeviceLocation = async () => {
    setGeoError("");
    setIsLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
        );
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy ?? null;
      setLatitude(lat);
      setLongitude(lng);
      setLocationAccuracy(acc);
      onSelect({ latitude: lat, longitude: lng });
      setResolvedAddress(null);
      if (GOOGLE_MAPS_API_KEY) {
        reverseGeocode(lat, lng, GOOGLE_MAPS_API_KEY).then((addr) => {
          setResolvedAddress(addr);
        });
      }
      if (acc !== null && acc > 50) {
        setGeoError(
          `Low accuracy: ±${acc.toFixed(1)}m - try outdoors or enable GPS`
        );
      } else {
        setGeoError("");
      }
    } catch (err: unknown) {
      setGeoError(
        err instanceof Error
          ? err.message
          : "Unable to obtain location. Please allow location access."
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
          onSelect({ latitude: coords.lat, longitude: coords.lng });
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
          const latNum = parseFloat(lat);
          const lngNum = parseFloat(lon);
          setLatitude(latNum);
          setLongitude(lngNum);
          setResolvedAddress(searchQuery.trim() || null);
          onSelect({ latitude: latNum, longitude: lngNum });
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

  const useGoogleMap = Boolean(GOOGLE_MAPS_API_KEY);

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="map-search">{t("landing.auth.mapSearchPlaceholder")}</Label>
          <div className="flex gap-2">
            <Input
              id="map-search"
              type="text"
              placeholder={t("landing.auth.mapSearchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), handleSearchLocation())
              }
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleSearchLocation}
              disabled={isLoading || !searchQuery.trim()}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t("landing.auth.mapPickLocationDescription")}
          </Label>
          <div className="w-full h-[240px] sm:h-[280px] overflow-hidden rounded-md border bg-muted/30">
            {mounted && useGoogleMap && (
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
            {mounted && !useGoogleMap && (
              <LeafletMapView
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
          </div>
          <p className="text-xs text-muted-foreground">
            {latitude !== 0 && longitude !== 0
              ? t("landing.auth.locationSelected")
              : t("landing.auth.validation.locationRequired")}
          </p>
        </div>

        {latitude !== 0 && longitude !== 0 && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded flex items-start gap-1">
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
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleUseDeviceLocation}
            disabled={isLoading}
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2 shrink-0" />
            {isLoading ? "..." : t("landing.auth.mapGetMyLocation")}
          </Button>
        </div>

        {geoError && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            {geoError}
          </div>
        )}
      </div>
    </div>
  );
}
