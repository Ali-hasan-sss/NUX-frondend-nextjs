"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/app/hooks";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { DrawerMenu } from "./drawer-menu";
import { NotificationDropdown } from "./notification-dropdown";
import { useClientTheme } from "@/hooks/useClientTheme";
import { cn } from "@/lib/utils";

export function ClientHeader() {
  const { user } = useAppSelector((state) => state.auth);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { colors, isDark, mounted } = useClientTheme();

  // TODO: Load unread notifications count
  useEffect(() => {
    // Load unread count logic here
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b backdrop-blur-sm transition-colors",
          isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]"
        )}
        style={{
          borderBottomColor: colors.border,
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "text-white hover:bg-white/10"
                : "text-gray-900 hover:bg-gray-100"
            )}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Image
            src="/images/logo.png"
            alt="Logo"
            width={80}
            height={50}
            className="object-contain"
          />

          <button
            onClick={() => setNotificationsOpen(true)}
            className={cn(
              "relative p-2 rounded-lg transition-colors",
              isDark
                ? "text-white hover:bg-white/10"
                : "text-gray-900 hover:bg-gray-100"
            )}
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <DrawerMenu open={drawerOpen} onOpenChange={setDrawerOpen} />
      <NotificationDropdown
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </>
  );
}
