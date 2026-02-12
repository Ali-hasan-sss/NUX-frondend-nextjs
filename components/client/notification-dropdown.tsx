"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
} from "@/features/notifications/notificationsThunks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useClientTheme } from "@/hooks/useClientTheme";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Render prop for the bell trigger (to show badge). Call with (props) => <button {...props}>...</button> */
  trigger: React.ReactNode;
}

export function NotificationDropdown({
  open,
  onOpenChange,
  trigger,
}: NotificationDropdownProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { colors, isDark } = useClientTheme();
  const { items, unreadCount, isLoading } = useAppSelector(
    (s) => s.notifications
  );

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      dispatch(fetchNotifications({ page: 1, pageSize: 15 }));
    }
  }, [open, dispatch]);

  const latest = items.slice(0, 15);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[min(90vw,320px)] p-0 max-h-[min(70vh,360px)] overflow-hidden flex flex-col"
        align="end"
        style={{
          backgroundColor: isDark ? "rgba(26, 31, 58, 0.98)" : "rgba(255,255,255,0.98)",
          borderColor: colors.border,
        }}
      >
        <div
          className="p-3 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: colors.border }}
        >
          <span
            className="font-semibold"
            style={{ color: colors.text }}
          >
            {t("header.notifications")}
          </span>
          <Link
            href="/client/notifications"
            onClick={() => onOpenChange(false)}
            className="text-xs hover:underline"
            style={{ color: colors.textSecondary }}
          >
            {t("header.viewAll")}
          </Link>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="py-8 text-center text-sm" style={{ color: colors.textSecondary }}>
              ...
            </div>
          ) : latest.length === 0 ? (
            <div className="py-8 text-center text-sm" style={{ color: colors.textSecondary }}>
              {t("header.noNotifications")}
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: colors.border }}>
              {latest.map((n) => (
                <Link
                  key={n.id}
                  href="/client/notifications"
                  onClick={() => {
                    if (!n.isRead) dispatch(markNotificationRead(n.id));
                    onOpenChange(false);
                  }}
                >
                  <div
                    className={cn(
                      "p-3 text-left transition-colors hover:opacity-90",
                      !n.isRead && "opacity-100"
                    )}
                    style={{
                      backgroundColor: !n.isRead ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : undefined,
                    }}
                  >
                    <div
                      className="font-medium text-sm line-clamp-1"
                      style={{ color: colors.text }}
                    >
                      {n.title}
                    </div>
                    {n.body && (
                      <div
                        className="text-xs line-clamp-2 mt-0.5"
                        style={{ color: colors.textSecondary }}
                      >
                        {String(n.body)}
                      </div>
                    )}
                    <div
                      className="text-xs mt-1"
                      style={{ color: colors.textSecondary, opacity: 0.9 }}
                    >
                      {formatDate(n.createdAt)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
