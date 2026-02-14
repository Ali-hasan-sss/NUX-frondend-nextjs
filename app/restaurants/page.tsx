"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn, getImageUrl } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search, Store, MapPin, Loader2, AlertCircle, Navigation, ArrowUpDown, RefreshCw, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { axiosInstance } from "@/utils/axiosInstance";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  logo?: string;
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  distance?: number; // Distance in kilometers
}

type SortOption = "name" | "distance" | "newest";

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function RestaurantsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
      <RestaurantsPageContent />
  );
}

function RestaurantsPageContent() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isDark = theme === "dark" || theme === "system";

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError(t("restaurants.geolocationNotSupported") || "Geolocation is not supported by your browser");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLoadingLocation(false);
        setError(t("restaurants.locationError") || "Unable to get your location");
      }
    );
  };

  useEffect(() => {
    // Try to get user location on mount
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          // Don't set error on mount, just silently fail
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Filter and sort restaurants
  useEffect(() => {
    let filtered = [...restaurants];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Calculate distances if user location is available
    if (userLocation) {
      filtered = filtered.map((restaurant) => {
        if (restaurant.latitude && restaurant.longitude) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            restaurant.latitude,
            restaurant.longitude
          );
          return { ...restaurant, distance };
        }
        return restaurant;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          if (!userLocation) return 0;
          const distA = a.distance ?? Infinity;
          const distB = b.distance ?? Infinity;
          return distA - distB;
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
          // Assuming restaurants have createdAt, fallback to name
          return 0; // You can add createdAt to Restaurant interface if needed
        default:
          return 0;
      }
    });

    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants, sortBy, userLocation]);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get("/restaurants");
      // The API returns { success, message, data: { restaurants, pagination } }
      const restaurantsData = response.data?.data?.restaurants || response.data?.data || [];
      // Filter only active restaurants (though API already filters by isActive: true)
      const activeRestaurants = Array.isArray(restaurantsData) 
        ? restaurantsData.filter((r: Restaurant) => r.isActive !== false)
        : [];
      setRestaurants(activeRestaurants);
      setFilteredRestaurants(activeRestaurants);
    } catch (err: any) {
      console.error("Error fetching restaurants:", err);
      setError(err?.response?.data?.message || t("restaurants.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantClick = (restaurantId: string) => {
    router.push(`/menu/${restaurantId}`);
  };

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300",
        isDark
          ? "bg-gradient-to-b from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
          : "bg-gradient-to-b from-gray-50 via-white to-gray-100"
      )}
    >
      <Header />
      <RestaurantsContent
        key={i18n.language}
        restaurants={filteredRestaurants}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRestaurantClick={handleRestaurantClick}
        isLoading={isLoading}
        error={error}
        isDark={isDark}
        sortBy={sortBy}
        onSortChange={setSortBy}
        userLocation={userLocation}
        isLoadingLocation={isLoadingLocation}
        onGetLocation={getUserLocation}
      />
      <Footer />
    </div>
  );
}

