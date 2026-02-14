"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/notificationsThunks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface NotificationsPageProps {
  /** When true, hide page title and card header (e.g. when embedded in admin page). */
  embedded?: boolean;
}

export function NotificationsPage({ embedded }: NotificationsPageProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, pagination, unreadCount, isLoading, error } = useSelector(
    (s: RootState) => s.notifications,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchNotifications({ page: currentPage, pageSize }));
  }, [dispatch, currentPage, pageSize]);

  const handleMarkRead = (id: number | string) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAll = () => {
    dispatch(markAllNotificationsRead());
  };

  return (
    <div
      className={cn(
        "w-full min-w-0",
        embedded ? "space-y-4" : "p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6",
      )}
    >
      {!embedded && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
              {t("dashboard.notifications.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("dashboard.notifications.stayUpdated")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
              {t("dashboard.notifications.unreadFilter")}: {unreadCount}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="sm:size-default"
              onClick={handleMarkAll}
              disabled={unreadCount === 0}
            >
              {t("dashboard.notifications.markAllRead")}
            </Button>
          </div>
        </div>
      )}

      <Card className="w-full min-w-0 overflow-hidden">
        {!embedded && (
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              {t("dashboard.notifications.title")} ({pagination.totalItems})
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t("dashboard.notifications.listOfNotifications")}
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className={cn("w-full min-w-0", embedded && "pt-4")}>
          {error && (
            <div className="text-sm text-destructive mb-3">{error}</div>
          )}

          {isLoading ? (
            <div className="py-8 sm:py-12 text-center text-muted-foreground text-sm">
              {t("dashboard.notifications.loading")}
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 sm:py-12 text-center text-muted-foreground text-sm">
              {t("dashboard.notifications.noNotifications")}
            </div>
          ) : (
            <ul className="divide-y divide-border w-full min-w-0 list-none p-0 m-0">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "py-3 sm:py-4 px-0 first:pt-0 last:pb-0",
                    !n.isRead && "bg-muted/40",
                  )}
                >
                  <div className="flex flex-col gap-1 sm:gap-2 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground break-words">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-3 break-words">
                            {String(n.body)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(n.createdAt)}
                        </span>
                        {!n.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() => handleMarkRead(n.id)}
                          >
                            {t("dashboard.notifications.markRead")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-4 sm:mt-6">
              <Pagination>
                <PaginationContent className="flex-wrap gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && setCurrentPage(currentPage - 1)
                      }
                      className={cn(
                        currentPage === 1 && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        currentPage < pagination.totalPages &&
                        setCurrentPage(currentPage + 1)
                      }
                      className={cn(
                        currentPage === pagination.totalPages &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default NotificationsPage;
