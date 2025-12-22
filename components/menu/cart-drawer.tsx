"use client";

import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useMenuCart } from "@/contexts/menu-cart-context";
import { useClientTheme } from "@/hooks/useClientTheme";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useMenuCart();
  const { colors, isDark, mounted } = useClientTheme();

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
                    key={item.id}
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
                        <h3
                          className="font-semibold text-sm mb-1 truncate"
                          style={{ color: colors.text }}
                        >
                          {item.title}
                        </h3>
                        <p
                          className="text-xs mb-2"
                          style={{ color: colors.primary }}
                        >
                          ${item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
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
                              updateQuantity(item.id, item.quantity + 1)
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
                            onClick={() => removeItem(item.id)}
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
                onClick={clearCart}
                className={cn(
                  "w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors mb-2",
                  isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
                )}
                style={{ color: colors.textSecondary }}
              >
                Clear Cart
              </button>
              <p
                className="text-xs text-center"
                style={{ color: colors.textSecondary }}
              >
                Note: This is a preview. Orders are not saved.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
