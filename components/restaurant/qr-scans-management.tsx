"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { QrCode, Users, Calendar, Filter, Download } from "lucide-react";
import { AppDispatch, RootState } from "@/app/store";
import {
  fetchQRScans,
  fetchQRScanStats,
} from "@/features/restaurant/qrScans/qrScansThunks";
import { QRScan } from "@/features/restaurant/qrScans/qrScansTypes";
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

export function QRScansManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { scans, pagination, stats, isLoading, error } = useSelector(
    (state: RootState) => state.qrScans
  );

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    dateRange: "all",
    type: "all",
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
    const dateRangeData = getDateRange(filters.dateRange);
    const params = {
      page: filters.page,
      limit: filters.limit,
      ...(dateRangeData.startDate && { startDate: dateRangeData.startDate }),
      ...(dateRangeData.endDate && { endDate: dateRangeData.endDate }),
      ...(filters.type &&
        filters.type !== "all" && { type: filters.type as "drink" | "meal" }),
    };

    dispatch(fetchQRScans(params));
    dispatch(fetchQRScanStats(params));
  }, [dispatch, filters]);

  // Handle table loading when filters change (but not on initial load)
  useEffect(() => {
    if (scans.length > 0 && !isInitialLoad) {
      setIsTableLoading(true);
    }
  }, [
    filters.dateRange,
    filters.type,
    filters.page,
    filters.limit,
    scans.length,
    isInitialLoad,
  ]);

  // Monitor loading state from Redux and update table loading
  useEffect(() => {
    if (!isLoading && isTableLoading) {
      setIsTableLoading(false);
    }

    // Mark initial load as complete when first data is loaded
    if (!isLoading && scans.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, isTableLoading, scans.length, isInitialLoad]);

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
      type: "all",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScanTypeBadge = (type: string) => {
    return type === "drink" ? (
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        Drink
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        Meal
      </Badge>
    );
  };

  // Only show full page loading on initial load when no data exists
  if (isLoading && scans.length === 0 && isInitialLoad) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p>Loading QR scan data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          QR Scans Management
        </h1>
        <p className="text-muted-foreground">
          View and manage QR code scan records for the restaurant
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalScans.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.drinkScans} drinks, {stats.mealScans} meals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">
                Different customers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Scans
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scansToday}</div>
              <p className="text-xs text-muted-foreground">
                This week: {stats.scansThisWeek}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                This Month's Scans
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scansThisMonth}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterBar>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <LabeledSelect
                label="Date Range"
                value={filters.dateRange}
                onChange={(value) => handleFilterChange("dateRange", value)}
                options={[
                  { label: "All time", value: "all" },
                  { label: "Last 24 hours", value: "last24h" },
                  { label: "Last 7 days", value: "last7days" },
                  { label: "Last 30 days", value: "last30days" },
                ]}
              />

              <LabeledSelect
                label="Scan Type"
                value={filters.type}
                onChange={(value) => handleFilterChange("type", value)}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Drink", value: "drink" },
                  { label: "Meal", value: "meal" },
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
                  Clear Filters
                </Button>
              </div>
            </div>
          </FilterBar>
        </CardContent>
      </Card>

      {/* QR Scans Table */}
      <Card>
        <CardHeader>
          <CardTitle>QR Scan Records</CardTitle>
          <CardDescription>
            View all QR code scan records with user details and timestamps
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading scan records...</p>
              </div>
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scan records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Scan Type</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Scan Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans.map((scan: QRScan) => (
                      <TableRow key={scan.id}>
                        <TableCell className="font-medium">
                          {scan.user.fullName || "Not specified"}
                        </TableCell>
                        <TableCell>{scan.user.email}</TableCell>
                        <TableCell>{getScanTypeBadge(scan.type)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {scan.qrCode}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {scan.latitude.toFixed(4)},{" "}
                          {scan.longitude.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(scan.createdAt)}
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
                    Showing{" "}
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
                    to{" "}
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} items
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
