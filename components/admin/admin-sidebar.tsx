"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { fetchUnreadCount } from "@/features/notifications/notificationsThunks";
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
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Restaurants", href: "/admin/restaurants", icon: Store },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Plans", href: "/admin/plans", icon: Package },
  { name: "Invoices", href: "/admin/invoices", icon: FileText },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const router = useRouter();
  // Fetch unread count once when sidebar mounts
  // Keeps the bell badge in sync across admin pages
  React.useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const handleLogout = () => {
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
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto sidebar-scroll">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
            <div
              onClick={() => router.push("/")}
              className=" cursor-pointer p-y-1 px-2 rounded-lg bg-sidebar-primary flex items-center justify-center"
            >
              <span className="text-sidebar-primary-foreground font-bold text-lg">
                NUX
              </span>
            </div>
            <span className="ml-2 font-bold text-xl text-sidebar-foreground">
              Admin Panel
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="relative mr-3 inline-flex">
                    <item.icon className="h-5 w-5" />
                    {item.href === "/admin/notifications" &&
                      unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                      )}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground text-sm font-medium">
                  {user?.fullName?.charAt(0) || "A"}
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
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
