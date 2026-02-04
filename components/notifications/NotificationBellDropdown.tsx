"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
} from "@/features/notifications/notificationsThunks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface NotificationBellDropdownProps {
  /** Link for "View all" (e.g. /admin/notifications or /dashboard/notifications) */
  viewAllHref: string;
  /** Optional class for the trigger button */
  className?: string;
  /** RTL: align dropdown start vs end */
  align?: "start" | "end";
}

export function NotificationBellDropdown({
  viewAllHref,
  className,
  align = "end",
}: NotificationBellDropdownProps) {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const { items, unreadCount, isLoading } = useAppSelector(
    (s) => s.notifications
  );

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      dispatch(fetchNotifications({ page: 1, pageSize: 10 }));
    }
  };

  const latest = items.slice(0, 10);

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={t("headerNotifications")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-72 max-h-[min(70vh,360px)] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("headerNotifications")}</span>
          <Link
            href={viewAllHref}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t("headerViewAllNotifications")}
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            ...
          </div>
        ) : latest.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t("headerNoNotifications")}
          </div>
        ) : (
          latest.map((n) => (
            <Link
              key={n.id}
              href={viewAllHref}
              onClick={() => dispatch(markNotificationRead(n.id))}
            >
              <div
                className={cn(
                  "px-2 py-2 text-sm cursor-pointer hover:bg-accent rounded-sm",
                  !n.isRead && "bg-muted/60"
                )}
              >
                <div className="font-medium line-clamp-1">{n.title}</div>
                {n.body && (
                  <div className="text-muted-foreground text-xs line-clamp-2 mt-0.5">
                    {n.body}
                  </div>
                )}
                <div className="text-muted-foreground text-xs mt-1">
                  {formatDate(n.createdAt)}
                </div>
              </div>
            </Link>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
