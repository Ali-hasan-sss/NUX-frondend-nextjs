"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useSocket } from "@/contexts/SocketContext";
import { logout } from "@/features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { fetchRestaurantAccount } from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
import { fetchUnreadCount } from "@/features/notifications/notificationsThunks";
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
  ShoppingCart,
} from "lucide-react";

export function RestaurantSidebar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const singleNavigation = [
    {
      name: t("dashboard.sidebar.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("dashboard.sidebar.notifications"),
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      name: t("dashboard.sidebar.orders"),
      href: "/dashboard/orders",
      icon: ShoppingCart,
    },
    {
      name: t("dashboard.sidebar.subscription"),
      href: "/dashboard/subscription",
      icon: CreditCard,
    },
    {
      name: t("dashboard.sidebar.invoices"),
      href: "/dashboard/invoices",
      icon: FileText,
    },
    {
      name: t("dashboard.sidebar.settings"),
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const groupedNavigation = [
    {
      groupName: t("dashboard.sidebar.qrAndPayments"),
      groupIcon: Wallet,
      items: [
        {
          name: t("dashboard.sidebar.qrCodes"),
          href: "/dashboard/qr-codes",
          icon: QrCode,
        },
        {
          name: t("dashboard.sidebar.qrScans"),
          href: "/dashboard/qr-scans",
          icon: ScanLine,
        },
        {
          name: t("dashboard.sidebar.payments"),
          href: "/dashboard/payments",
          icon: Receipt,
        },
      ],
    },
    {
      groupName: t("dashboard.sidebar.restaurant"),
      groupIcon: Store,
      items: [
        {
          name: t("dashboard.sidebar.menu"),
          href: "/dashboard/menu",
          icon: Menu,
        },
        // { name: t("dashboard.sidebar.packages"), href: "/dashboard/packages", icon: Package },
        {
          name: t("dashboard.sidebar.ads"),
          href: "/dashboard/ads",
          icon: Megaphone,
        },
        {
          name: t("dashboard.sidebar.groups"),
          href: "/dashboard/groups",
          icon: Users,
        },
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
  const { data: restaurant } = useAppSelector(
    (state) => state.restaurantAccount
  );
  const { newOrdersCount } = useSocket();
  const router = useRouter();

  // Load restaurant data to get logo
  useEffect(() => {
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  // Fetch unread notifications count so the bell badge stays in sync (and updates in real time via socket + incrementUnreadCount)
  useEffect(() => {
    dispatch(fetchUnreadCount());
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
          "fixed inset-y-0 left-0 z-40 w-64 sidebar-panel transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:rounded-e-2xl lg:my-2 lg:ml-2 lg:h-[calc(100vh-1rem)]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto py-2 sidebar-scroll">
          {/* Brand */}
          <div
            className="sidebar-brand mx-4 mt-4 flex cursor-pointer items-center gap-3 px-4 py-3"
            onClick={() => router.push("/")}
          >
            {restaurant?.logo ? (
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-background/80">
                <Image
                  src={getImageUrl(restaurant.logo) || "/placeholder-logo.png"}
                  alt={restaurant.name || "Restaurant logo"}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                {(restaurant?.name || "N").charAt(0)}
              </div>
            )}
            <div className={cn("min-w-0 flex-1", isRTL ? "text-right" : "")}>
              <span className="block truncate font-semibold text-sidebar-foreground">
                {restaurant?.name || "NUX"}
              </span>
              <p className="block truncate text-xs text-sidebar-foreground/70">
                {user?.restaurantName || user?.email}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1">
            {/* Single navigation items */}
            {singleNavigation.map((item) => {
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
                    {item.href === "/dashboard/notifications" &&
                      unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-sidebar" />
                      )}
                    {item.href === "/dashboard/orders" &&
                      newOrdersCount > 0 &&
                      pathname !== "/dashboard/orders" && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-[10px] font-bold text-primary-foreground flex items-center justify-center ring-2 ring-sidebar">
                          {newOrdersCount > 99 ? "99+" : newOrdersCount}
                        </span>
                      )}
                  </span>
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}

            {/* Grouped navigation items - one border wraps header + items when open */}
            {groupedNavigation.map((group) => {
              const isGroupActiveState = isGroupActive(group.items);
              const isOpen = openGroups[group.groupName];

              return (
                <div
                  key={group.groupName}
                  className={cn(
                    "pt-1",
                    isOpen &&
                      "rounded-xl border border-sidebar-border overflow-hidden bg-sidebar-accent/30"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.groupName)}
                    className={cn(
                      "sidebar-nav-item flex w-full items-center justify-between gap-3 px-3 py-2.5 text-sm",
                      isOpen && "rounded-none",
                      isGroupActiveState
                        ? "sidebar-nav-item--active"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <group.groupIcon className="h-5 w-5 shrink-0" />
                      <span className="truncate">{group.groupName}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div
                      className={cn(
                        "space-y-0.5 border-t border-sidebar-border py-1",
                        isRTL ? "pr-3 pl-3" : "pl-3 pr-3"
                      )}
                    >
                      {group.items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "sidebar-nav-item mx-1.5 flex items-center gap-3 px-3 py-2 text-sm",
                              isActive
                                ? "sidebar-nav-item--active"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User & logout */}
          <div className="border-t border-sidebar-border p-3">
            <div className="sidebar-user-card p-3">
              <div
                className={cn(
                  "flex items-center gap-3",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {user?.fullName?.charAt(0) || "R"}
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
                className={cn(
                  "mt-2 w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isRTL && "flex-row-reverse"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {t("dashboard.sidebar.signOut")}
                </span>
              </Button>
            </div>
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
