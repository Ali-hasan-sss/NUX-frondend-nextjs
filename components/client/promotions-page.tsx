"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { fetchAds, refreshAds, setFilters } from "@/features/client";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { Search, Filter, MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getImageUrl } from "@/lib/utils";
import Image from "next/image";
import { RestaurantMapModal } from "./restaurant-map-modal";
import { Ad, AdsFilters } from "@/features/client/ads/adsTypes";

const NEARBY_RADIUS_KM = 50;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function PromotionsPage() {
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { ads, pagination, loading, refreshing, error } = useAppSelector(
    (state) => state.clientAds
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [closestToMe, setClosestToMe] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Ad | null>(null);

  const filterOptions = [
    { key: "food", label: t("promotions.food") },
    { key: "drink", label: t("promotions.drinks") },
  ];

  const buildAdsFilters = useCallback(
    (page: number = 1): AdsFilters => {
      const categoryFilter = selectedFilters.find(
        (f) => f === "food" || f === "drink"
      );
      const base: AdsFilters = {
        page,
        pageSize: 10,
        search: searchQuery.trim() || undefined,
        category: categoryFilter || undefined,
      };
      if (closestToMe && userLocation) {
        base.lat = userLocation.lat;
        base.lng = userLocation.lng;
        base.radius = NEARBY_RADIUS_KM;
      }
      return base;
    },
    [searchQuery, selectedFilters, closestToMe, userLocation]
  );

  const loadAds = useCallback(
    (page: number = 1, append: boolean = false) => {
      dispatch(fetchAds({ filters: buildAdsFilters(page), append }));
    },
    [buildAdsFilters, dispatch]
  );

  useEffect(() => {
    if (closestToMe && !userLocation && !locationLoading && !locationError) {
      return;
    }
    dispatch(fetchAds({ filters: buildAdsFilters(1), append: false }));
  }, [searchQuery, selectedFilters, closestToMe, userLocation, dispatch]);

  const handleRefresh = () => {
    dispatch(refreshAds(buildAdsFilters(1)));
  };

  // Handle load more
  const handleLoadMore = () => {
    if (
      !loading &&
      pagination &&
      pagination.currentPage < pagination.totalPages
    ) {
      loadAds(pagination.currentPage + 1, true);
    }
  };

  const toggleFilter = (filterKey: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((f) => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  const toggleClosestToMe = () => {
    if (closestToMe) {
      setClosestToMe(false);
      setLocationError(null);
      return;
    }
    if (userLocation) {
      setClosestToMe(true);
      return;
    }
    setLocationLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError(t("promotions.locationNotSupported"));
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setClosestToMe(true);
        setLocationLoading(false);
        setLocationError(null);
      },
      () => {
        setLocationError(t("promotions.locationDenied"));
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleRestaurantLocation = (ad: Ad) => {
    setSelectedRestaurant(ad);
    setMapModalVisible(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      <div className="px-5 py-5">
        {/* Header */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ color: colors.text }}
          >
            {t("promotions.title")}
          </h1>

          {/* Search and filters */}
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl mb-3",
              isDark ? "bg-white/10" : "bg-white"
            )}
            style={{ backgroundColor: colors.surface }}
          >
            <Search
              className="h-5 w-5"
              style={{ color: colors.textSecondary }}
            />
            <Input
              type="text"
              placeholder={t("promotions.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent",
                isDark
                  ? "text-white placeholder:text-white/50"
                  : "text-gray-900 placeholder:text-gray-400"
              )}
              style={{ color: colors.text }}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 rounded-lg transition-colors"
              style={{ color: colors.primary }}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={toggleClosestToMe}
                  disabled={locationLoading}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2",
                    closestToMe ? "text-white" : isDark ? "text-white/75" : "text-gray-700"
                  )}
                  style={{
                    backgroundColor: closestToMe
                      ? colors.primary
                      : colors.surface,
                  }}
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {t("promotions.closestToMe")}
                </button>
                {filterOptions.map((filterOpt) => (
                  <button
                    key={filterOpt.key}
                    onClick={() => toggleFilter(filterOpt.key)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                      selectedFilters.includes(filterOpt.key)
                        ? "text-white"
                        : isDark
                        ? "text-white/75"
                        : "text-gray-700"
                    )}
                    style={{
                      backgroundColor: selectedFilters.includes(filterOpt.key)
                        ? colors.primary
                        : colors.surface,
                    }}
                  >
                    {filterOpt.label}
                  </button>
                ))}
                {(selectedFilters.length > 0 || closestToMe) && (
                  <button
                    onClick={() => {
                      setSelectedFilters([]);
                      setClosestToMe(false);
                      setLocationError(null);
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: colors.error }}
                  >
                    {t("common.clear")}
                  </button>
                )}
              </div>
              {locationError && (
                <p className="text-sm mt-2" style={{ color: colors.error }}>
                  {locationError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {loading && ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2 mb-4"
              style={{ borderColor: colors.primary }}
            />
            <p style={{ color: colors.textSecondary }}>{t("common.loading")}</p>
          </div>
        ) : error && ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-center mb-4" style={{ color: colors.error }}>
              {error}
            </p>
            <Button
              onClick={() => loadAds(1, false)}
              style={{ backgroundColor: colors.primary }}
            >
              {t("home.retry")}
            </Button>
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-center" style={{ color: colors.textSecondary }}>
              {t("promotions.noPromotions")}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...ads]
              .sort((a, b) => {
                if (!userLocation) return 0;
                const distA = haversineKm(
                  userLocation.lat,
                  userLocation.lng,
                  a.restaurant.latitude,
                  a.restaurant.longitude
                );
                const distB = haversineKm(
                  userLocation.lat,
                  userLocation.lng,
                  b.restaurant.latitude,
                  b.restaurant.longitude
                );
                return distA - distB;
              })
              .map((ad) => {
              const imageUri =
                getImageUrl(ad.image) ||
                getImageUrl(ad.restaurant?.logo) ||
                "https://via.placeholder.com/400x160?text=No+Image";

              return (
                <button
                  key={ad.id}
                  type="button"
                  onClick={() => handleRestaurantLocation(ad)}
                  className={cn(
                    "w-full rounded-2xl overflow-hidden transition-all",
                    isDark ? "bg-white/10" : "bg-white"
                  )}
                  style={{
                    backgroundColor: colors.surface,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full h-40">
                    <Image
                      src={imageUri}
                      alt={ad.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {/* Category Badge */}
                    <div
                      className="absolute top-2 right-2 px-3 py-1 rounded-xl"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      <span className="text-white text-sm font-bold">
                        {ad.category === "food" ? "🍽️" : "☕"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: colors.primary }}
                      >
                        {ad.restaurant.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestaurantLocation(ad);
                        }}
                        className="p-1 rounded-lg transition-colors"
                        style={{ color: colors.textSecondary }}
                      >
                        <MapPin className="h-5 w-5" />
                      </button>
                    </div>
                    <h2
                      className="text-lg font-bold mb-2"
                      style={{ color: colors.text }}
                    >
                      {ad.title}
                    </h2>
                    <p
                      className="text-sm mb-2 line-clamp-2"
                      style={{ color: colors.textSecondary }}
                    >
                      {ad.description}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: colors.textSecondary }}
                    >
                      {new Date(ad.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Load More */}
            {pagination && pagination.currentPage < pagination.totalPages && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? t("common.loading") : t("common.loadMore")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Modal - show restaurant location when user taps the ad */}
      {selectedRestaurant?.restaurant != null && (
        <RestaurantMapModal
          open={mapModalVisible}
          onOpenChange={(open) => {
            setMapModalVisible(open);
            if (!open) setSelectedRestaurant(null);
          }}
          restaurant={{
            name: selectedRestaurant.restaurant.name,
            latitude: selectedRestaurant.restaurant.latitude,
            longitude: selectedRestaurant.restaurant.longitude,
            address: selectedRestaurant.restaurant.address,
          }}
        />
      )}
    </div>
  );
}
