"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchMenuCategories,
  fetchMenuItems,
  setSelectedCategory,
  setCurrentRestaurantId,
} from "@/features/client";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import Image from "next/image";

export default function MenuPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const qrCode = params?.qrCode as string;

  const { categories, items, selectedCategory, loading, error } =
    useAppSelector((state) => state.clientMenu);

  useEffect(() => {
    if (qrCode) {
      dispatch(setCurrentRestaurantId(qrCode));
      dispatch(fetchMenuCategories(qrCode));
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
      <div className="min-h-screen bg-transparent pb-20 px-5 py-5">
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
          <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
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
            <p className="mt-4 text-sm" style={{ color: colors.textSecondary }}>
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
            <p className="font-semibold mb-2" style={{ color: colors.error }}>
              {t("menu.errorLoadingItems")}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {error.items}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: colors.surface }}
          >
            <p className="font-semibold mb-2" style={{ color: colors.text }}>
              {t("menu.noItems")}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {t("menu.noItemsDesc")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items
              .filter((item: any) => item.isActive)
              .map((item: any) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded-2xl overflow-hidden shadow-lg transition-all",
                    "hover:scale-[1.02] hover:shadow-xl"
                  )}
                  style={{ backgroundColor: colors.surface }}
                >
                  {item.image ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={item.image}
                        alt={item.name}
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
                      className="w-full h-48 flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}10` }}
                    >
                      <span
                        className="text-4xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3
                      className="font-bold text-lg mb-1"
                      style={{ color: colors.text }}
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p
                        className="text-sm mb-3 line-clamp-2"
                        style={{ color: colors.textSecondary }}
                      >
                        {item.description}
                      </p>
                    )}
                    <div
                      className="flex items-center justify-between mt-3 pt-3 border-t"
                      style={{ borderColor: colors.border }}
                    >
                      <p
                        className="text-xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  // Show categories
  return (
    <div className="min-h-screen bg-transparent pb-20 px-5 py-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
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
          <p className="mt-4 text-sm" style={{ color: colors.textSecondary }}>
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
          <p className="font-semibold mb-2" style={{ color: colors.error }}>
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
          <p className="font-semibold mb-2" style={{ color: colors.text }}>
            {t("menu.noCategories")}
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {t("menu.noCategoriesDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories
            .filter((cat: any) => cat.isActive)
            .map((category: any) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "rounded-2xl overflow-hidden shadow-lg transition-all text-left",
                  "hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                )}
                style={{ backgroundColor: colors.surface }}
              >
                {category.image ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={category.image}
                      alt={category.name}
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
                    className="w-full h-48 flex items-center justify-center"
                    style={{ backgroundColor: `${colors.primary}10` }}
                  >
                    <span
                      className="text-4xl font-bold"
                      style={{ color: colors.primary }}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h3
                    className="font-bold text-lg mb-2"
                    style={{ color: colors.text }}
                  >
                    {category.name}
                  </h3>
                  {category.description && (
                    <p
                      className="text-sm line-clamp-1 overflow-hidden text-ellipsis"
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
  );
}
