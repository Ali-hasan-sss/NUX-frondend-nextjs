"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { X, MapPin } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestaurantMapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: {
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export function RestaurantMapModal({
  open,
  onOpenChange,
  restaurant,
}: RestaurantMapModalProps) {
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMapError(null);
    }
  }, [open]);

  const handleOpenInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
    window.open(url, "_blank");
  };

  // Use static map image or direct link if no API key
  const hasApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== "your_api_key_here";

  const staticMapUrl = hasApiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${restaurant.latitude},${restaurant.longitude}&zoom=15&size=600x400&markers=color:red%7C${restaurant.latitude},${restaurant.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : null;

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl w-full p-0 max-h-[90vh] overflow-hidden",
          isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
        )}
        style={{
          backgroundColor: colors.background,
        }}
      >
        <DialogHeader
          className="p-5 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <div className="flex items-center justify-between">
            <DialogTitle style={{ color: colors.text }}>
              {restaurant.name}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: colors.text }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-200px)] min-h-[500px]">
          {/* Map */}
          {staticMapUrl ? (
            <div className="flex-1 relative">
              <Image
                src={staticMapUrl}
                alt={restaurant.name}
                fill
                className="object-cover"
                unoptimized
                onError={() => setMapError(t("promotions.mapLoadError"))}
              />
              {/* Click overlay to open in Google Maps */}
              <button
                onClick={handleOpenInMaps}
                className="absolute inset-0 w-full h-full bg-transparent hover:bg-black/5 transition-colors cursor-pointer"
                aria-label={t("promotions.openInMaps")}
              />
            </div>
          ) : (
            <div
              className="flex-1 flex flex-col items-center justify-center cursor-pointer"
              style={{ backgroundColor: colors.surface }}
              onClick={handleOpenInMaps}
            >
              <div className="text-center p-8">
                <MapPin
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: colors.primary }}
                />
                <p className="mb-2" style={{ color: colors.text }}>
                  {restaurant.name}
                </p>
                {restaurant.address && (
                  <p
                    className="text-sm mb-4"
                    style={{ color: colors.textSecondary }}
                  >
                    {restaurant.address}
                  </p>
                )}
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t("promotions.clickToOpenInMaps")}
                </p>
              </div>
            </div>
          )}

          {/* Restaurant Info */}
          <div
            className="p-5 border-t"
            style={{
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5" style={{ color: colors.primary }} />
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                {restaurant.name}
              </h3>
            </div>
            {restaurant.address && (
              <p
                className="text-sm mb-4 ml-7"
                style={{ color: colors.textSecondary }}
              >
                {restaurant.address}
              </p>
            )}
            <Button
              onClick={handleOpenInMaps}
              className="w-full"
              style={{ backgroundColor: colors.primary }}
            >
              {t("promotions.openInMaps")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
