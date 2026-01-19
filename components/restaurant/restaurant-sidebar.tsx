"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { fetchRestaurantAccount } from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
import Image from "next/image";
import {
  LayoutDashboard,
  QrCode,
  Users,
  Bell,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  Megaphone,
  ScanLine,
  Receipt,
  FileText,
  ChevronDown,
  ChevronRight,
  Wallet,
  Store,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

export function RestaurantSidebar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  const singleNavigation = [
    { name: t("dashboard.sidebar.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("dashboard.sidebar.notifications"), href: "/dashboard/notifications", icon: Bell },
    { name: t("dashboard.sidebar.subscription"), href: "/dashboard/subscription", icon: CreditCard },
    { name: t("dashboard.sidebar.invoices"), href: "/dashboard/invoices", icon: FileText },
    { name: t("dashboard.sidebar.settings"), href: "/dashboard/settings", icon: Settings },
  ];

  const groupedNavigation = [
    {
      groupName: t("dashboard.sidebar.qrAndPayments"),
      groupIcon: Wallet,
      items: [
        { name: t("dashboard.sidebar.qrCodes"), href: "/dashboard/qr-codes", icon: QrCode },
        { name: t("dashboard.sidebar.qrScans"), href: "/dashboard/qr-scans", icon: ScanLine },
        { name: t("dashboard.sidebar.payments"), href: "/dashboard/payments", icon: Receipt },
      ],
    },
    {
      groupName: t("dashboard.sidebar.restaurant"),
      groupIcon: Store,
      items: [
        { name: t("dashboard.sidebar.menu"), href: "/dashboard/menu", icon: Menu },
        // { name: t("dashboard.sidebar.packages"), href: "/dashboard/packages", icon: Package },
        { name: t("dashboard.sidebar.ads"), href: "/dashboard/ads", icon: Megaphone },
        { name: t("dashboard.sidebar.groups"), href: "/dashboard/groups", icon: Users },
      ],
    },
  ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Auto-open groups that contain the current active page
    const initialState: Record<string, boolean> = {};
    groupedNavigation.forEach((group) => {
      const isActive = group.items.some((item) => pathname === item.href);
      initialState[group.groupName] = isActive;
    });
    return initialState;
  });
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { data: restaurant } = useAppSelector((state) => state.restaurantAccount);
  const router = useRouter();

  // Load restaurant data to get logo
  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isGroupActive = (items: { href: string }[]) => {
    return items.some((item) => pathname === item.href);
  };

  // Auto-open groups when pathname changes
  useEffect(() => {
    setOpenGroups((prev) => {
      const newState = { ...prev };
      groupedNavigation.forEach((group) => {
        const isActive = group.items.some((item) => pathname === item.href);
        if (isActive) {
          newState[group.groupName] = true;
        }
      });
      return newState;
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile menu button - positioned to not overlap with navbar logo */}
      <div
        className={cn(
          "lg:hidden fixed z-50 transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "top-2 right-2" // Move to top-right when sidebar is open
            : "top-2 left-2" // Position to avoid navbar logo when closed
        )}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={cn(
            "shadow-lg transition-all duration-300 ease-in-out border-2 bg-background hover:bg-accent border-border hover:border-accent-foreground/20"
          )}
        >
          <div className="transition-transform duration-300 ease-in-out">
            {isMobileMenuOpen ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </div>
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto py-2 sidebar-scroll">
          {/* Logo */}
          <div
            className="flex  cursor-pointer items-center px-6 py-4 border-b border-sidebar-border"
            onClick={() => router.push("/")}
          >
            {restaurant?.logo ? (
              <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={restaurant.logo}
                  alt={restaurant.name || "Restaurant logo"}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sidebar-primary-foreground font-bold text-lg">
                  N
                </span>
              </div>
            )}
            <div className={cn(isRTL ? "mr-2" : "ml-2", "min-w-0")}>
              <span className="font-bold text-lg text-sidebar-foreground block truncate">
                {restaurant?.name || "NUX"}
              </span>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.restaurantName || user?.email}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* Single navigation items */}
            {singleNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // Small delay to allow smooth transition
                    setTimeout(() => {}, 100);
                  }}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-primary/20 hover:text-primary"
                  )}
                >
                  <span className={cn("relative inline-flex", isRTL ? "ml-3" : "mr-3")}>
                    <item.icon className="h-5 w-5" />
                    {item.href === "/dashboard/notifications" &&
                      unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                      )}
                  </span>
                  {item.name}
                </Link>
              );
            })}

            {/* Grouped navigation items */}
            {groupedNavigation.map((group) => {
              const isGroupActiveState = isGroupActive(group.items);
              const isOpen = openGroups[group.groupName];

              return (
                <div key={group.groupName} className="space-y-1">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(group.groupName)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isGroupActiveState
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <div className="flex items-center">
                      <group.groupIcon className="h-5 w-5 mr-3" />
                      {group.groupName}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* Group items */}
                  {isOpen && (
                    <div className={cn("space-y-1", isRTL ? "mr-6" : "ml-6")}>
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setTimeout(() => {}, 100);
                            }}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                              isActive
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-sidebar-foreground hover:bg-primary/20 hover:text-primary"
                            )}
                          >
                            <item.icon className={cn("h-4 w-4", isRTL ? "ml-3" : "mr-3")} />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground text-sm font-medium">
                  {user?.fullName?.charAt(0) || "R"}
                </span>
              </div>
              <div className={cn(isRTL ? "mr-3" : "ml-3")}>
                <p className="text-sm font-medium text-sidebar-foreground">
                  {user?.fullName}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                isRTL ? "flex-row-reverse" : ""
              )}
            >
              <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              <span className="whitespace-nowrap">{t("dashboard.sidebar.signOut")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ease-in-out",
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
