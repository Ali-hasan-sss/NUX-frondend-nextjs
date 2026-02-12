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
import { getAccuratePosition } from "@/utils/getLocation";
import dynamic from "next/dynamic";

const LeafletMapView = dynamic(
  () => import("./LeafletMapView").then((m) => m.LeafletMapView),
  { ssr: false }
);

interface GoogleMapPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number;
  initialLng?: number;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006];

export function GoogleMapPicker({
  open,
  onOpenChange,
  initialLat = 0,
  initialLng = 0,
  onSelect,
}: GoogleMapPickerProps) {
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [geoError, setGeoError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      setGeoError("");
      setLatitude(initialLat);
      setLongitude(initialLng);
      setSearchQuery("");
      setLocationAccuracy(null);
    }
  }, [open, initialLat, initialLng]);

  const center: [number, number] =
    latitude !== 0 && longitude !== 0
      ? [latitude, longitude]
      : initialLat !== 0 && initialLng !== 0
        ? [initialLat, initialLng]
        : DEFAULT_CENTER;

  const handlePositionChange = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
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
      const pos = await getAccuratePosition({
        desiredAccuracy: 10,
        maxAttempts: 12,
        totalTimeout: 45000,
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy ?? null;
      setLatitude(lat);
      setLongitude(lng);
      setLocationAccuracy(acc);
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
      } else {
        setGeoError("Location not found. Please try a different search term.");
      }
    } catch {
      setGeoError("Error searching for location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!latitude || !longitude) return;
    onSelect({ latitude, longitude });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:max-w-md md:max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader className="min-w-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg truncate">
            <MapPin className="h-5 w-5 shrink-0" />
            <span className="min-w-0 truncate">Select Restaurant Location</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="search">Search Location</Label>
            <div className="flex gap-2 min-w-0">
              <Input
                id="search"
                type="text"
                placeholder="Enter address or place name"
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
              Click on the map to select your restaurant location
            </Label>
            <div className="w-full min-w-0 h-[240px] sm:h-[300px] overflow-hidden rounded-md border relative">
              {mounted && open && (
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
                <strong>Current:</strong>{" "}
                {latitude !== 0 && longitude !== 0
                  ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                  : "No location selected"}
              </p>
            </div>
          </div>

          {latitude !== 0 && longitude !== 0 && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded min-w-0 break-all">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 text-green-600 shrink-0" />
                <span className="font-medium text-green-700 dark:text-green-400 min-w-0">
                  Location selected:
                </span>
              </div>
              <div className="mt-1 break-all">
                Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                {locationAccuracy != null && (
                  <>
                    <br />
                    <span className="text-green-600">
                      GPS Accuracy: ±{locationAccuracy.toFixed(1)}m
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Adjust by clicking or dragging the marker on the map, then tap Confirm.
              </p>
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
                  {isLoading
                    ? "Getting precise location..."
                    : "Get My Precise Location"}
                </span>
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!latitude || !longitude || isLoading}
                className="w-full sm:flex-1 min-w-0"
              >
                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                <span className="min-w-0 truncate">Confirm Location</span>
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