function RestaurantsContent({
  restaurants,
  searchQuery,
  onSearchChange,
  onRestaurantClick,
  isLoading,
  error,
  isDark,
  sortBy,
  onSortChange,
  userLocation,
  isLoadingLocation,
  onGetLocation,
}: {
  restaurants: Restaurant[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRestaurantClick: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  isDark: boolean;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  userLocation: { lat: number; lng: number } | null;
  isLoadingLocation: boolean;
  onGetLocation: () => void;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main >
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, -40, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={cn(
                "text-4xl lg:text-5xl xl:text-6xl font-bold mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.restaurants.title") || "Browse Restaurants"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={cn(
                "text-xl text-balance max-w-2xl mx-auto",
                isDark ? "text-white/70" : "text-gray-600"
              )}
            >
              {t("landing.restaurants.subtitle") || "Discover amazing restaurants and explore their menus"}
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="relative">
              <Search
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5",
                  isDark ? "text-white/50" : "text-gray-400"
                )}
              />
              <Input
                type="text"
                placeholder={t("landing.restaurants.searchPlaceholder") || "Search restaurants by name or location..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  "pl-12 h-14 text-lg",
                  isDark
                    ? "bg-[#1A1F3A]/80 border-purple-500/20 text-white placeholder:text-white/50"
                    : "bg-white border-gray-200 text-gray-900"
                )}
              />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className={cn("flex flex-col sm:flex-row gap-3 items-center", isRTL ? "sm:flex-row-reverse" : "")}>
              {/* Sort By Buttons */}
              <div className={cn("flex items-center gap-2 flex-wrap", isRTL ? "flex-row-reverse" : "")}>
                <ArrowUpDown
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isDark ? "text-white/50" : "text-gray-400",
                    isRTL ? "ml-2" : "mr-2"
                  )}
                />
                <div className={cn("flex gap-2 flex-wrap", isRTL ? "flex-row-reverse" : "")}>
                  <Button
                    type="button"
                    variant={sortBy === "name" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortChange("name")}
                    className={cn(
                      "whitespace-nowrap",
                      isDark && sortBy !== "name"
                        ? "bg-[#1A1F3A]/80 border-purple-500/20 text-white hover:bg-purple-500/20"
                        : ""
                    )}
                  >
                    {t("landing.restaurants.sortByName") || "Name (A-Z)"}
                  </Button>
                  <Button
                    type="button"
                    variant={sortBy === "distance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortChange("distance")}
                    disabled={!userLocation}
                    className={cn(
                      "whitespace-nowrap",
                      isDark && sortBy !== "distance"
                        ? "bg-[#1A1F3A]/80 border-purple-500/20 text-white hover:bg-purple-500/20"
                        : ""
                    )}
                  >
                    {t("landing.restaurants.sortByDistance") || "Distance (Nearest)"}
                  </Button>
                  <Button
                    type="button"
                    variant={sortBy === "newest" ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSortChange("newest")}
                    className={cn(
                      "whitespace-nowrap",
                      isDark && sortBy !== "newest"
                        ? "bg-[#1A1F3A]/80 border-purple-500/20 text-white hover:bg-purple-500/20"
                        : ""
                    )}
                  >
                    {t("landing.restaurants.sortByNewest") || "Newest"}
                  </Button>
                </div>
              </div>

              {/* Location Status Badge - Only show when sorting by distance */}
              {sortBy === "distance" && (
                <div className={cn("flex items-center gap-2", isRTL ? "flex-row-reverse" : "")}>
                  <Badge
                    variant={userLocation ? "default" : "outline"}
                    className={cn(
                      "flex items-center gap-1.5",
                      userLocation
                        ? isDark
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-green-50 text-green-600 border-green-200"
                        : isDark
                        ? "bg-[#1A1F3A]/80 text-white/70 border-purple-500/20"
                        : "bg-white text-gray-600 border-gray-200"
                    )}
                  >
                    {userLocation ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t("landing.restaurants.locationDetected") || "Location Detected"}</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-3 w-3" />
                        <span>{t("landing.restaurants.locationNotDetected") || "Location Not Detected"}</span>
                      </>
                    )}
                  </Badge>
                  {!userLocation && (
                    <button
                      onClick={onGetLocation}
                      disabled={isLoadingLocation}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isDark
                          ? "text-white/70 hover:text-white hover:bg-purple-500/20"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                        isLoadingLocation && "opacity-50 cursor-not-allowed"
                      )}
                      title={t("landing.restaurants.retryLocation") || "Retry Location"}
                    >
                      {isLoadingLocation ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                className={cn(
                  "h-12 w-12 animate-spin mb-4",
                  isDark ? "text-cyan-400" : "text-cyan-600"
                )}
              />
              <p
                className={cn(
                  "text-lg",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                {t("landing.restaurants.loading") || "Loading restaurants..."}
              </p>
            </div>
          ) : error ? (
            <div
              className={cn(
                "rounded-2xl p-8 text-center max-w-md mx-auto",
                isDark
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-red-50 border border-red-200"
              )}
            >
              <AlertCircle
                className={cn(
                  "h-10 w-10 mx-auto mb-4",
                  isDark ? "text-red-400" : "text-red-600"
                )}
              />
              <h3
                className={cn(
                  "text-xl font-semibold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {t("landing.restaurants.error") || "Error"}
              </h3>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                {error}
              </p>
            </div>
          ) : restaurants.length === 0 ? (
            <div
              className={cn(
                "rounded-2xl p-8 text-center max-w-md mx-auto",
                isDark
                  ? "bg-[#1A1F3A]/80 border border-purple-500/20"
                  : "bg-white border border-gray-200"
              )}
            >
              <Store
                className={cn(
                  "h-12 w-12 mx-auto mb-4",
                  isDark ? "text-white/50" : "text-gray-400"
                )}
              />
              <h3
                className={cn(
                  "text-xl font-semibold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {t("landing.restaurants.noRestaurants") || "No restaurants found"}
              </h3>
              <p
                className={cn(
                  "text-sm",
                  isDark ? "text-white/70" : "text-gray-600"
                )}
              >
                {searchQuery
                  ? t("landing.restaurants.noResults") || "Try adjusting your search"
                  : t("landing.restaurants.empty") || "No restaurants available at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={cn(
                      "h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
                      isDark
                        ? "bg-[#1A1F3A]/80 border-purple-500/20 hover:border-purple-500/40"
                        : "bg-white border-gray-200 hover:border-cyan-300 hover:shadow-cyan-100"
                    )}
                    onClick={() => onRestaurantClick(restaurant.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        {/* Logo */}
                        {restaurant.logo ? (
                          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400/20">
                            <Image
                              src={getImageUrl(restaurant.logo)!}
                              alt={restaurant.name}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold",
                              isDark
                                ? "bg-purple-500/20 text-cyan-400"
                                : "bg-cyan-100 text-cyan-600"
                            )}
                          >
                            {restaurant.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Name */}
                        <h3
                          className={cn(
                            "text-xl font-bold",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {restaurant.name}
                        </h3>

                        {/* Address */}
                        {restaurant.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin
                              className={cn(
                                "h-4 w-4 flex-shrink-0",
                                isDark ? "text-white/50" : "text-gray-400"
                              )}
                            />
                            <p
                              className={cn(
                                "line-clamp-2",
                                isDark ? "text-white/70" : "text-gray-600"
                              )}
                            >
                              {restaurant.address}
                            </p>
                          </div>
                        )}

                        {/* Distance */}
                        {restaurant.distance !== undefined && restaurant.distance < Infinity && (
                          <div className="flex items-center gap-1 text-sm">
                            <Navigation
                              className={cn(
                                "h-3 w-3",
                                isDark ? "text-cyan-400" : "text-cyan-600"
                              )}
                            />
                            <span
                              className={cn(
                                "font-medium",
                                isDark ? "text-cyan-400" : "text-cyan-600"
                              )}
                            >
                              {restaurant.distance < 1
                                ? `${Math.round(restaurant.distance * 1000)} ${t("landing.restaurants.meters") || "m"}`
                                : `${restaurant.distance.toFixed(1)} ${t("landing.restaurants.km") || "km"}`}
                            </span>
                          </div>
                        )}

                        {/* View Menu Button */}
                        <div
                          className={cn(
                            "mt-2 px-4 py-2 rounded-lg font-medium transition-colors",
                            isDark
                              ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white hover:from-cyan-500 hover:to-cyan-700"
                              : "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700"
                          )}
                        >
                          {t("landing.restaurants.viewMenu") || "View Menu"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
