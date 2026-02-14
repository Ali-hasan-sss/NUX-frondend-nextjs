"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchMenuCategories,
  fetchMenuItems,
  setSelectedCategory,
  setCurrentRestaurantId,
} from "@/features/client";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Plus,
  Clock,
  Flame,
  ChefHat,
  Check,
  Minus,
  Search,
  X,
  UtensilsCrossed,
} from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import Image from "next/image";
import { I18nProvider } from "@/components/client/i18n-provider";
import { AnimatedBackground } from "@/components/client/animated-background";
import { MenuHeader } from "@/components/menu/menu-header";
import { MenuFooter } from "@/components/menu/menu-footer";
import {
  MenuCartProvider,
  useMenuCart,
  CartItemExtra,
} from "@/contexts/menu-cart-context";
import { CartDrawer } from "@/components/menu/cart-drawer";
import { orderService } from "@/features/client/orderService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

function PublicMenuPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { addItem, totalItems, setTableNumber } = useMenuCart();
  const qrCode = params?.qrCode as string;
  const tableNumberParam = searchParams?.get("table");
  const categoryIdParam = searchParams?.get("category");
  const [cartOpen, setCartOpen] = useState(false);
  const [requestingWaiter, setRequestingWaiter] = useState(false);
  const [extrasDialogOpen, setExtrasDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<CartItemExtra[]>([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNotes, setItemNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<any[]>([]);

  const { categories, items, selectedCategory, loading, error, restaurant } =
    useAppSelector((state) => state.clientMenu);

  useEffect(() => {
    if (qrCode) {
      dispatch(setCurrentRestaurantId(qrCode));
      dispatch(fetchMenuCategories(qrCode));
    }
  }, [qrCode, dispatch]);

  // Extract and store table number from query parameter
  useEffect(() => {
    if (tableNumberParam) {
      const tableNum = parseInt(tableNumberParam, 10);
      if (!isNaN(tableNum)) {
        setTableNumber(tableNum);
      }
    } else {
      setTableNumber(null);
    }
  }, [tableNumberParam, setTableNumber]);

  // Sync URL category param with selected category (on load / popstate)
  useEffect(() => {
    if (!categories.length || loading.categories) return;
    const id = categoryIdParam ? parseInt(categoryIdParam, 10) : null;
    if (id && !isNaN(id)) {
      const cat = categories.find((c: any) => c.id === id);
      if (cat) dispatch(setSelectedCategory(cat));
      else dispatch(setSelectedCategory(null));
    } else {
      dispatch(setSelectedCategory(null));
    }
  }, [categoryIdParam, categories, loading.categories, dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchMenuItems(selectedCategory.id));
    }
  }, [selectedCategory, dispatch]);

  // Filter categories and items based on search query
  const filteredCategories = searchQuery
    ? categories.filter(
        (cat: any) =>
          cat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const filteredItems = searchQuery
    ? items.filter(
        (item: any) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const handleRequestWaiter = useCallback(async () => {
    if (!qrCode || !tableNumberParam) return;
    const tableNum = parseInt(tableNumberParam, 10);
    if (isNaN(tableNum)) return;
    setRequestingWaiter(true);
    try {
      await orderService.requestWaiter({
        restaurantId: qrCode,
        tableNumber: tableNum,
      });
      toast.success(t("menu.waiterRequestSent") || "Waiter request sent");
    } catch (err: any) {
      const code = err?.response?.data?.code;
      const msg = err?.response?.data?.message;
      if (code === "TABLE_SESSION_NOT_OPEN") {
        toast.error(
          t("menu.tableSessionNotOpen") ||
            "Table session is not open. Please ask the cashier to start a session."
        );
      } else {
        toast.error(
          msg || t("menu.waiterRequestError") || "Failed to send waiter request"
        );
      }
    } finally {
      setRequestingWaiter(false);
    }
  }, [qrCode, tableNumberParam, t]);

  const buildMenuUrl = useCallback(
    (categoryId: number | null) => {
      const base = `/menu/${qrCode}`;
      const params = new URLSearchParams();
      if (tableNumberParam) params.set("table", tableNumberParam);
      if (categoryId != null) params.set("category", String(categoryId));
      const query = params.toString();
      return query ? `${base}?${query}` : base;
    },
    [qrCode, tableNumberParam]
  );

  const handleCategoryClick = (category: any) => {
    dispatch(setSelectedCategory(category));
    router.push(buildMenuUrl(category.id));
  };

  const handleBackToCategories = () => {
    dispatch(setSelectedCategory(null));
    router.push(buildMenuUrl(null));
  };

  const handleAddItemClick = (item: any) => {
    if (item.extras && Array.isArray(item.extras) && item.extras.length > 0) {
      setSelectedItem(item);
      setSelectedExtras([]);
      setItemQuantity(1);
      setItemNotes("");
      setExtrasDialogOpen(true);
    } else {
      // No extras, add directly
      addItem({
        id: item.id,
        title: item.title,
        description: item.description,
        price:
          item.discountType && item.discountValue
            ? item.discountType === "PERCENTAGE"
              ? item.price * (1 - item.discountValue / 100)
              : item.price - item.discountValue
            : item.price,
        image: item.image,
        baseCalories: item.calories || 0,
        selectedExtras: [],
        preparationTime: item.preparationTime,
        allergies: item.allergies,
        kitchenSection: item.kitchenSection,
        notes: "",
      });
    }
  };

  const handleExtraToggle = (extra: any) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.name === extra.name);
      if (exists) {
        return prev.filter((e) => e.name !== extra.name);
      }
      return [
        ...prev,
        {
          name: extra.name,
          price: extra.price || 0,
          calories: extra.calories || 0,
        },
      ];
    });
  };

  const handleConfirmAddWithExtras = () => {
    if (!selectedItem) return;

    const basePrice =
      selectedItem.discountType && selectedItem.discountValue
        ? selectedItem.discountType === "PERCENTAGE"
          ? selectedItem.price * (1 - selectedItem.discountValue / 100)
          : selectedItem.price - selectedItem.discountValue
        : selectedItem.price;

    // Add item multiple times based on quantity
    for (let i = 0; i < itemQuantity; i++) {
      addItem({
        id: selectedItem.id,
        title: selectedItem.title,
        description: selectedItem.description,
        price: basePrice,
        image: selectedItem.image,
        baseCalories: selectedItem.calories || 0,
        selectedExtras: selectedExtras,
        preparationTime: selectedItem.preparationTime,
        allergies: selectedItem.allergies,
        kitchenSection: selectedItem.kitchenSection,
        notes: itemNotes.trim(),
      });
    }

    setExtrasDialogOpen(false);
    setSelectedItem(null);
    setSelectedExtras([]);
    setItemQuantity(1);
    setItemNotes("");
  };

  const calculateTotalPrice = (item: any, extras: CartItemExtra[]) => {
    const basePrice =
      item.discountType && item.discountValue
        ? item.discountType === "PERCENTAGE"
          ? item.price * (1 - item.discountValue / 100)
          : item.price - item.discountValue
        : item.price;
    const extrasPrice = extras.reduce(
      (sum, extra) => sum + (extra.price || 0),
      0
    );
    return basePrice + extrasPrice;
  };

  const calculateTotalCalories = (item: any, extras: CartItemExtra[]) => {
    const baseCalories = item.calories || 0;
    const extrasCalories = extras.reduce(
      (sum, extra) => sum + (extra.calories || 0),
      0
    );
    return baseCalories + extrasCalories;
  };

  if (!mounted) {
    return null;
  }

  // Show items if category is selected
  if (selectedCategory) {
    return (
      <I18nProvider>
        <AnimatedBackground>
          <div
            className={cn(
              "flex flex-col min-h-screen h-screen",
              tableNumberParam && totalItems > 0 && "pb-28",
              tableNumberParam && totalItems === 0 && "pb-14",
              !tableNumberParam && totalItems > 0 && "pb-14"
            )}
          >
            <MenuHeader
              onCartClick={() => setCartOpen(true)}
              cartCount={totalItems}
              onRequestWaiter={
                tableNumberParam ? handleRequestWaiter : undefined
              }
              isRequestingWaiter={requestingWaiter}
              restaurantLogo={restaurant?.logo}
              restaurantName={restaurant?.name}
            />
            <div
              className="flex-1 min-h-0 overflow-y-auto px-4 py-5 max-w-7xl mx-auto w-full"
              style={{
                // Reserve space above fixed buttons on mobile so footer never overlaps
                paddingBottom:
                  tableNumberParam && totalItems > 0
                    ? "calc(14rem + env(safe-area-inset-bottom, 0px))"
                    : tableNumberParam || totalItems > 0
                      ? "calc(9rem + env(safe-area-inset-bottom, 0px))"
                      : "calc(4rem + env(safe-area-inset-bottom, 0px))",
              }}
            >
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
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

                {/* Search Bar */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    style={{ color: colors.textSecondary }}
                  />
                  <Input
                    type="text"
                    placeholder={
                      t("menu.searchPlaceholder") || "Search for items..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-10 pr-10 h-10",
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/50"
                        : "bg-white border-gray-200 text-gray-900"
                    )}
                    style={{
                      backgroundColor: isDark
                        ? colors.surface
                        : colors.surfaceSolid,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                      style={{ color: colors.textSecondary }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
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
              ) : filteredItems.length === 0 ? (
                <div
                  className="rounded-2xl p-6 text-center"
                  style={{ backgroundColor: colors.surface }}
                >
                  <p
                    className="font-semibold mb-2"
                    style={{ color: colors.text }}
                  >
                    {searchQuery
                      ? t("menu.noSearchResults") || "No results found"
                      : t("menu.noItems") || "No items"}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {searchQuery
                      ? t("menu.noSearchResultsDesc") ||
                        `No items match "${searchQuery}"`
                      : t("menu.noItemsDesc") ||
                        "No items available in this category"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item: any) => {
                    // Calculate final price with discount
                    const finalPrice =
                      item.discountType && item.discountValue
                        ? item.discountType === "PERCENTAGE"
                          ? item.price * (1 - item.discountValue / 100)
                          : item.price - item.discountValue
                        : item.price;

                    return (
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
                            <div className="relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={getImageUrl(item.image)}
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
                              className="w-28 h-28 rounded-lg flex items-center justify-center flex-shrink-0"
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
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3
                                className="font-bold text-lg flex-1"
                                style={{ color: colors.text }}
                              >
                                {item.title}
                              </h3>
                              {item.kitchenSection && (
                                <div
                                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                                  style={{
                                    backgroundColor: `${colors.primary}15`,
                                    color: colors.primary,
                                  }}
                                >
                                  <ChefHat className="h-3 w-3" />
                                  <span className="font-medium">
                                    {item.kitchenSection.name}
                                  </span>
                                </div>
                              )}
                            </div>
                            {item.description && (
                              <p
                                className="text-sm mb-2 line-clamp-2"
                                style={{ color: colors.textSecondary }}
                              >
                                {item.description}
                              </p>
                            )}

                            {/* Additional Info */}
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              {item.preparationTime && (
                                <div
                                  className="flex items-center gap-1 text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{item.preparationTime} min</span>
                                </div>
                              )}
                              {item.calories && (
                                <div
                                  className="flex items-center gap-1 text-xs"
                                  style={{ color: colors.textSecondary }}
                                >
                                  <Flame className="h-3.5 w-3.5" />
                                  <span>{item.calories} cal</span>
                                </div>
                              )}
                            </div>

                            {/* Allergies */}
                            {item.allergies && item.allergies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.allergies.map(
                                  (allergy: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: `${colors.error}15`,
                                        color: colors.error,
                                      }}
                                    >
                                      {allergy}
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                            {/* Extras */}
                            {item.extras &&
                              Array.isArray(item.extras) &&
                              item.extras.length > 0 && (
                                <div className="mb-3">
                                  <p
                                    className="text-xs font-medium mb-1"
                                    style={{ color: colors.textSecondary }}
                                  >
                                    Extras:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {item.extras.map(
                                      (extra: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 rounded text-xs"
                                          style={{
                                            backgroundColor: `${colors.primary}10`,
                                            color: colors.text,
                                          }}
                                        >
                                          +{extra.name} (+$
                                          {extra.price?.toFixed(2) || "0.00"})
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Price and Add Button */}
                            <div
                              className="flex items-center justify-between mt-3 pt-3 border-t"
                              style={{ borderColor: `${colors.text}15` }}
                            >
                              <div className="flex flex-col">
                                {item.discountType && item.discountValue ? (
                                  <div className="flex items-center gap-2">
                                    <p
                                      className="text-lg font-bold"
                                      style={{ color: colors.primary }}
                                    >
                                      ${finalPrice.toFixed(2)}
                                    </p>
                                    <p
                                      className="text-sm line-through"
                                      style={{ color: colors.textSecondary }}
                                    >
                                      ${item.price.toFixed(2)}
                                    </p>
                                    <span
                                      className="px-2 py-0.5 rounded text-xs font-medium"
                                      style={{
                                        backgroundColor: `${colors.error}15`,
                                        color: colors.error,
                                      }}
                                    >
                                      {item.discountType === "PERCENTAGE"
                                        ? `-${item.discountValue}%`
                                        : `-$${item.discountValue.toFixed(2)}`}
                                    </span>
                                  </div>
                                ) : (
                                  <p
                                    className="text-lg font-bold"
                                    style={{ color: colors.primary }}
                                  >
                                    ${item.price.toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleAddItemClick(item)}
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
                    );
                  })}
                </div>
              )}
            </div>
            <MenuFooter />
          </div>
          {tableNumberParam && (
            <button
              type="button"
              onClick={handleRequestWaiter}
              disabled={requestingWaiter}
              className={cn(
                "fixed z-40 flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm shadow-lg transition-opacity active:opacity-90",
                totalItems > 0 ? "bottom-20" : "bottom-6"
              )}
              style={{
                right: "max(1rem, env(safe-area-inset-right))",
                bottom: totalItems > 0 ? undefined : "max(1.5rem, env(safe-area-inset-bottom))",
                backgroundColor: colors.primary,
                color: "white",
              }}
            >
              {requestingWaiter ? (
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
              ) : (
                <UtensilsCrossed className="h-5 w-5 shrink-0" />
              )}
              <span>{t("menu.requestWaiter") || "Request Waiter"}</span>
            </button>
          )}
          {totalItems > 0 && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="fixed left-0 right-0 bottom-0 z-40 w-full py-3.5 px-4 text-center font-semibold text-base shadow-lg transition-opacity active:opacity-90"
              style={{
                backgroundColor: colors.primary,
                color: "white",
                paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
              }}
            >
              {t("menu.viewOrderItems", { count: totalItems }) ||
                `View order items: (${totalItems})`}
            </button>
          )}
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

          {/* Extras Selection Dialog */}
          <Dialog open={extrasDialogOpen} onOpenChange={setExtrasDialogOpen}>
            <DialogContent
              className="sm:max-w-md max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: colors.surface }}
            >
              <DialogHeader>
                <DialogTitle style={{ color: colors.text }}>
                  {selectedItem?.title}
                </DialogTitle>
                <DialogDescription style={{ color: colors.textSecondary }}>
                  {t("menu.customizeItem") || "Customize your item"}
                </DialogDescription>
              </DialogHeader>

              {selectedItem && (
                <div className="space-y-4">
                  {/* Item Image */}
                  {selectedItem.image && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image
                        src={getImageUrl(selectedItem.image)}
                        alt={selectedItem.title}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {!selectedItem.image && (
                    <div
                      className="w-full h-48 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${colors.primary}10` }}
                    >
                      <span
                        className="text-4xl font-bold"
                        style={{ color: colors.primary }}
                      >
                        {selectedItem.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Available Extras */}
                  <div className="space-y-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      {t("menu.availableExtras") || "Available Extras"}
                    </p>
                    <div className="space-y-2">
                      {selectedItem.extras.map((extra: any, idx: number) => {
                        const isSelected = selectedExtras.some(
                          (e) => e.name === extra.name
                        );
                        return (
                          <button
                            key={idx}
                            onClick={() => handleExtraToggle(extra)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all",
                              isSelected
                                ? "border-primary"
                                : "border-transparent hover:border-primary/50"
                            )}
                            style={{
                              backgroundColor: isSelected
                                ? `${colors.primary}10`
                                : `${colors.text}05`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-5 h-5 rounded border-2 flex items-center justify-center",
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-gray-300"
                                )}
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <div className="text-left">
                                <p
                                  className="font-medium text-sm"
                                  style={{ color: colors.text }}
                                >
                                  {extra.name}
                                </p>
                                {extra.calories && (
                                  <p
                                    className="text-xs flex items-center gap-1"
                                    style={{ color: colors.textSecondary }}
                                  >
                                    <Flame className="h-3 w-3" />
                                    {extra.calories} cal
                                  </p>
                                )}
                              </div>
                            </div>
                            <p
                              className="font-semibold text-sm"
                              style={{ color: colors.primary }}
                            >
                              +${(extra.price || 0).toFixed(2)}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="space-y-2">
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      {t("menu.quantity") || "Quantity"}
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setItemQuantity((prev) => Math.max(1, prev - 1))
                        }
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          itemQuantity <= 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:opacity-80"
                        )}
                        style={{
                          backgroundColor: colors.primary,
                          color: "white",
                        }}
                        disabled={itemQuantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span
                        className="text-lg font-bold w-12 text-center"
                        style={{ color: colors.text }}
                      >
                        {itemQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setItemQuantity((prev) => prev + 1)}
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                        )}
                        style={{
                          backgroundColor: colors.primary,
                          color: "white",
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium"
                      style={{ color: colors.text }}
                    >
                      {t("menu.notes") || "Notes"} (
                      {t("menu.optional") || "Optional"})
                    </label>
                    <Textarea
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder={
                        t("menu.notesPlaceholder") ||
                        "Add any special instructions or notes..."
                      }
                      className="min-h-[80px] resize-none"
                      style={{
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderColor: colors.border,
                      }}
                    />
                  </div>

                  {/* Summary */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: `${colors.primary}05`,
                      borderColor: `${colors.primary}20`,
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {t("menu.basePrice") || "Base Price"}
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          $
                          {(selectedItem.discountType &&
                          selectedItem.discountValue
                            ? selectedItem.discountType === "PERCENTAGE"
                              ? selectedItem.price *
                                (1 - selectedItem.discountValue / 100)
                              : selectedItem.price - selectedItem.discountValue
                            : selectedItem.price
                          ).toFixed(2)}
                        </span>
                      </div>
                      {selectedExtras.length > 0 && (
                        <>
                          {selectedExtras.map((extra, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                + {extra.name}
                              </span>
                              <span
                                className="font-medium"
                                style={{ color: colors.text }}
                              >
                                +${(extra.price || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                      <div
                        className="pt-2 border-t flex items-center justify-between"
                        style={{ borderColor: `${colors.text}15` }}
                      >
                        <span
                          className="font-bold"
                          style={{ color: colors.text }}
                        >
                          {t("menu.subtotal") || "Subtotal"}
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: colors.text }}
                        >
                          $
                          {calculateTotalPrice(
                            selectedItem,
                            selectedExtras
                          ).toFixed(2)}
                        </span>
                      </div>
                      {itemQuantity > 1 && (
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm"
                            style={{ color: colors.textSecondary }}
                          >
                            {t("menu.quantity") || "Quantity"}: {itemQuantity}
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: colors.text }}
                          >
                            × {itemQuantity}
                          </span>
                        </div>
                      )}
                      <div
                        className="pt-2 border-t flex items-center justify-between"
                        style={{ borderColor: `${colors.text}15` }}
                      >
                        <span
                          className="font-bold text-base"
                          style={{ color: colors.text }}
                        >
                          {t("menu.total") || "Total"}
                        </span>
                        <span
                          className="font-bold text-lg"
                          style={{ color: colors.primary }}
                        >
                          $
                          {(
                            calculateTotalPrice(selectedItem, selectedExtras) *
                            itemQuantity
                          ).toFixed(2)}
                        </span>
                      </div>
                      {(selectedItem.calories ||
                        selectedExtras.some((e) => e.calories > 0)) && (
                        <div className="flex items-center justify-between pt-2">
                          <span
                            className="text-xs flex items-center gap-1"
                            style={{ color: colors.textSecondary }}
                          >
                            <Flame className="h-3 w-3" />
                            {t("menu.totalCalories") || "Total Calories"}
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: colors.text }}
                          >
                            {calculateTotalCalories(
                              selectedItem,
                              selectedExtras
                            ) * itemQuantity}{" "}
                            cal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setExtrasDialogOpen(false);
                    setSelectedItem(null);
                    setSelectedExtras([]);
                    setItemQuantity(1);
                  }}
                >
                  {t("menu.cancel") || "Cancel"}
                </Button>
                <Button
                  onClick={handleConfirmAddWithExtras}
                  style={{
                    backgroundColor: colors.primary,
                    color: "white",
                  }}
                >
                  {t("menu.addToCart") || "Add to Cart"}
                  {itemQuantity > 1 && ` (${itemQuantity})`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </AnimatedBackground>
      </I18nProvider>
    );
  }

  return (
    <I18nProvider>
      <AnimatedBackground>
        <div
          className={cn(
            "flex flex-col min-h-screen h-screen",
            tableNumberParam && totalItems > 0 && "pb-28",
            tableNumberParam && totalItems === 0 && "pb-14",
            !tableNumberParam && totalItems > 0 && "pb-14"
          )}
        >
          <MenuHeader
            onCartClick={() => setCartOpen(true)}
            cartCount={totalItems}
            onRequestWaiter={tableNumberParam ? handleRequestWaiter : undefined}
            isRequestingWaiter={requestingWaiter}
            restaurantLogo={restaurant?.logo}
            restaurantName={restaurant?.name}
          />
          <div
            className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 max-w-7xl mx-auto w-full"
            style={{
              // Reserve space above fixed buttons on mobile so footer never overlaps
              paddingBottom:
                tableNumberParam && totalItems > 0
                  ? "calc(14rem + env(safe-area-inset-bottom, 0px))"
                  : tableNumberParam || totalItems > 0
                    ? "calc(9rem + env(safe-area-inset-bottom, 0px))"
                    : "calc(4rem + env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <h1
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: colors.text }}
                >
                  {t("menu.title")}
                </h1>
                <div className="relative flex-1 sm:max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                    style={{ color: colors.textSecondary }}
                  />
                  <Input
                    type="text"
                    placeholder={
                      t("menu.searchPlaceholder") ||
                      "Search for items or categories..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-10 pr-10 h-10",
                      isDark
                        ? "bg-white/5 border-white/10 text-white placeholder:text-white/50"
                        : "bg-white border-gray-200 text-gray-900"
                    )}
                    style={{
                      backgroundColor: isDark
                        ? colors.surface
                        : colors.surfaceSolid,
                      borderColor: colors.border,
                      color: colors.text,
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                      style={{ color: colors.textSecondary }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
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
            ) : filteredCategories.length === 0 && searchQuery ? (
              <div
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: colors.surface }}
              >
                <p
                  className="font-semibold mb-2"
                  style={{ color: colors.text }}
                >
                  {t("menu.noSearchResults") || "No results found"}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t("menu.noSearchResultsDesc") ||
                    `No categories or items match "${searchQuery}"`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {filteredCategories.map((category: any) => (
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
                          src={getImageUrl(category.image)}
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
                          className="text-xs sm:text-sm line-clamp-1 flex-shrink-0 overflow-hidden text-ellipsis"
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
        {tableNumberParam && (
          <button
            type="button"
            onClick={handleRequestWaiter}
            disabled={requestingWaiter}
            className={cn(
              "fixed z-40 flex items-center justify-center gap-2 rounded-full py-3 px-4 font-semibold text-sm shadow-lg transition-opacity active:opacity-90",
              totalItems > 0 ? "bottom-20" : "bottom-6"
            )}
            style={{
              right: "max(1rem, env(safe-area-inset-right))",
              bottom: totalItems > 0 ? undefined : "max(1.5rem, env(safe-area-inset-bottom))",
              backgroundColor: colors.primary,
              color: "white",
            }}
          >
            {requestingWaiter ? (
              <Loader2 className="h-5 w-5 animate-spin shrink-0" />
            ) : (
              <UtensilsCrossed className="h-5 w-5 shrink-0" />
            )}
            <span>{t("menu.requestWaiter") || "Request Waiter"}</span>
          </button>
        )}
        {totalItems > 0 && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="fixed left-0 right-0 bottom-0 z-40 w-full py-3.5 px-4 text-center font-semibold text-base shadow-lg transition-opacity active:opacity-90"
            style={{
              backgroundColor: colors.primary,
              color: "white",
              paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
            }}
          >
            {t("menu.viewOrderItems", { count: totalItems }) ||
              `View order items: (${totalItems})`}
          </button>
        )}
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
