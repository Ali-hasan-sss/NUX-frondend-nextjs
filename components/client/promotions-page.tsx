"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { fetchAds, refreshAds, setFilters } from "@/features/client";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { Search, Filter, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { RestaurantMapModal } from "./restaurant-map-modal";
import { Ad } from "@/features/client/ads/adsTypes";

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
  const [showFilters, setShowFilters] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Ad | null>(null);

  const filterOptions = [
    { key: "food", label: t("promotions.food") },
    { key: "drink", label: t("promotions.drinks") },
  ];

  // Load ads
  const loadAds = useCallback(
    (page: number = 1, append: boolean = false) => {
      const categoryFilter = selectedFilters.find(
        (f) => f === "food" || f === "drink"
      );

      const adsFilters = {
        page,
        pageSize: 10,
        search: searchQuery.trim() || undefined,
        category: categoryFilter || undefined,
      };

      dispatch(fetchAds({ filters: adsFilters, append }));
    },
    [searchQuery, selectedFilters, dispatch]
  );

  // Initial fetch and when filters/search change
  useEffect(() => {
    const categoryFilter = selectedFilters.find(
      (f) => f === "food" || f === "drink"
    );

    const adsFilters = {
      page: 1,
      pageSize: 10,
      search: searchQuery.trim() || undefined,
      category: categoryFilter || undefined,
    };

    dispatch(fetchAds({ filters: adsFilters, append: false }));
  }, [searchQuery, selectedFilters, dispatch]);

  // Handle refresh
  const handleRefresh = () => {
    const categoryFilter = selectedFilters.find(
      (f) => f === "food" || f === "drink"
    );
    const adsFilters = {
      page: 1,
      pageSize: 10,
      search: searchQuery.trim() || undefined,
      category: categoryFilter || undefined,
    };
    dispatch(refreshAds(adsFilters));
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
                {selectedFilters.length > 0 && (
                  <button
                    onClick={() => setSelectedFilters([])}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: colors.error }}
                  >
                    {t("common.clear")}
                  </button>
                )}
              </div>
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
            {ads.map((ad) => {
              const imageUri =
                ad.image ||
                ad.restaurant.logo ||
                "https://via.placeholder.com/400x160?text=No+Image";

              return (
                <button
                  key={ad.id}
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

      {/* Map Modal */}
      {selectedRestaurant && (
        <RestaurantMapModal
          open={mapModalVisible}
          onOpenChange={setMapModalVisible}
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
