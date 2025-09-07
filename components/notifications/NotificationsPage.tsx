"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/app/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export function NotificationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, pagination, unreadCount, isLoading, error } = useSelector(
    (s: RootState) => s.notifications
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">All your recent updates</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
            Unread: {unreadCount}
          </Badge>
          <Button
            variant="outline"
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications ({pagination.totalItems})</CardTitle>
          <CardDescription>List of notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-sm text-destructive mb-3">{error}</div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="py-6 text-center text-muted-foreground">
                        Loading…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="py-6 text-center text-muted-foreground">
                        No notifications
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{n.title}</span>
                          {n.body && (
                            <span className="text-muted-foreground text-sm line-clamp-2">
                              {n.body}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(n.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {!n.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkRead(n.id)}
                          >
                            Mark read
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        currentPage > 1 && setCurrentPage(currentPage - 1)
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
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
                      className={
                        currentPage === pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
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
