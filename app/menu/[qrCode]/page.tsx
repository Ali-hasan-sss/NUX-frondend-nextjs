"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchMenuCategories,
  fetchMenuItems,
  setSelectedCategory,
  setCurrentRestaurantId,
} from "@/features/client";
import { ArrowLeft, Loader2, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import Image from "next/image";
import { I18nProvider } from "@/components/client/i18n-provider";
import { AnimatedBackground } from "@/components/client/animated-background";
import { MenuHeader } from "@/components/menu/menu-header";
import { MenuFooter } from "@/components/menu/menu-footer";
import { MenuCartProvider, useMenuCart } from "@/contexts/menu-cart-context";
import { CartDrawer } from "@/components/menu/cart-drawer";

function PublicMenuPageContent() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { addItem, totalItems } = useMenuCart();
  const qrCode = params?.qrCode as string;
  const [cartOpen, setCartOpen] = useState(false);

  const { categories, items, selectedCategory, loading, error } =
    useAppSelector((state) => state.clientMenu);

  useEffect(() => {
    if (qrCode) {
      console.log("📋 Menu Page: Fetching categories for QR code:", qrCode);
      dispatch(setCurrentRestaurantId(qrCode));
      dispatch(fetchMenuCategories(qrCode));
    } else {
      console.warn("⚠️ Menu Page: No QR code found in URL params");
    }
  }, [qrCode, dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchMenuItems(selectedCategory.id));
    }
  }, [selectedCategory, dispatch]);

  const handleCategoryClick = (category: any) => {
    dispatch(setSelectedCategory(category));
  };

  const handleBackToCategories = () => {
    dispatch(setSelectedCategory(null));
  };

  if (!mounted) {
    return null;
  }

  // Show items if category is selected
  if (selectedCategory) {
    return (
      <I18nProvider>
        <AnimatedBackground>
          <div className="flex flex-col min-h-screen">
            <MenuHeader
              onCartClick={() => setCartOpen(true)}
              cartCount={totalItems}
            />
            <div className="flex-1 pb-20 px-4 py-5 max-w-7xl mx-auto w-full">
              {/* Header */}
              <div className="mb-6 flex items-center gap-4">
                <button
                  onClick={handleBackToCategories}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                  )}
                  style={{ color: colors.text }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1
                  className="text-2xl font-bold flex-1"
                  style={{ color: colors.text }}
                >
                  {selectedCategory.title}
                </h1>
              </div>

              {selectedCategory.description && (
                <p
                  className="text-sm mb-6"
                  style={{ color: colors.textSecondary }}
                >
                  {selectedCategory.description}
                </p>
              )}

              {/* Loading Items */}
              {loading.items ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    className="h-8 w-8 animate-spin"
                    style={{ color: colors.primary }}
                  />
                  <p
                    className="mt-4 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {t("menu.loadingItems")}...
                  </p>
                </div>
              ) : error.items ? (
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{
                    backgroundColor: `${colors.error}20`,
                    borderColor: colors.error,
                    borderWidth: "1px",
                  }}
                >
                  <AlertCircle
                    className="h-6 w-6 mx-auto mb-2"
                    style={{ color: colors.error }}
                  />
                  <p
                    className="font-semibold mb-2"
                    style={{ color: colors.error }}
                  >
                    {t("menu.errorLoadingItems")}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {error.items}
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <p
                    className="font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    {t("menu.noItems")}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {t("menu.noItemsDesc")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-xl overflow-hidden shadow-md transition-all",
                        "hover:shadow-lg"
                      )}
                      style={{ backgroundColor: colors.surface }}
                    >
                      <div className="flex gap-4 p-4">
                        {item.image ? (
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.title}
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
                            className="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${colors.primary}10` }}
                          >
                            <span
                              className="text-2xl font-bold"
                              style={{ color: colors.primary }}
                            >
                              {item.title.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-lg mb-1"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </h3>
                          {item.description && (
                            <p
                              className="text-sm mb-2 line-clamp-2"
                              style={{ color: colors.textSecondary }}
                            >
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <p
                              className="text-lg font-bold"
                              style={{ color: colors.primary }}
                            >
                              ${item.price.toFixed(2)}
                            </p>
                            <button
                              onClick={() => addItem(item)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                "hover:opacity-90"
                              )}
                              style={{
                                backgroundColor: colors.primary,
                                color: "white",
                              }}
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <MenuFooter />
          </div>
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </AnimatedBackground>
      </I18nProvider>
    );
  }

  // Show categories
  return (
    <I18nProvider>
      <AnimatedBackground>
        <div className="flex flex-col min-h-screen">
          <MenuHeader
            onCartClick={() => setCartOpen(true)}
            cartCount={totalItems}
          />
          <div className="flex-1 pb-20 px-3 sm:px-4 py-4 sm:py-5 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {t("menu.title")}
              </h1>
            </div>

            {/* Loading Categories */}
            {loading.categories ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2
                  className="h-8 w-8 animate-spin"
                  style={{ color: colors.primary }}
                />
                <p
                  className="mt-4 text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  {t("menu.loadingCategories")}...
                </p>
              </div>
            ) : error.categories ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  backgroundColor: `${colors.error}20`,
                  borderColor: colors.error,
                  borderWidth: "1px",
                }}
              >
                <AlertCircle
                  className="h-6 w-6 mx-auto mb-2"
                  style={{ color: colors.error }}
                />
                <p
                  className="font-semibold mb-2"
                  style={{ color: colors.error }}
                >
                  {t("menu.errorLoadingCategories")}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {error.categories}
                </p>
              </div>
            ) : categories.length === 0 ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: colors.surface }}
              >
                <p
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  {t("menu.noCategories")}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t("menu.noCategoriesDesc")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {categories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className={cn(
                      "rounded-2xl overflow-hidden shadow-lg transition-all text-left",
                      "hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl",
                      "flex flex-col h-full"
                    )}
                    style={{
                      backgroundColor: colors.surface,
                      minHeight: "200px",
                      maxHeight: "200px",
                    }}
                  >
                    {category.image ? (
                      <div className="relative w-full h-32 flex-shrink-0">
                        <Image
                          src={category.image}
                          alt={category.title}
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
                        className="w-full h-32 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${colors.primary}10` }}
                      >
                        <span
                          className="text-3xl font-bold"
                          style={{ color: colors.primary }}
                        >
                          {category.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-h-0">
                      <h3
                        className="font-bold text-base sm:text-lg mb-1 line-clamp-1"
                        style={{ color: colors.text }}
                      >
                        {category.title}
                      </h3>
                      {category.description && (
                        <p
                          className="text-xs sm:text-sm line-clamp-2 flex-shrink-0"
                          style={{ color: colors.textSecondary }}
                        >
                          {category.description}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <MenuFooter />
        </div>
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      </AnimatedBackground>
    </I18nProvider>
  );
}

export default function PublicMenuPage() {
  return (
    <MenuCartProvider>
      <PublicMenuPageContent />
    </MenuCartProvider>
  );
}
