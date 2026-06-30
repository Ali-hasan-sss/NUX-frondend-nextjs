"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLanguage } from "@/hooks/use-language";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDispatch, RootState } from "@/app/store";
import {
  adminActivateSubscription,
  cancelAdminSubscription,
  fetchAdminSubscriptions,
  refundAdminSubscription,
} from "@/features/admin/subscriptions/adminSubscriptionsThunks";
import type { AdminSubscription } from "@/features/admin/subscriptions/adminSubscriptionsTypes";
import { fetchAdminPlans } from "@/features/admin/plans/adminPlansThunks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import {
  SubscriptionForm,
  SubscriptionFormInput,
} from "./forms/subscriptionForm";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { FilterBar } from "@/components/filters/FilterBar";
import { LabeledInput } from "@/components/filters/LabeledInput";
import { LabeledSelect } from "@/components/filters/LabeledSelect";
import { PageSizeSelect } from "@/components/filters/PageSizeSelect";
import { Label } from "@/components/ui/label";

export function SubscriptionManagement() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const {
    items: subscriptions,
    pagination,
    statistics,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.adminSubscriptions);
  const plans = useSelector((state: RootState) => state.adminPlans.items);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [restaurantId, setRestaurantId] = useState("");
  const [planId, setPlanId] = useState<number | null>(null);
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<AdminSubscription | null>(null);
  const [refundReason, setRefundReason] = useState("Duplicate charge / billing error");
  const [refundApology, setRefundApology] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    dispatch(fetchAdminPlans());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            {t("active")}
          </Badge>
        );
      case "cancelled":
      case "expired":
        return <Badge variant="destructive">{t("expired")}</Badge>;
      default:
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            {status}
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const handleCancel = async (id: string | number) => {
    await dispatch(
      cancelAdminSubscription({
        id,
        body: { reason: "Cancelled by admin" },
      })
    );
  };

  const openRefundDialog = (subscription: AdminSubscription) => {
    setRefundTarget(subscription);
    setRefundReason("Duplicate charge / billing error");
    setRefundApology("");
    setRefundDialogOpen(true);
  };

  const handleRefundSubmit = async () => {
    if (!refundTarget) return;
    setRefundLoading(true);
    try {
      const result = await dispatch(
        refundAdminSubscription({
          id: refundTarget.id,
          reason: refundReason.trim() || undefined,
          apologyMessage: refundApology.trim() || undefined,
        })
      ).unwrap();
      const apologyNote = result.apologyIncluded
        ? ` ${t("refundApologySent") || "Apology message included."}`
        : "";
      const contactNote =
        result.emailSent || result.notificationSent
          ? ` ${t("refundCustomerNotified") || "Customer notified by app and email."}`
          : "";
      toast.success(
        `${t("refundIssued") || "Refund issued"}: ${result.amount} EUR (${result.refundId}).${contactNote}${apologyNote}`
      );
      setRefundDialogOpen(false);
      setRefundTarget(null);
    } catch (err: unknown) {
      toast.error(String(err));
    } finally {
      setRefundLoading(false);
    }
  };

  const handleSubmit = async (data: SubscriptionFormInput) => {
    const selectedRestaurantId = data.restaurantId ?? restaurantId;
    await dispatch(
      adminActivateSubscription({
        restaurantId: selectedRestaurantId,
        planId: Number(data.planId),
      })
    );
  };

  // Compose params and fetch when filters change
  useEffect(() => {
    const params = {
      search: debouncedSearchTerm || undefined,
      planId: planFilter === "all" ? undefined : Number(planFilter),
      status: (statusFilter === "all" ? undefined : statusFilter) as
        | "ACTIVE"
        | "CANCELLED"
        | "EXPIRED"
        | "PENDING"
        | undefined,
      page: currentPage,
      pageSize,
    };
    dispatch(fetchAdminSubscriptions(params));
  }, [
    dispatch,
    debouncedSearchTerm,
    planFilter,
    statusFilter,
    currentPage,
    pageSize,
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("subscriptionManagement")}
        </h1>
        <p className="text-muted-foreground">
          {t("monitorSubscriptionsDescription")}
        </p>
      </div>

      {isLoading && <p>{t("loadingSubscriptions")}</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">{t("active")}</p>
                <p className="text-2xl font-bold">{statistics.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">{t("cancelled")}</p>
                <p className="text-2xl font-bold">{statistics.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">{t("expired")}</p>
                <p className="text-2xl font-bold">{statistics.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 rounded-full bg-primary"></div>
              <div>
                <p className="text-sm font-medium">
                  {t("totalRevenueValue")}
                </p>
                <p className="text-2xl font-bold">
                  ${statistics.totalValue}/EUR
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filters")}</CardTitle>
          <CardDescription>
            {t("searchAndFilterSubscriptions")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <LabeledInput
              label={t("searchByEmail")}
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("searchByNameEmailRestaurant")}
            />
            <div className="flex  items-center gap-2">
              <LabeledSelect
                label={t("plan")}
                value={planFilter}
                onChange={(v) => setPlanFilter(v)}
                options={[
                  { label: t("allPlans"), value: "all" },
                  ...plans.map((p) => ({
                    label: p.title,
                    value: String(p.id),
                  })),
                ]}
              />
              <LabeledSelect
                label={t("status")}
                value={statusFilter}
                onChange={(v) =>
                  setStatusFilter(
                    v as "ACTIVE" | "CANCELLED" | "EXPIRED" | "PENDING" | "all"
                  )
                }
                options={[
                  { label: t("allStatus"), value: "all" },
                  { label: t("active"), value: "ACTIVE" },
                  { label: t("cancelled"), value: "CANCELLED" },
                  { label: t("expired"), value: "EXPIRED" },
                  { label: t("pending"), value: "PENDING" },
                ]}
              />
              <PageSizeSelect value={pageSize} onChange={setPageSize} />
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <div className="flex flex-col px-5 gap-2 md:flex-row md:items-center md:justify-between ">
        <CardHeader>
          <CardTitle>
            {t("subscriptions")} ({pagination.totalItems})
          </CardTitle>
          <CardDescription>
            {t("allRestaurantSubscriptions")}
          </CardDescription>
        </CardHeader>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setPlanId(null);
              setRestaurantId("");
              setOpenSubscriptionModal(true);
            }}
          >
            <PlusCircle />
            <span>{t("addNewSubscription")}</span>
          </Button>
        </div>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("restaurant")}</TableHead>
                  <TableHead>{t("plan")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("startDate")}</TableHead>
                  <TableHead>{t("endDate")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{t("paymentMethod")}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.restaurant.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.restaurant.owner.fullName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscription.plan.title}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(subscription.status)}
                        {getStatusBadge(subscription.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(subscription.startDate)}</TableCell>
                    <TableCell>{formatDate(subscription.endDate)}</TableCell>
                    <TableCell>${subscription.plan.price}</TableCell>
                    <TableCell>${subscription.paymentMethod}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            {t("viewDetails")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {t("sendReminder")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRestaurantId(subscription.restaurantId);
                              setPlanId(Number(subscription.planId));
                              setOpenSubscriptionModal(true);
                            }}
                          >
                            {t("extendSubscription")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openRefundDialog(subscription)}
                          >
                            {t("refundPayment") || "Refund last Stripe payment"}
                          </DropdownMenuItem>
                          {subscription.status !== "CANCELLED" && (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCancel(subscription.id)}
                            >
                              {t("cancelSubscription")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination>
                    <PaginationContent>
                      {/* Previous */}
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

                      {/* Pages */}
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

                      {/* Next */}
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
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog
        open={openSubscriptionModal}
        onOpenChange={setOpenSubscriptionModal}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {restaurantId
                ? t("editSubscriptionTitle")
                : t("addNewSubscriptionModalTitle")}
            </DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            initialData={{ restaurantId, planId }}
            onSubmit={handleSubmit}
            onClose={() => setOpenSubscriptionModal(false)}
            submitLabel={restaurantId ? t("save") : t("create")}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("refundPayment") || "Refund last Stripe payment"}
            </DialogTitle>
            <DialogDescription>
              {refundTarget
                ? `${refundTarget.restaurant.name} — ${refundTarget.plan.title}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="refund-reason">
                {t("refundReason") || "Internal reason (Stripe metadata)"}
              </Label>
              <input
                id="refund-reason"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Duplicate charge / billing error"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund-apology">
                {t("refundApologyMessage") ||
                  "Apology message to customer (optional)"}
              </Label>
              <textarea
                id="refund-apology"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                value={refundApology}
                onChange={(e) => setRefundApology(e.target.value)}
                maxLength={2000}
                placeholder={
                  t("refundApologyPlaceholder") ||
                  "We sincerely apologize for the duplicate charge. We have issued a full refund and corrected your subscription settings."
                }
              />
              <p className="text-xs text-muted-foreground">
                {t("refundApologyHint") ||
                  "Optional. Write in English — sent to the customer by in-app notification and email with refund details."}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRefundDialogOpen(false)}
                disabled={refundLoading}
              >
                {t("cancel") || "Cancel"}
              </Button>
              <Button
                type="button"
                onClick={handleRefundSubmit}
                disabled={refundLoading}
              >
                {refundLoading
                  ? t("processing") || "Processing..."
                  : t("confirmRefund") || "Confirm refund"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
