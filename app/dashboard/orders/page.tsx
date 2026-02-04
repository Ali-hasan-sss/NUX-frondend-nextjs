"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  ordersService,
  Order,
} from "@/features/restaurant/orders/ordersService";
import {
  tablesService,
  Table,
} from "@/features/restaurant/tables/tablesService";
import { useSocket } from "@/contexts/SocketContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Utensils,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Flame, LayoutGrid, List } from "lucide-react";

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const { socket, isConnected, clearNewOrders } = useSocket();
  const isRTL = i18n.language === "ar";

  // Reset new-orders badge when user visits this page
  useEffect(() => {
    clearNewOrders();
  }, [clearNewOrders]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planPermissionError, setPlanPermissionError] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newOrderIds, setNewOrderIds] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "tables">("list");
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesWithNewOrder, setTablesWithNewOrder] = useState<Set<string>>(
    new Set()
  );
  const [selectedTableForModal, setSelectedTableForModal] = useState<
    { id: number; name: string; number: number } | { takeAway: true } | null
  >(null);
  const [isTableOrdersModalOpen, setIsTableOrdersModalOpen] = useState(false);

  const markOrderAsSeen = useCallback((orderId: number) => {
    setNewOrderIds((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPlanPermissionError(false);
    try {
      const response = await ordersService.getOrders({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        pageSize: 10,
      });
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.error("Error loading orders:", err);
      const data = err?.response?.data;
      setError(data?.message || "Failed to load orders");
      setPlanPermissionError(
        data?.code === "PLAN_PERMISSION_REQUIRED" ||
          data?.code === "NO_ACTIVE_SUBSCRIPTION"
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const loadTables = useCallback(async () => {
    setTablesLoading(true);
    try {
      const res = await tablesService.getTables();
      setTables(res.data || []);
    } catch (e) {
      console.error("Error loading tables:", e);
    } finally {
      setTablesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const tableNewOrderKey = useCallback((order: Order) => {
    if (order.orderType === "TAKE_AWAY") return "takeaway";
    if (order.tableId) return `tableId-${order.tableId}`;
    if (order.tableNumber != null) return `tableNum-${order.tableNumber}`;
    return null;
  }, []);

  const clearTableNewOrder = useCallback(
    (target: { id?: number; number?: number } | { takeAway: true }) => {
      setTablesWithNewOrder((prev) => {
        const next = new Set(prev);
        if ("takeAway" in target) next.delete("takeaway");
        else {
          if (target.id != null) next.delete(`tableId-${target.id}`);
          if (target.number != null) next.delete(`tableNum-${target.number}`);
        }
        return next;
      });
    },
    []
  );

  const tableHasNewOrder = useCallback(
    (table: { id: number; number: number }) =>
      tablesWithNewOrder.has(`tableId-${table.id}`) ||
      tablesWithNewOrder.has(`tableNum-${table.number}`),
    [tablesWithNewOrder]
  );

  const getOrdersForTable = useCallback(
    (table: { id: number; number: number } | { takeAway: true }) => {
      if ("takeAway" in table) {
        return orders.filter((o) => o.orderType === "TAKE_AWAY");
      }
      return orders.filter(
        (o) =>
          o.tableId === table.id ||
          o.tableNumber === table.number ||
          (o.table && o.table.id === table.id)
      );
    },
    [orders]
  );

  const handleTableSessionToggle = useCallback(
    async (table: Table, isSessionOpen: boolean) => {
      try {
        await tablesService.updateTable(table.id, { isSessionOpen });
        await loadTables();
      } catch (err: any) {
        console.error("Error updating table session:", err);
        alert(
          err?.response?.data?.message ||
            t("dashboard.tables.sessionUpdateError") ||
            "Failed to update session"
        );
      }
    },
    [t, loadTables]
  );

  // Real-time: new order from WebSocket
  useEffect(() => {
    if (!socket) return;
    const onOrderNew = (order: Order) => {
      setOrders((prev) => [order, ...prev]);
      setNewOrderIds((prev) => new Set(prev).add(order.id));
      const key = tableNewOrderKey(order);
      if (key) setTablesWithNewOrder((prev) => new Set(prev).add(key));
    };
    const onOrderStatus = (order: Order) => {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(order);
      }
    };
    socket.on("order:new", onOrderNew);
    socket.on("order:status", onOrderStatus);
    return () => {
      socket.off("order:new", onOrderNew);
      socket.off("order:status", onOrderStatus);
    };
  }, [socket, selectedOrder?.id]);

  const handleStatusUpdate = async (
    orderId: number,
    newStatus: Order["status"]
  ) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      console.error("Error updating order status:", err);
      const data = err?.response?.data;
      const msg = data?.message || "Failed to update order status";
      if (
        data?.code === "PLAN_PERMISSION_REQUIRED" ||
        data?.code === "NO_ACTIVE_SUBSCRIPTION"
      ) {
        alert(
          msg +
            "\n\n" +
            (t("dashboard.orders.upgradePlanHint") ||
              "Upgrade your plan to use Orders.")
        );
      } else {
        alert(msg);
      }
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      PENDING: {
        label: "Pending",
        className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      },
      CONFIRMED: {
        label: "Confirmed",
        className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      },
      PREPARING: {
        label: "Preparing",
        className: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      },
      READY: {
        label: "Ready",
        className: "bg-green-500/10 text-green-600 dark:text-green-400",
      },
      COMPLETED: {
        label: "Completed",
        className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
      },
      CANCELLED: {
        label: "Cancelled",
        className: "bg-red-500/10 text-red-600 dark:text-red-400",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge className={cn("font-medium", config.className)}>
        {config.label}
      </Badge>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-destructive">
              {planPermissionError ? (
                <Lock className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <p>{error}</p>
            </div>
            {planPermissionError && (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.orders.upgradePlanHint") ||
                  "Your current plan does not include Orders. Upgrade your subscription to view and manage orders from the dashboard."}
              </p>
            )}
            {planPermissionError && (
              <Button asChild variant="default">
                <Link href="/dashboard/subscription">
                  {t("dashboard.orders.goToSubscription") ||
                    "Go to Subscription"}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Orders</h1>
            {isConnected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            View and manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5 bg-muted/50">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4 inline-block mr-1.5 align-middle" />
              {t("dashboard.orders.viewList") || "List"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tables")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                viewMode === "tables"
                  ? "bg-background text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4 inline-block mr-1.5 align-middle" />
              {t("dashboard.orders.viewTables") || "Tables"}
            </button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PREPARING">Preparing</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === "tables" ? (
        <>
          {tablesLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : tables.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {t("dashboard.orders.noTablesForView") ||
                      "No tables found. Create tables in QR Codes to see orders by table."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tables.map((table) => {
                const tableOrders = getOrdersForTable(table);
                const hasNew = tableHasNewOrder(table);
                return (
                  <Card
                    key={table.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md min-h-[100px] flex flex-col items-center justify-center",
                      hasNew &&
                        "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    onClick={() => {
                      clearTableNewOrder({
                        id: table.id,
                        number: table.number,
                      });
                      setSelectedTableForModal(table);
                      setIsTableOrdersModalOpen(true);
                    }}
                  >
                    <CardContent className="pt-6 w-full text-center">
                      <p
                        className="font-semibold truncate px-2"
                        title={table.name}
                      >
                        {table.name ||
                          t("dashboard.orders.table") + " " + table.number}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {tableOrders.length}{" "}
                        {tableOrders.length === 1
                          ? t("dashboard.orders.order") || "order"
                          : t("dashboard.orders.orders") || "orders"}
                      </p>
                      <div
                        className="flex items-center justify-center gap-2 mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Switch
                          dir={isRTL ? "rtl" : "ltr"}
                          id={`table-session-${table.id}`}
                          checked={table.isSessionOpen}
                          onCheckedChange={(checked) =>
                            handleTableSessionToggle(table, checked)
                          }
                        />
                        <Label
                          htmlFor={`table-session-${table.id}`}
                          className="text-xs cursor-pointer"
                        >
                          {t("dashboard.tables.session") || "Session"}
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <>
          {viewMode === "list" && tables.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {t("dashboard.tables.tableSessions") || "Table sessions"}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.tables.tableSessionsHint") ||
                    "Check to open session, uncheck to close. Customers can only order when the table session is open."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 gap-y-3">
                  {tables.map((table) => (
                    <div key={table.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`list-session-${table.id}`}
                        checked={table.isSessionOpen}
                        onCheckedChange={(checked) =>
                          handleTableSessionToggle(table, checked === true)
                        }
                      />
                      <Label
                        htmlFor={`list-session-${table.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {table.name ||
                          t("dashboard.orders.table") + " " + table.number}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className={cn(
                    "hover:shadow-md transition-shadow cursor-pointer",
                    newOrderIds.has(order.id) &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                  onClick={() => markOrderAsSeen(order.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Order #{order.id}
                          {getStatusBadge(order.status)}
                        </CardTitle>
                        <CardDescription className="mt-1 flex flex-wrap items-center gap-1">
                          {order.orderType && (
                            <Badge
                              variant="secondary"
                              className="text-xs font-normal"
                            >
                              {order.orderType === "ON_TABLE"
                                ? t("dashboard.orders.orderTypeOnTable") ||
                                  "At table"
                                : t("dashboard.orders.orderTypeTakeAway") ||
                                  "Take away"}
                            </Badge>
                          )}
                          {order.tableNumber && (
                            <span className="font-medium">
                              Table {order.tableNumber}
                            </span>
                          )}
                          {order.tableNumber && " • "}
                          {new Date(order.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          {item.itemImage && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={item.itemImage}
                                alt={item.itemTitle}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold">
                                  {item.itemTitle}
                                </p>
                                {item.itemDescription && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {item.itemDescription}
                                  </p>
                                )}
                                {item.kitchenSection && (
                                  <Badge
                                    variant="outline"
                                    className="mt-1 text-xs"
                                  >
                                    <ChefHat className="h-3 w-3 mr-1" />
                                    {item.kitchenSection}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  ${item.totalPrice.toFixed(2)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  × {item.quantity}
                                </p>
                              </div>
                            </div>
                            {item.selectedExtras &&
                              item.selectedExtras.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {item.selectedExtras.map(
                                    (extra, extraIdx) => (
                                      <p
                                        key={extraIdx}
                                        className="text-xs text-muted-foreground"
                                      >
                                        + {extra.name} (+$
                                        {extra.price.toFixed(2)})
                                      </p>
                                    )
                                  )}
                                </div>
                              )}
                            {item.notes && (
                              <div className="mt-2 p-2 rounded bg-primary/10">
                                <p className="text-xs font-medium">Notes:</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div
                      className="mt-4 flex items-center justify-between pt-4 border-t"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          markOrderAsSeen(order.id);
                          setSelectedOrder(order);
                          setIsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      <div className="flex gap-2">
                        {order.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(order.id, "CONFIRMED");
                                markOrderAsSeen(order.id);
                              }}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(order.id, "CANCELLED");
                                markOrderAsSeen(order.id);
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {order.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, "PREPARING");
                              markOrderAsSeen(order.id);
                            }}
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === "PREPARING" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, "READY");
                              markOrderAsSeen(order.id);
                            }}
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === "READY" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, "COMPLETED");
                              markOrderAsSeen(order.id);
                            }}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Table orders modal (when view is tables) */}
      <Dialog
        open={isTableOrdersModalOpen}
        onOpenChange={(open) => {
          setIsTableOrdersModalOpen(open);
          if (!open) setSelectedTableForModal(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTableForModal &&
                ("takeAway" in selectedTableForModal
                  ? t("dashboard.orders.orderTypeTakeAway") || "Take away"
                  : selectedTableForModal.name ||
                    t("dashboard.orders.table") +
                      " " +
                      selectedTableForModal.number)}
            </DialogTitle>
            <DialogDescription>
              {selectedTableForModal &&
                getOrdersForTable(selectedTableForModal).length}{" "}
              {t("dashboard.orders.orders") || "orders"}
            </DialogDescription>
          </DialogHeader>
          {selectedTableForModal && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {getOrdersForTable(selectedTableForModal).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t("dashboard.orders.noOrdersForTable") ||
                    "No orders for this table"}
                </p>
              ) : (
                getOrdersForTable(selectedTableForModal).map((order) => (
                  <Card
                    key={order.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsDialogOpen(true);
                    }}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            ${order.totalPrice.toFixed(2)} •{" "}
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(order.status)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                              setIsDialogOpen(true);
                            }}
                          >
                            {t("dashboard.orders.viewDetails") ||
                              "View Details"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id} Details</DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2">
              {selectedOrder?.orderType && (
                <Badge variant="secondary" className="text-xs">
                  {selectedOrder.orderType === "ON_TABLE"
                    ? t("dashboard.orders.orderTypeOnTable") || "At table"
                    : t("dashboard.orders.orderTypeTakeAway") || "Take away"}
                </Badge>
              )}
              {selectedOrder?.tableNumber && (
                <span>Table {selectedOrder.tableNumber}</span>
              )}
              {selectedOrder?.tableNumber && " • "}
              {selectedOrder &&
                new Date(selectedOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ${selectedOrder.totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-lg border">
                    <div className="flex gap-3">
                      {item.itemImage && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.itemImage}
                            alt={item.itemTitle}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{item.itemTitle}</p>
                            {item.itemDescription && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.itemDescription}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${item.totalPrice.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              × {item.quantity}
                            </p>
                          </div>
                        </div>
                        {item.kitchenSection && (
                          <Badge variant="outline" className="mt-2">
                            <ChefHat className="h-3 w-3 mr-1" />
                            {item.kitchenSection}
                          </Badge>
                        )}
                        {item.selectedExtras &&
                          item.selectedExtras.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-medium">Extras:</p>
                              {item.selectedExtras.map((extra, extraIdx) => (
                                <p
                                  key={extraIdx}
                                  className="text-xs text-muted-foreground"
                                >
                                  + {extra.name} (+${extra.price.toFixed(2)})
                                </p>
                              ))}
                            </div>
                          )}
                        {item.notes && (
                          <div className="mt-2 p-2 rounded bg-primary/10">
                            <p className="text-xs font-medium">Notes:</p>
                            <p className="text-xs text-muted-foreground">
                              {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
