"use client";

import { useEffect, useState, useRef } from "react";
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

interface GoogleMapPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number;
  initialLng?: number;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMapPicker({
  open,
  onOpenChange,
  initialLat = 0,
  initialLng = 0,
  onSelect,
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [geoError, setGeoError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setGeoError("");
      setLatitude(initialLat);
      setLongitude(initialLng);
      setSearchQuery("");
      setLocationAccuracy(null);
    }
  }, [open, initialLat, initialLng]);

  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        loadGoogleMaps();
      }, 100);
    }
  }, [open]);

  const loadGoogleMaps = () => {
    if (window.google) {
      initMap();
      return;
    }

    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setGeoError(
        "Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables."
      );
      return;
    }

    setIsMapLoading(true);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.initMap = initMap;
      initMap();
      setIsMapLoading(false);
    };
    script.onerror = () => {
      setGeoError(
        "Failed to load Google Maps. Please check your API key and internet connection."
      );
      setIsMapLoading(false);
    };
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const center = {
      lat: latitude || 40.7128,
      lng: longitude || -74.006,
    };

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center: center,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });

    const markerInstance = new window.google.maps.Marker({
      position: center,
      map: mapInstance,
      draggable: true,
      title: "Restaurant Location",
      animation: window.google.maps.Animation.DROP,
    });

    // Add click listener to map
    mapInstance.addListener("click", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
      markerInstance.setPosition({ lat, lng });
    });

    // Add drag listener to marker
    markerInstance.addListener("dragend", (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
    });

    setMap(mapInstance);
    setMarker(markerInstance);

    // Trigger resize after a short delay to ensure proper rendering
    setTimeout(() => {
      window.google.maps.event.trigger(mapInstance, "resize");
    }, 100);
  };

  const handleUseDeviceLocation = async () => {
    setGeoError("");
    setIsLoading(true);

    try {
      // اختبر حالة الأذن أولاً (اختياري ولكن يعطي UX أفضل)
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
          // تجاهل إذا Permissions API غير مدعوم
        }
      }

      // اطلب الموقع بدقّة مطلوبة (مثلا ≤10m) مع مهلة 45s
      const pos = await getAccuratePosition({
        desiredAccuracy: 10,
        maxAttempts: 12,
        totalTimeout: 45000,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy ?? null;

      // حدّث الحالة و الخريطة
      setLatitude(lat);
      setLongitude(lng);
      setLocationAccuracy(acc);

      if (map && marker) {
        const newPosition = { lat, lng };
        map.setCenter(newPosition);
        marker.setPosition(newPosition);
      }

      // رسالة مناسبة حسب الدقّة
      if (acc !== null) {
        if (acc <= 5) setGeoError(`🎯 Excellent accuracy: ±${acc.toFixed(1)}m`);
        else if (acc <= 10)
          setGeoError(`✅ High accuracy: ±${acc.toFixed(1)}m`);
        else if (acc <= 20)
          setGeoError(`📍 Good accuracy: ±${acc.toFixed(1)}m`);
        else if (acc <= 50)
          setGeoError(
            `⚠️ Moderate accuracy: ±${acc.toFixed(1)}m - move outdoors`
          );
        else
          setGeoError(
            `❌ Low accuracy: ±${acc.toFixed(1)}m - try outdoors or enable GPS`
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
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: searchQuery },
        (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const location = results[0].geometry.location;
            const lat = location.lat();
            const lng = location.lng();

            setLatitude(lat);
            setLongitude(lng);

            if (map && marker) {
              const newPosition = { lat, lng };
              map.setCenter(newPosition);
              marker.setPosition(newPosition);
            }
          } else {
            setGeoError(
              "Location not found. Please try a different search term."
            );
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      setGeoError("Error searching for location. Please try again.");
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
      <DialogContent className="w-full max-w-md md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Restaurant Location
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Location</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                type="text"
                placeholder="Enter address or place name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchLocation()}
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

          {/* Map Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Click on the map to select your restaurant location
            </Label>
            <div className="w-full h-[300px] overflow-hidden rounded-md border relative">
              {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span>Loading map...</span>
                  </div>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full" />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                💡 <strong>How to use:</strong> Drag to move, scroll to zoom,
                click to place marker
              </p>
              <p>
                🔍 <strong>Search:</strong> Use the search box above to find
                specific locations
              </p>
              <p>
                📍 <strong>Current:</strong>{" "}
                {latitude !== 0 && longitude !== 0
                  ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                  : "No location selected"}
              </p>
            </div>
          </div>
          {/* Current Selection Display */}
          {latitude !== 0 && longitude !== 0 && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-green-600" />
                <span className="font-medium text-green-700 dark:text-green-400">
                  Location selected:
                </span>
              </div>
              <div className="mt-1">
                Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                {locationAccuracy && (
                  <>
                    <br />
                    <span className="text-green-600">
                      GPS Accuracy: ±{locationAccuracy.toFixed(1)}m
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseDeviceLocation}
                disabled={isLoading}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isLoading
                  ? "Getting precise location..."
                  : "Get My Precise Location"}
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!latitude || !longitude || isLoading}
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Confirm Location
              </Button>
            </div>

            {/* Emergency fallback - only show if GPS failed */}
            {geoError && geoError.includes("❌") && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  // Use your known coordinates as emergency fallback
                  setLatitude(36.020214);
                  setLongitude(35.0134549);
                  setLocationAccuracy(null);
                  setGeoError(
                    "📍 Using manual location (GPS failed) - Please verify this is correct"
                  );

                  if (map && marker) {
                    const newPosition = { lat: 36.020214, lng: 35.0134549 };
                    map.setCenter(newPosition);
                    marker.setPosition(newPosition);
                  }
                }}
                className="w-full text-xs"
              >
                🆘 Use Emergency Location (GPS Failed)
                <br />
                <span className="opacity-70">Syria (36.020, 35.013)</span>
              </Button>
            )}
          </div>

          {/* Error Display */}
          {geoError && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
              {geoError}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GoogleMapPicker;
