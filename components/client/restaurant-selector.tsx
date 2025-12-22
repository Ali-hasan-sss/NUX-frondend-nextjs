"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";

interface Restaurant {
  id: string;
  name: string;
  userBalance: {
    walletBalance: number;
    mealPoints: number;
    drinkPoints: number;
  };
}

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  onRestaurantChange: (restaurant: Restaurant) => void;
  selectedRestaurantId?: string;
}

export function RestaurantSelector({
  restaurants,
  onRestaurantChange,
  selectedRestaurantId,
}: RestaurantSelectorProps) {
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const [modalOpen, setModalOpen] = useState(false);

  // Auto-select first restaurant if none selected
  useEffect(() => {
    if (!selectedRestaurantId && restaurants.length > 0) {
      onRestaurantChange(restaurants[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRestaurantId, restaurants.length]);

  if (!mounted || restaurants.length === 0) {
    return null;
  }

  const selectedRestaurant = restaurants.find(
    (r) => r.id === selectedRestaurantId
  );

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    onRestaurantChange(restaurant);
    setModalOpen(false);
  };

  return (
    <>
      {/* Selector Button */}
      <button
        onClick={() => setModalOpen(true)}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl mb-6 border transition-all backdrop-blur-sm",
          isDark
            ? "bg-white/10 border-white/15 hover:border-white/30"
            : "bg-white border-gray-200 hover:border-gray-300"
        )}
      >
        <div className="flex-1 text-left">
          <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
            {t("restaurant.restaurant")}
          </p>
          <p className="text-base font-medium" style={{ color: colors.text }}>
            {selectedRestaurant?.name || t("restaurant.selectRestaurant")}
          </p>
        </div>
        <ChevronDown
          className="h-5 w-5"
          style={{ color: colors.textSecondary }}
        />
      </button>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={cn(
            "max-w-md max-h-[70vh] p-0 transition-colors",
            isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
          )}
          style={{
            borderColor: colors.border,
          }}
        >
          <DialogHeader
            className={cn("border-b p-5")}
            style={{ borderBottomColor: colors.border }}
          >
            <div className="flex items-center justify-between">
              <DialogTitle
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                {t("restaurant.selectRestaurant")}
              </DialogTitle>
              <button
                onClick={() => setModalOpen(false)}
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                )}
                style={{ color: colors.text }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh] p-5 space-y-2">
            {restaurants.map((restaurant) => {
              const isSelected = restaurant.id === selectedRestaurantId;
              return (
                <button
                  key={restaurant.id}
                  onClick={() => handleSelectRestaurant(restaurant)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                    isSelected
                      ? `border-[${colors.primary}] bg-[${colors.primary}]/20`
                      : isDark
                      ? "border-white/15 bg-white/5 hover:bg-white/10"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  )}
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected
                      ? `${colors.primary}20`
                      : isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <div className="flex-1">
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: colors.text }}
                    >
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isDark
                            ? "border-white/30 text-white/75"
                            : "border-gray-300 text-gray-700"
                        )}
                      >
                        ${restaurant.userBalance.walletBalance.toFixed(2)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isDark
                            ? "border-white/30 text-white/75"
                            : "border-gray-300 text-gray-700"
                        )}
                      >
                        {restaurant.userBalance.mealPoints} Meal
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isDark
                            ? "border-white/30 text-white/75"
                            : "border-gray-300 text-gray-700"
                        )}
                      >
                        {restaurant.userBalance.drinkPoints} Drink
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="h-5 w-5 ml-2"
                      style={{ color: colors.primary }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
