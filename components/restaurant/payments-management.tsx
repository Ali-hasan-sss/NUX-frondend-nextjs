"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  Users,
  Calendar,
  Filter,
  Star,
  Coins,
} from "lucide-react";
import { AppDispatch, RootState } from "@/app/store";
import {
  fetchPayments,
  fetchPaymentStats,
} from "@/features/restaurant/payments/paymentsThunks";
import { RestaurantPayment } from "@/features/restaurant/payments/paymentsTypes";
import { FilterBar } from "@/components/filters/FilterBar";
import { LabeledSelect } from "@/components/filters/LabeledSelect";
import { PageSizeSelect } from "@/components/filters/PageSizeSelect";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PaymentsManagement() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { payments, pagination, stats, isLoading, error } = useSelector(
    (state: RootState) => state.payments
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    dateRange: "all",
    paymentType: "all",
  });

  // Loading state for table only
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Calculate date range based on selection
  const getDateRange = (range: string) => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    switch (range) {
      case "last24h":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "last7days":
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return {
          startDate: lastWeek.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      case "last30days":
        const lastMonth = new Date(today);
        lastMonth.setDate(lastMonth.getDate() - 30);
        return {
          startDate: lastMonth.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      default:
        return { startDate: undefined, endDate: undefined };
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    if (!user?.id) return;

    const dateRangeData = getDateRange(filters.dateRange);
    const params = {
      page: filters.page,
      limit: filters.limit,
      ...(dateRangeData.startDate && { startDate: dateRangeData.startDate }),
      ...(dateRangeData.endDate && { endDate: dateRangeData.endDate }),
      ...(filters.paymentType &&
        filters.paymentType !== "all" && {
          paymentType: filters.paymentType as
            | "balance"
            | "stars_meal"
            | "stars_drink",
        }),
    };

    // Restaurant ID is now extracted from the token automatically
    dispatch(fetchPayments(params));
    dispatch(fetchPaymentStats(params));
  }, [dispatch, filters, user?.id]);

  // Handle table loading when filters change (but not on initial load)
  useEffect(() => {
    if (payments.length > 0 && !isInitialLoad) {
      setIsTableLoading(true);
    }
  }, [
    filters.dateRange,
    filters.paymentType,
    filters.page,
    filters.limit,
    payments.length,
    isInitialLoad,
  ]);

  // Monitor loading state from Redux and update table loading
  useEffect(() => {
    if (!isLoading && isTableLoading) {
      setIsTableLoading(false);
    }

    // Mark initial load as complete when first data is loaded
    if (!isLoading && payments.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isTableLoading, payments.length, isInitialLoad]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      dateRange: "all",
      paymentType: "all",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case "balance":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Star className="h-3 w-3 mr-1" />
            {t("dashboard.payments.balance")}
          </Badge>
        );
      case "stars_meal":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Star className="h-3 w-3 mr-1" />
{t("dashboard.payments.mealStarsType")}
          </Badge>
        );
      case "stars_drink":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Coins className="h-3 w-3 mr-1" />
{t("dashboard.payments.drinkStarsType")}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            {type}
          </Badge>
        );
    }
  };

  /** Display amount as loyalty points (stars), not money */
  const formatPoints = (amount: number) => {
    return `${Number(amount).toLocaleString()} ★`;
  };

  // Only show full page loading on initial load when no data exists
  if (isLoading && payments.length === 0 && isInitialLoad) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p>{t("dashboard.payments.loadingPaymentData")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{t("dashboard.payments.errorLoadingData")}: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("dashboard.payments.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.payments.description")}
        </p>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {t("dashboard.payments.pointsLogNotMoney") || "Loyalty points log (★) — not monetary payments."}
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.payments.totalPayments")}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPayments.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPoints(stats.totalAmount)} {t("dashboard.payments.total")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueCustomers}</div>
              <p className="text-xs text-muted-foreground">
{t("dashboard.payments.differentCustomers")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.payments.todaysPayments")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paymentsToday}</div>
              <p className="text-xs text-muted-foreground">
{t("dashboard.payments.thisWeeksPayments")}: {stats.paymentsThisWeek}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.payments.thisMonthsPayments")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.paymentsThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Type Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{t("dashboard.payments.balancePayments")}</p>
                  <p className="text-2xl font-bold">{stats.balancePayments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">{t("dashboard.payments.mealStars")}</p>
                  <p className="text-2xl font-bold">
                    {stats.starsMealPayments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">{t("dashboard.payments.drinkStars")}</p>
                  <p className="text-2xl font-bold">
                    {stats.starsDrinkPayments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>{t("dashboard.payments.filterData")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <LabeledSelect
                label={t("dashboard.payments.dateRange")}
                value={filters.dateRange}
                onChange={(value) => handleFilterChange("dateRange", value)}
                options={[
                  { label: t("dashboard.payments.allTime"), value: "all" },
                  { label: t("dashboard.payments.last24Hours"), value: "last24h" },
                  { label: t("dashboard.payments.last7Days"), value: "last7days" },
                  { label: t("dashboard.payments.last30Days"), value: "last30days" },
                ]}
              />

              <LabeledSelect
                label={t("dashboard.payments.paymentType")}
                value={filters.paymentType}
                onChange={(value) => handleFilterChange("paymentType", value)}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Balance", value: "balance" },
                  { label: "Meal Stars", value: "stars_meal" },
                  { label: "Drink Stars", value: "stars_drink" },
                ]}
              />

              <PageSizeSelect
                value={filters.limit}
                onChange={(value) =>
                  handleFilterChange("limit", value.toString())
                }
              />

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
{t("dashboard.payments.clearFilters")}
                </Button>
              </div>
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.payments.paymentRecords")}</CardTitle>
          <CardDescription>
            {t("dashboard.payments.viewAllPaymentRecords")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">
{t("dashboard.payments.loadingPaymentRecords")}
                </p>
              </div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payment records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.payments.customer")}</TableHead>
                      <TableHead>{t("dashboard.payments.email")}</TableHead>
                      <TableHead>{t("dashboard.payments.type")}</TableHead>
                      <TableHead>{t("dashboard.payments.amount")}</TableHead>
                      <TableHead>{t("dashboard.payments.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: RestaurantPayment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
{payment.user.fullName || t("dashboard.payments.notSpecified")}
                        </TableCell>
                        <TableCell>{payment.user.email}</TableCell>
                        <TableCell>
                          {getPaymentTypeBadge(payment.paymentType)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPoints(payment.amount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
{t("dashboard.payments.showing")}{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    {t("dashboard.payments.to")}{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    {t("dashboard.payments.of")} {pagination.totalItems} {t("dashboard.payments.items")}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagination.hasPrevPage) {
                              handlePageChange(pagination.currentPage - 1);
                            }
                          }}
                          className={
                            !pagination.hasPrevPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === pagination.currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagination.hasNextPage) {
                              handlePageChange(pagination.currentPage + 1);
                            }
                          }}
                          className={
                            !pagination.hasNextPage
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
