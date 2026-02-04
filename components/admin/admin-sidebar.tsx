"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { fetchUnreadCount } from "@/features/notifications/notificationsThunks";
import {
  fetchAdminPermissions,
  clearAdminPermissions,
} from "@/features/admin/subadmins/adminPermissionsSlice";
import type { SubAdminPermissionType } from "@/features/admin/subadmins/subadminTypes";
import { useLanguage } from "@/hooks/use-language";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Store,
  FileText,
  UserCog,
} from "lucide-react";

function getNavItems(
  t: (key: import("@/lib/translations").TranslationKey) => string
): {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: SubAdminPermissionType;
  adminOnly?: boolean;
}[] {
  return [
    { name: t("overview"), href: "/admin", icon: LayoutDashboard },
    {
      name: t("users"),
      href: "/admin/users",
      icon: Users,
      permission: "MANAGE_USERS",
    },
    {
      name: t("subadmins"),
      href: "/admin/subadmins",
      icon: UserCog,
      adminOnly: true,
    },
    {
      name: t("restaurants"),
      href: "/admin/restaurants",
      icon: Store,
      permission: "MANAGE_RESTAURANTS",
    },
    {
      name: t("subscriptions"),
      href: "/admin/subscriptions",
      icon: CreditCard,
      permission: "MANAGE_SUBSCRIPTIONS",
    },
    {
      name: t("plans"),
      href: "/admin/plans",
      icon: Package,
      permission: "MANAGE_PLANS",
    },
    {
      name: t("invoices"),
      href: "/admin/invoices",
      icon: FileText,
      adminOnly: true,
    },
    { name: t("notifications"), href: "/admin/notifications", icon: Bell },
    {
      name: t("settings"),
      href: "/admin/settings",
      icon: Settings,
      adminOnly: true,
    },
  ];
}

export function AdminSidebar() {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { permissions, role } = useAppSelector(
    (state) => state.adminPermissions
  );
  const router = useRouter();
  const allNavItems = useMemo(() => getNavItems(t), [t]);

  // Fetch admin permissions (for sub-admin sidebar filtering) and unread count
  React.useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "SUBADMIN") {
      dispatch(fetchAdminPermissions());
    }
    dispatch(fetchUnreadCount());
  }, [dispatch, user?.role]);

  const navigation = useMemo(() => {
    const isMainAdmin = role === "ADMIN";
    return allNavItems.filter((item) => {
      if (item.adminOnly && !isMainAdmin) return false;
      if (!item.permission) return true;
      if (isMainAdmin) return true;
      return permissions.includes(item.permission);
    });
  }, [role, permissions, allNavItems]);

  const handleLogout = () => {
    dispatch(clearAdminPermissions());
    dispatch(logout());
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 sidebar-panel transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:rounded-e-2xl lg:my-2 lg:ml-2 lg:h-[calc(100vh-1rem)]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto sidebar-scroll">
          {/* Brand */}
          <div
            onClick={() => router.push("/")}
            className="sidebar-brand mx-4 mt-4 flex cursor-pointer items-center gap-3 px-4 py-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background/80">
              <Image
                src="/logo.png"
                alt="NUX"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="block truncate font-semibold text-sidebar-foreground">
                NUX
              </span>
              <span className="block truncate text-xs text-sidebar-foreground/70">
                {t("adminPanel")}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "sidebar-nav-item flex items-center gap-3 px-3 py-2.5 text-sm",
                    isActive
                      ? "sidebar-nav-item--active"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                  )}
                >
                  <span className="relative inline-flex shrink-0">
                    <item.icon className="h-5 w-5" />
                    {item.href === "/admin/notifications" &&
                      unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-sidebar" />
                      )}
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & logout */}
          <div className="border-t border-sidebar-border p-3">
            <div className="sidebar-user-card p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {user?.fullName}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="mt-2 w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="truncate">{t("signOut")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
