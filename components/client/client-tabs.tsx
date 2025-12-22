"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Tag, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useClientTheme } from "@/hooks/useClientTheme";

const tabs = [
  { id: "home", translationKey: "tabs.home", icon: Home, path: "/client/home" },
  {
    id: "promotions",
    translationKey: "tabs.promotions",
    icon: Tag,
    path: "/client/promotions",
  },
  {
    id: "purchase",
    translationKey: "tabs.purchase",
    icon: ShoppingBag,
    path: "/client/purchase",
  },
  {
    id: "account",
    translationKey: "tabs.account",
    icon: User,
    path: "/client/account",
  },
];

export function ClientTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();

  if (!mounted) {
    return null;
  }

  return (
    <nav
      className={cn(
        "sticky bottom-0 z-50 border-t backdrop-blur-sm transition-colors",
        isDark
          ? "bg-[rgba(26,31,58,0.95)] shadow-[0_-2px_8px_rgba(0,0,0,0.3)]"
          : "bg-[rgba(255,255,255,0.95)] shadow-[0_-2px_8px_rgba(0,0,0,0.1)]"
      )}
      style={{
        borderTopColor: colors.border,
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors flex-1",
                isActive
                  ? "text-[#00D9FF]"
                  : isDark
                  ? "text-[rgba(255,255,255,0.75)]"
                  : "text-[rgba(26,26,26,0.75)]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">
                {t(tab.translationKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
