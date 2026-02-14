"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { X, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ViewOnlyLeafletMap } from "@/components/common/ViewOnlyLeafletMap";

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
    const url = `https://www.openstreetmap.org/?mlat=${restaurant.latitude}&mlon=${restaurant.longitude}&zoom=16`;
    window.open(url, "_blank");
  };

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

        <div className="flex flex-col flex-1 min-h-[400px]">
          {/* Leaflet map - only mount when open so map initializes correctly */}
          {open ? (
            <div className="flex-1 min-h-[300px] w-full relative">
              <ViewOnlyLeafletMap
                center={[restaurant.latitude, restaurant.longitude]}
                zoom={15}
                className="w-full h-full min-h-[300px] rounded-none"
              />
            </div>
          ) : null}

          {/* Restaurant Info */}
          <div
            className="p-5 border-t"
            style={{
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 shrink-0" style={{ color: colors.primary }} />
                <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                  {restaurant.name}
                </h3>
              </div>
              {restaurant.address && (
                <p
                  className="text-sm ml-7"
                  style={{ color: colors.textSecondary }}
                >
                  {restaurant.address}
                </p>
              )}
            </div>
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
