"use client";

import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSocket } from "@/contexts/SocketContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, UtensilsCrossed, X } from "lucide-react";
import type { WaiterRequestItem } from "@/contexts/SocketContext";
import { NotificationBellDropdown } from "@/components/notifications/NotificationBellDropdown";

function formatWaiterRequestTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

type DashboardHeaderProps = {
  onOpenSidebar?: () => void;
};

export function DashboardHeader({ onOpenSidebar }: DashboardHeaderProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { waiterRequests, clearWaiterRequest, clearAllWaiterRequests } =
    useSocket();

  return (
    <div className="sticky left-0 top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
      <div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border-b">
        <div className="flex items-center gap-1 sm:gap-2 pr-1 min-w-0">
          {onOpenSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={onOpenSidebar}
              aria-label={t("dashboard.sidebar.openMenu") || "Open menu"}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={50}
            height={50}
            className="rounded"
          />
          <span className="text-sm font-medium hidden sm:inline">NUX</span>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 sm:gap-2 shrink-0",
            isRTL && "lg:pl-0 pl-12"
          )}
        >
          <NotificationBellDropdown
            viewAllHref="/dashboard/notifications"
            align={isRTL ? "start" : "end"}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label={t("dashboard.waiterRequests.title")}
              >
                <UtensilsCrossed className="h-5 w-5" />
                {waiterRequests.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {waiterRequests.length > 99 ? "99+" : waiterRequests.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isRTL ? "start" : "end"}
              className="w-72 max-h-[min(70vh,320px)] overflow-y-auto"
            >
              <DropdownMenuLabel className="flex items-center justify-between gap-2">
                <span>{t("dashboard.waiterRequests.title")}</span>
                {waiterRequests.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      clearAllWaiterRequests();
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("dashboard.waiterRequests.clearAll")}
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {waiterRequests.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {t("dashboard.waiterRequests.noRequests")}
                </div>
              ) : (
                waiterRequests.map((req: WaiterRequestItem) => (
                  <DropdownMenuItem
                    key={req.id}
                    className="flex items-center justify-between gap-2 py-2 cursor-default"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <span className="flex-1 min-w-0">
                      {req.tableName
                        ? `${req.tableName} (${req.tableNumber})`
                        : i18n.t("dashboard.waiterRequests.tableNumber", {
                            number: req.tableNumber,
                          })}
                      <span className="block text-xs text-muted-foreground">
                        {formatWaiterRequestTime(req.timestamp)}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => clearWaiterRequest(req.id)}
                      className="p-1 rounded hover:bg-muted shrink-0"
                      aria-label={t("dashboard.waiterRequests.dismiss")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
