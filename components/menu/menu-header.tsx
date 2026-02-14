"use client";

import Image from "next/image";
import { useClientTheme } from "@/hooks/useClientTheme";
import { useMenuCart } from "@/contexts/menu-cart-context";
import { cn, getImageUrl } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UtensilsCrossed } from "lucide-react";

interface MenuHeaderProps {
  onCartClick?: () => void;
  cartCount?: number;
  onRequestWaiter?: () => void;
  isRequestingWaiter?: boolean;
  /** Restaurant logo URL; when set, shown instead of app logo */
  restaurantLogo?: string | null;
  restaurantName?: string | null;
}

export function MenuHeader({
  onCartClick,
  cartCount = 0,
  onRequestWaiter,
  isRequestingWaiter = false,
  restaurantLogo,
  restaurantName,
}: MenuHeaderProps) {
  const { colors, isDark, mounted } = useClientTheme();
  const { tableNumber } = useMenuCart();
  const { t } = useTranslation();

  if (!mounted) {
    return null;
  }

  const logoUrl = getImageUrl(restaurantLogo ?? undefined);
  const showLogo = !!logoUrl;
  const showName = !showLogo && !!restaurantName;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-sm transition-colors",
        isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
      )}
      style={{
        borderBottomColor: colors.border,
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {showLogo ? (
            <Image
              src={logoUrl}
              alt={restaurantName || "Restaurant"}
              width={72}
              height={28}
              className="object-contain shrink-0"
              priority
              unoptimized
            />
          ) : showName ? (
            <span
              className="font-semibold text-base truncate"
              style={{ color: colors.text }}
            >
              {restaurantName}
            </span>
          ) : (
            <span
              className="font-semibold text-base text-muted-foreground truncate"
              style={{ color: colors.textSecondary }}
            >
              {t("menu.title") || "Menu"}
            </span>
          )}
          {tableNumber && (
            <div
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium",
                isDark
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              {t("menu.table") || "Table"}: {tableNumber}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {tableNumber != null && onRequestWaiter && (
            <button
              type="button"
              onClick={onRequestWaiter}
              disabled={isRequestingWaiter}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                isDark
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("menu.requestWaiter") || "Request Waiter"}
              </span>
            </button>
          )}
          <LanguageSwitcher />
          <ThemeToggle />
          {onCartClick && (
            <button
              onClick={onCartClick}
              className={cn(
                "relative p-2 rounded-lg transition-colors",
                isDark
                  ? "text-white hover:bg-white/10"
                  : "text-gray-900 hover:bg-gray-100"
              )}
              style={{
                color: colors.primary,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
                  style={{ backgroundColor: colors.primary }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
