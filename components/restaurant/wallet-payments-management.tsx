"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
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
  Banknote,
  Calendar,
  CreditCard,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  WalletCards,
} from "lucide-react";
import { AppDispatch, RootState } from "@/app/store";
import { fetchWalletPaymentsData } from "@/features/restaurant/walletPayments/walletPaymentsThunks";
import type { WalletLedgerReportEntry } from "@/features/restaurant/walletPayments/walletPaymentsTypes";
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
import { cn } from "@/lib/utils";
import { walletLedgerTitleKey } from "@/lib/walletLedgerTitle";

export function WalletPaymentsManagement() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { entries, pagination, stats, currency, isLoading, error } =
    useSelector((state: RootState) => state.walletPayments);
  const { user } = useSelector((state: RootState) => state.auth);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    dateRange: "all",
  });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!isLoading && isInitialLoad && (stats !== null || error !== null)) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isInitialLoad, stats, error]);

  const getDateRange = (range: string) => {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    switch (range) {
      case "last24h": {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      }
      case "last7days": {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        return {
          startDate: lastWeek.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      }
      case "last30days": {
        const lastMonth = new Date(today);
        lastMonth.setDate(lastMonth.getDate() - 30);
        return {
          startDate: lastMonth.toISOString().split("T")[0],
          endDate: today.toISOString().split("T")[0],
        };
      }
      default:
        return { startDate: undefined, endDate: undefined };
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const dateRangeData = getDateRange(filters.dateRange);
    dispatch(
      fetchWalletPaymentsData({
        page: filters.page,
        limit: filters.limit,
        ...(dateRangeData.startDate && { startDate: dateRangeData.startDate }),
        ...(dateRangeData.endDate && { endDate: dateRangeData.endDate }),
      }),
    );
  }, [dispatch, filters, user?.id]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => {
      if (key === "page") {
        const page =
          typeof value === "number" ? value : parseInt(String(value), 10);
        return { ...prev, page: Number.isNaN(page) ? 1 : page };
      }
      if (key === "limit") {
        const limit =
          typeof value === "number" ? value : parseInt(String(value), 10);
        return {
          ...prev,
          limit: Number.isNaN(limit) ? 10 : limit,
          page: 1,
        };
      }
      return { ...prev, [key]: value, page: 1 };
    });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      dateRange: "all",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(i18n.language, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayCurrency = stats?.currency ?? currency ?? "EUR";

  if (isLoading && isInitialLoad) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p>{t("dashboard.walletPayments.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            {t("dashboard.walletPayments.error")}: {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("dashboard.walletPayments.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.walletPayments.description")}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("dashboard.walletPayments.hintCompletedOnly")}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href="/dashboard/wallet" className="inline-flex items-center gap-2">
            <WalletCards className="h-4 w-4" />
            {t("dashboard.walletPayments.goToWallet")}
          </Link>
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.walletPayments.statsPeriodEntries")}
              </CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalEntries.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.walletPayments.statsNetInPeriod")}: {stats.netChange}{" "}
                {displayCurrency}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.walletPayments.statsCredits")}
              </CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums">
                +{stats.creditsTotal} {displayCurrency}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.walletPayments.statsDebits")}
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive tabular-nums">
                −{stats.debitsTotal} {displayCurrency}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.walletPayments.statsRollingTitle")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                {t("dashboard.walletPayments.statsToday")}:{" "}
                <span className="font-semibold text-foreground">
                  {stats.entriesToday}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("dashboard.walletPayments.statsWeek")}:{" "}
                <span className="font-semibold text-foreground">
                  {stats.entriesThisWeek}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("dashboard.walletPayments.statsMonth")}:{" "}
                <span className="font-semibold text-foreground">
                  {stats.entriesThisMonth}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>{t("dashboard.walletPayments.filterTitle")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <LabeledSelect
                label={t("dashboard.walletPayments.dateRange")}
                value={filters.dateRange}
                onChange={(value) => handleFilterChange("dateRange", value)}
                options={[
                  { label: t("dashboard.walletPayments.allTime"), value: "all" },
                  {
                    label: t("dashboard.walletPayments.last24Hours"),
                    value: "last24h",
                  },
                  {
                    label: t("dashboard.walletPayments.last7Days"),
                    value: "last7days",
                  },
                  {
                    label: t("dashboard.walletPayments.last30Days"),
                    value: "last30days",
                  },
                ]}
              />
              <PageSizeSelect
                value={filters.limit}
                onChange={(value) => handleFilterChange("limit", value)}
              />
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  {t("dashboard.walletPayments.clearFilters")}
                </Button>
              </div>
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.walletPayments.tableTitle")}</CardTitle>
          <CardDescription>
            {t("dashboard.walletPayments.tableDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && entries.length === 0 ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              {t("dashboard.walletPayments.loading")}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t("dashboard.walletPayments.noRecords")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.walletPayments.colType")}</TableHead>
                      <TableHead>{t("dashboard.walletPayments.colDescription")}</TableHead>
                      <TableHead>{t("dashboard.walletPayments.colSource")}</TableHead>
                      <TableHead>{t("dashboard.walletPayments.colAmount")}</TableHead>
                      <TableHead>{t("dashboard.walletPayments.colDate")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((row: WalletLedgerReportEntry) => {
                      const isCredit = row.type === "CREDIT";
                      const titleKey = walletLedgerTitleKey(
                        row.type,
                        row.source,
                        "restaurant",
                      );
                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                isCredit
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-destructive/15 text-destructive",
                              )}
                            >
                              {isCredit
                                ? t("wallet.credit")
                                : t("wallet.debit")}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[240px]">
                            <span className="text-sm font-medium">
                              {titleKey
                                ? t(titleKey)
                                : isCredit
                                  ? t("wallet.credit")
                                  : t("wallet.debit")}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.source}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "font-medium tabular-nums",
                              isCredit ? "text-emerald-700" : "text-destructive",
                            )}
                          >
                            {isCredit ? "+" : "−"}
                            {row.amount} {displayCurrency}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {formatDate(row.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-sm text-muted-foreground">
                    {t("dashboard.walletPayments.showing")}{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    {t("dashboard.walletPayments.to")}{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems,
                    )}{" "}
                    {t("dashboard.walletPayments.of")}{" "}
                    {pagination.totalItems} {t("dashboard.walletPayments.items")}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (pagination.hasPrevPage) {
                              handleFilterChange(
                                "page",
                                pagination.currentPage - 1,
                              );
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
                        (_, i) => i + 1,
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleFilterChange("page", page);
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
                              handleFilterChange(
                                "page",
                                pagination.currentPage + 1,
                              );
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
