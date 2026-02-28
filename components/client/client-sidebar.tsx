"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Tag, ShoppingBag, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
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

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();

  if (!mounted) {
    return null;
  }

  return (
    <aside
      className={cn(
        "hidden md:flex md:flex-col md:w-56 lg:w-64 shrink-0 border-r",
        isDark
          ? "bg-[rgba(26,31,58,0.98)] border-gray-700"
          : "bg-[rgba(255,255,255,0.98)] border-gray-200"
      )}
      style={{
        backgroundColor: colors.background,
        borderRightColor: colors.border,
      }}
    >
      <div className="p-4 border-b" style={{ borderBottomColor: colors.border }}>
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={100}
          height={50}
          className="object-contain w-full h-auto"
        />
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                isActive
                  ? "text-white"
                  : isDark
                    ? "text-white/75 hover:bg-white/10 hover:text-white"
                    : "text-gray-700 hover:bg-gray-100"
              )}
              style={{
                backgroundColor: isActive ? colors.primary : undefined,
              }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="font-medium">{t(tab.translationKey)}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
