"use client";

import { X, Plus, Minus, Trash2, Clock, Flame, ChefHat, ShoppingCart, UtensilsCrossed, Coffee } from "lucide-react";
import { useMenuCart } from "@/contexts/menu-cart-context";
import { useClientTheme } from "@/hooks/useClientTheme";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { orderService, type OrderTypeValue } from "@/features/client/orderService";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, tableNumber } =
    useMenuCart();
  const { colors, isDark, mounted } = useClientTheme();
  const { t } = useTranslation();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderTypeModalOpen, setOrderTypeModalOpen] = useState(false);
  const restaurantId = params?.qrCode as string;

  // Helper function to create a unique key for an item
  const getItemKey = (item: any) => {
    const extrasKey = item.selectedExtras 
      ? JSON.stringify(item.selectedExtras.sort((a: any, b: any) => a.name.localeCompare(b.name)))
      : '';
    return `${item.id}_${extrasKey}`;
  };

  const handleOpenOrderTypeModal = () => {
    if (!restaurantId || items.length === 0) return;
    setOrderTypeModalOpen(true);
  };

  const handlePlaceOrder = async (orderType: OrderTypeValue) => {
    if (!restaurantId || items.length === 0) return;

    setOrderTypeModalOpen(false);
    setIsSubmitting(true);
    try {
      await orderService.createOrder({
        restaurantId,
        tableNumber: tableNumber ?? null,
        orderType,
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          selectedExtras: item.selectedExtras,
          notes: item.notes,
          preparationTime: item.preparationTime,
          baseCalories: item.baseCalories,
          allergies: item.allergies,
          kitchenSection: item.kitchenSection,
        })),
        totalPrice,
      });

      clearCart();
      toast.success(t("menu.orderPlaced") || "Order placed successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(
        error?.response?.data?.message ||
          t("menu.orderError") ||
          "Failed to place order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-full max-w-md z-50 transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          backgroundColor: colors.surface,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderBottomColor: colors.border }}
          >
            <h2 className="text-xl font-bold" style={{ color: colors.text }}>
              Your Order
            </h2>
            <button
              onClick={onClose}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              )}
              style={{ color: colors.text }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p
                  className="text-sm mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Your cart is empty
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={getItemKey(item)}
                    className={cn(
                      "rounded-lg p-3",
                      isDark ? "bg-white/5" : "bg-gray-50"
                    )}
                  >
                    <div className="flex gap-3">
                      {item.image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3
                            className="font-semibold text-sm flex-1"
                            style={{ color: colors.text }}
                          >
                            {item.title}
                          </h3>
                          {item.kitchenSection && (
                            <div
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs flex-shrink-0"
                              style={{
                                backgroundColor: `${colors.primary}15`,
                                color: colors.primary,
                              }}
                            >
                              <ChefHat className="h-2.5 w-2.5" />
                              <span>{item.kitchenSection.name}</span>
                            </div>
                          )}
                        </div>
                        
                        {item.description && (
                          <p
                            className="text-xs mb-1.5 line-clamp-2"
                            style={{ color: colors.textSecondary }}
                          >
                            {item.description}
                          </p>
                        )}

                        {/* Additional Info */}
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          {item.preparationTime && (
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              <Clock className="h-3 w-3" />
                              <span>{item.preparationTime} min</span>
                            </div>
                          )}
                          {(item.baseCalories || (item.selectedExtras && item.selectedExtras.some((e: any) => e.calories > 0))) && (
                            <div
                              className="flex items-center gap-1 text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              <Flame className="h-3 w-3" />
                              <span>
                                {(item.baseCalories || 0) + 
                                  (item.selectedExtras?.reduce((sum: number, extra: any) => sum + (extra.calories || 0), 0) || 0)} cal
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Allergies */}
                        {item.allergies && item.allergies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {item.allergies.map((allergy: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: `${colors.error}15`,
                                  color: colors.error,
                                }}
                              >
                                {allergy}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Selected Extras */}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="mb-1.5 space-y-0.5">
                            {item.selectedExtras.map((extra, idx) => (
                              <p
                                key={idx}
                                className="text-xs flex items-center gap-1"
                                style={{ color: colors.textSecondary }}
                              >
                                <span>+</span>
                                <span>{extra.name}</span>
                                <span style={{ color: colors.primary }}>
                                  (+${(extra.price || 0).toFixed(2)})
                                </span>
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && item.notes.trim() && (
                          <div className="mb-1.5 p-2 rounded" style={{ backgroundColor: `${colors.primary}10` }}>
                            <p
                              className="text-xs font-medium mb-0.5"
                              style={{ color: colors.text }}
                            >
                              {t("menu.notes") || "Notes"}:
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: colors.textSecondary }}
                            >
                              {item.notes}
                            </p>
                          </div>
                        )}

                        {/* Price */}
                        <p
                          className="text-sm font-semibold mb-2"
                          style={{ color: colors.primary }}
                        >
                          $
                          {(
                            item.price +
                            (item.selectedExtras?.reduce(
                              (sum, extra) => sum + (extra.price || 0),
                              0
                            ) || 0)
                          ).toFixed(2)}
                          {item.quantity > 1 && (
                            <span
                              className="ml-1 text-xs font-normal"
                              style={{ color: colors.textSecondary }}
                            >
                              × {item.quantity} = $
                              {(
                                (item.price +
                                  (item.selectedExtras?.reduce(
                                    (sum, extra) => sum + (extra.price || 0),
                                    0
                                  ) || 0)) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          )}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1, item.selectedExtras)
                            }
                            className={cn(
                              "p-1 rounded transition-colors",
                              isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
                            )}
                            style={{ color: colors.text }}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span
                            className="text-sm font-medium w-8 text-center"
                            style={{ color: colors.text }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1, item.selectedExtras)
                            }
                            className={cn(
                              "p-1 rounded transition-colors",
                              isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
                            )}
                            style={{ color: colors.text }}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id, item.selectedExtras)}
                            className={cn(
                              "p-1 rounded transition-colors ml-auto",
                              isDark ? "hover:bg-white/10" : "hover:bg-gray-200"
                            )}
                            style={{ color: colors.error }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div
              className="border-t p-4"
              style={{ borderTopColor: colors.border }}
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-lg font-semibold"
                  style={{ color: colors.text }}
                >
                  Total:
                </span>
                <span
                  className="text-xl font-bold"
                  style={{ color: colors.primary }}
                >
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleOpenOrderTypeModal}
                disabled={isSubmitting || items.length === 0}
                className={cn(
                  "w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors mb-2 flex items-center justify-center gap-2",
                  isSubmitting || items.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90"
                )}
                style={{
                  backgroundColor: colors.primary,
                  color: "white",
                }}
              >
                {isSubmitting ? (
                  <>
                    <span>{t("menu.placingOrder") || "Placing Order..."}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>{t("menu.placeOrder") || "Place Order"}</span>
                  </>
                )}
              </button>
              <button
                onClick={clearCart}
                className={cn(
                  "w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors mb-2",
                  isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                )}
                style={{ color: colors.textSecondary }}
              >
                {t("menu.clearCart") || "Clear Cart"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Type Modal */}
      <Dialog open={orderTypeModalOpen} onOpenChange={setOrderTypeModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: colors.text }}>
              {t("menu.orderTypeTitle") || "Order type"}
            </DialogTitle>
            <DialogDescription style={{ color: colors.textSecondary }}>
              {t("menu.orderTypeDescription") || "Choose how you want your order"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <button
              onClick={() => handlePlaceOrder("ON_TABLE")}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                isDark
                  ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
              style={{ color: colors.text }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <UtensilsCrossed className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <div>
                <p className="font-semibold">
                  {t("menu.orderTypeOnTable") || "At table"}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t("menu.orderTypeOnTableDesc") || "I'm eating in the restaurant"}
                </p>
              </div>
            </button>
            <button
              onClick={() => handlePlaceOrder("TAKE_AWAY")}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                isDark
                  ? "border-white/10 hover:border-white/20 hover:bg-white/5"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
              style={{ color: colors.text }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Coffee className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
              <div>
                <p className="font-semibold">
                  {t("menu.orderTypeTakeAway") || "Take away"}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {t("menu.orderTypeTakeAwayDesc") || "I'll take it with me"}
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
