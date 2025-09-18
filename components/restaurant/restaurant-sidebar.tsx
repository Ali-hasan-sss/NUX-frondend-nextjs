"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
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

const singleNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const groupedNavigation = [
  {
    groupName: "QR & Payments",
    groupIcon: Wallet,
    items: [
      { name: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
      { name: "QR Scans", href: "/dashboard/qr-scans", icon: ScanLine },
      { name: "Payments", href: "/dashboard/payments", icon: Receipt },
    ],
  },
  {
    groupName: "Restaurant",
    groupIcon: Store,
    items: [
      { name: "Menu", href: "/dashboard/menu", icon: Menu },
      { name: "Packages", href: "/dashboard/packages", icon: Package },
      { name: "Ads", href: "/dashboard/ads", icon: Megaphone },
      { name: "Groups", href: "/dashboard/groups", icon: Users },
    ],
  },
];

export function RestaurantSidebar() {
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
  const router = useRouter();

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
        <div className="flex flex-col h-full overflow-y-auto sidebar-scroll">
          {/* Logo */}
          <div
            className="flex cursor-pointer items-center px-6 py-4 border-b border-sidebar-border"
            onClick={() => router.push("/")}
          >
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">
                N
              </span>
            </div>
            <div className="ml-2">
              <span className="font-bold text-lg text-sidebar-foreground">
                NUX
              </span>
              <p className="text-xs text-sidebar-foreground/60">
                {user?.restaurantName}
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
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:translate-x-1"
                  )}
                >
                  <span className="relative mr-3 inline-flex">
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
                    <div className="ml-6 space-y-1">
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
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:translate-x-1"
                            )}
                          >
                            <item.icon className="h-4 w-4 mr-3" />
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
              <div className="ml-3">
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
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
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
