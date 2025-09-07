"use client";

import { useEffect, useState } from "react";
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
import InteractiveMap from "./InteractiveMap";

interface MapPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number;
  initialLng?: number;
  onSelect: (coords: { latitude: number; longitude: number }) => void;
}

// Interactive map picker with click-to-select functionality
export function MapPickerModal({
  open,
  onOpenChange,
  initialLat = 0,
  initialLng = 0,
  onSelect,
}: MapPickerModalProps) {
  const [latitude, setLatitude] = useState<number>(initialLat);
  const [longitude, setLongitude] = useState<number>(initialLng);
  const [geoError, setGeoError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (open) {
      setGeoError("");
      setLatitude(initialLat);
      setLongitude(initialLng);
      setSearchQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  const handleUseDeviceLocation = () => {
    setGeoError("");
    setIsLoading(true);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsLoading(false);
      },
      (err) => {
        setGeoError(err.message || "Unable to retrieve your location.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setGeoError("");

    try {
      // Using a geocoding service (you might want to use Google Geocoding API or similar)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setLatitude(parseFloat(result.lat));
        setLongitude(parseFloat(result.lon));
      } else {
        setGeoError("Location not found. Please try a different search term.");
      }
    } catch (error) {
      setGeoError("Error searching for location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapLocationSelect = (coords: { latitude: number; longitude: number }) => {
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  };

  const handleConfirm = () => {
    if (!latitude || !longitude) return;
    onSelect({ latitude, longitude });
    onOpenChange(false);
  };

  const handleInputChange = (
    field: "latitude" | "longitude",
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (field === "latitude") {
        setLatitude(numValue);
      } else {
        setLongitude(numValue);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Restaurant Location
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
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
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSearchLocation()
                  }
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

            {/* Manual Coordinates */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Manual Coordinates</Label>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="lat" className="text-xs">
                    Latitude
                  </Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={Number.isFinite(latitude) ? latitude : ""}
                    onChange={(e) =>
                      handleInputChange("latitude", e.target.value)
                    }
                    placeholder="e.g. 40.7128"
                  />
                </div>
                <div>
                  <Label htmlFor="lng" className="text-xs">
                    Longitude
                  </Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={Number.isFinite(longitude) ? longitude : ""}
                    onChange={(e) =>
                      handleInputChange("longitude", e.target.value)
                    }
                    placeholder="e.g. -74.0060"
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {geoError && (
              <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                {geoError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleUseDeviceLocation}
                disabled={isLoading}
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isLoading ? "Getting location..." : "Use my location"}
              </Button>

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!latitude || !longitude || isLoading}
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Confirm Location
              </Button>
            </div>

            {/* Current Selection Display */}
            {latitude !== 0 && longitude !== 0 && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                <strong>Selected:</strong>
                <br />
                Lat: {latitude.toFixed(6)}
                <br />
                Lng: {longitude.toFixed(6)}
              </div>
            )}
          </div>

          {/* Map Display */}
          <div className="lg:col-span-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Navigate and click on the map to select location
              </Label>
              <div className="aspect-video w-full overflow-hidden rounded-md border">
                <InteractiveMap
                  latitude={latitude}
                  longitude={longitude}
                  onLocationSelect={handleMapLocationSelect}
                  className="w-full h-full"
                />
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 <strong>Navigation:</strong> Drag to move, scroll to zoom, click to place marker</p>
                <p>🔍 <strong>Search:</strong> Use the search box or manual coordinates for precise location</p>
                <p>📍 <strong>Current:</strong> {latitude !== 0 && longitude !== 0 ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : 'No location selected'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MapPickerModal;
