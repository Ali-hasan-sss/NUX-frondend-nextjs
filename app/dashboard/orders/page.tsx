"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ordersService, Order } from "@/features/restaurant/orders/ordersService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, Clock, CheckCircle2, XCircle, ChefHat, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Flame } from "lucide-react";

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
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
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: Order["status"]) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      console.error("Error updating order status:", err);
      alert(err?.response?.data?.message || "Failed to update order status");
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = {
      PENDING: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
      CONFIRMED: { label: "Confirmed", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
      PREPARING: { label: "Preparing", className: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
      READY: { label: "Ready", className: "bg-green-500/10 text-green-600 dark:text-green-400" },
      COMPLETED: { label: "Completed", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
      CANCELLED: { label: "Cancelled", className: "bg-red-500/10 text-red-600 dark:text-red-400" },
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
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">View and manage customer orders</p>
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
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order #{order.id}
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-1">
                      {order.orderType && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          {order.orderType === "ON_TABLE"
                            ? t("dashboard.orders.orderTypeOnTable") || "At table"
                            : t("dashboard.orders.orderTypeTakeAway") || "Take away"}
                        </Badge>
                      )}
                      {order.tableNumber && (
                        <span className="font-medium">Table {order.tableNumber}</span>
                      )}
                      {order.tableNumber && " • "}
                      {new Date(order.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${order.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/50">
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
                            <p className="font-semibold">{item.itemTitle}</p>
                            {item.itemDescription && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.itemDescription}
                              </p>
                            )}
                            {item.kitchenSection && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                <ChefHat className="h-3 w-3 mr-1" />
                                {item.kitchenSection}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                          </div>
                        </div>
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {item.selectedExtras.map((extra, extraIdx) => (
                              <p key={extraIdx} className="text-xs text-muted-foreground">
                                + {extra.name} (+${extra.price.toFixed(2)})
                              </p>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <div className="mt-2 p-2 rounded bg-primary/10">
                            <p className="text-xs font-medium">Notes:</p>
                            <p className="text-xs text-muted-foreground">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
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
                          onClick={() => handleStatusUpdate(order.id, "CONFIRMED")}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {order.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, "PREPARING")}
                      >
                        Start Preparing
                      </Button>
                    )}
                    {order.status === "PREPARING" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, "READY")}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === "READY" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
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
              {selectedOrder?.tableNumber && <span>Table {selectedOrder.tableNumber}</span>}
              {selectedOrder?.tableNumber && " • "}
              {selectedOrder && new Date(selectedOrder.createdAt).toLocaleString()}
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
                            <p className="font-semibold">${item.totalPrice.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                          </div>
                        </div>
                        {item.kitchenSection && (
                          <Badge variant="outline" className="mt-2">
                            <ChefHat className="h-3 w-3 mr-1" />
                            {item.kitchenSection}
                          </Badge>
                        )}
                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium">Extras:</p>
                            {item.selectedExtras.map((extra, extraIdx) => (
                              <p key={extraIdx} className="text-xs text-muted-foreground">
                                + {extra.name} (+${extra.price.toFixed(2)})
                              </p>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <div className="mt-2 p-2 rounded bg-primary/10">
                            <p className="text-xs font-medium">Notes:</p>
                            <p className="text-xs text-muted-foreground">{item.notes}</p>
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
