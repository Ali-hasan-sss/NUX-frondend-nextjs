"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  FileText,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppDispatch, RootState } from "@/app/store";
import {
  fetchAdminInvoices,
  deleteAdminInvoice,
  markAdminInvoiceAsPaid,
  fetchAdminInvoiceStatistics,
} from "@/features/admin/invoices/adminInvoicesThunks";
import type { AdminInvoice } from "@/features/admin/invoices/adminInvoicesTypes";
import { fetchAdminRestaurants } from "@/features/admin/restaurants/adminRestaurantsThunks";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { formatDate } from "@/lib/utils";
import { CreateInvoiceForm } from "./forms/createInvoiceForm";
import ConfirmDialog from "@/components/confirmMessage";

export function InvoicesManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { invoices, pagination, statistics, isLoading, error } = useSelector(
    (state: RootState) => state.adminInvoices
  );
  const restaurants = useSelector(
    (state: RootState) => state.adminRestaurants.items
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [restaurantFilter, setRestaurantFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState("all");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

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

  useEffect(() => {
    dispatch(fetchAdminRestaurants());
    dispatch(fetchAdminInvoiceStatistics({}));
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
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Pending
          </Badge>
        );
      case "unpaid":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Unpaid
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />;
      case "unpaid":
      case "failed":
      case "cancelled":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete) {
      await dispatch(deleteAdminInvoice(invoiceToDelete));
      // Refresh the list
      const dateRangeData = getDateRange(dateRange);
      dispatch(
        fetchAdminInvoices({
          search: debouncedSearchTerm || undefined,
          restaurantId:
            restaurantFilter === "all" ? undefined : restaurantFilter,
          status: statusFilter === "all" ? undefined : (statusFilter as any),
          startDate: dateRangeData.startDate,
          endDate: dateRangeData.endDate,
          page: currentPage,
          pageSize,
        })
      );
      setInvoiceToDelete(null);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    await dispatch(
      markAdminInvoiceAsPaid({ id, data: { paymentMethod: "CASH" } })
    );
    // Refresh the list
    const dateRangeData = getDateRange(dateRange);
    dispatch(
      fetchAdminInvoices({
        search: debouncedSearchTerm || undefined,
        restaurantId: restaurantFilter === "all" ? undefined : restaurantFilter,
        status: statusFilter === "all" ? undefined : (statusFilter as any),
        startDate: dateRangeData.startDate,
        endDate: dateRangeData.endDate,
        page: currentPage,
        pageSize,
      })
    );
  };

  const handleCreateInvoice = async () => {
    setOpenCreateModal(false);
    // Refresh the list
    const dateRangeData = getDateRange(dateRange);
    dispatch(
      fetchAdminInvoices({
        search: debouncedSearchTerm || undefined,
        restaurantId: restaurantFilter === "all" ? undefined : restaurantFilter,
        status: statusFilter === "all" ? undefined : (statusFilter as any),
        startDate: dateRangeData.startDate,
        endDate: dateRangeData.endDate,
        page: currentPage,
        pageSize,
      })
    );
  };

  // Compose params and fetch when filters change
  useEffect(() => {
    const dateRangeData = getDateRange(dateRange);
    const params = {
      search: debouncedSearchTerm || undefined,
      restaurantId: restaurantFilter === "all" ? undefined : restaurantFilter,
      status: (statusFilter === "all" ? undefined : statusFilter) as
        | "PENDING"
        | "PAID"
        | "UNPAID"
        | "CANCELLED"
        | "FAILED"
        | undefined,
      startDate: dateRangeData.startDate,
      endDate: dateRangeData.endDate,
      page: currentPage,
      pageSize,
    };
    dispatch(fetchAdminInvoices(params));
  }, [
    dispatch,
    debouncedSearchTerm,
    restaurantFilter,
    statusFilter,
    dateRange,
    currentPage,
    pageSize,
  ]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Invoices Management
        </h1>
        <p className="text-muted-foreground">
          Monitor and manage restaurant invoices
        </p>
      </div>

      {isLoading && <p>Loading invoices...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Paid</p>
                  <p className="text-2xl font-bold">
                    {statistics.paidInvoices}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">
                    {statistics.pendingInvoices}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Unpaid</p>
                  <p className="text-2xl font-bold">
                    {statistics.unpaidInvoices}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(statistics.paidRevenue, "EUR")}
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
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Search
              </Label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by invoice ID or restaurant name..."
                className="w-full"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Restaurant Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Restaurant
                </Label>
                <Select
                  value={restaurantFilter}
                  onValueChange={(v) => setRestaurantFilter(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Restaurants" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Restaurants</SelectItem>
                    {restaurants.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(
                      v as
                        | "PENDING"
                        | "PAID"
                        | "UNPAID"
                        | "CANCELLED"
                        | "FAILED"
                        | "all"
                    )
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Date Range
                </Label>
                <Select
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="last24h">Last 24 hours</SelectItem>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Size */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Page Size
                </Label>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <div className="flex flex-col px-5 gap-4 md:flex-row md:items-center md:justify-between">
          <CardHeader className="px-0">
            <CardTitle>Invoices ({pagination?.totalItems || 0})</CardTitle>
            <CardDescription>All restaurant invoices</CardDescription>
          </CardHeader>
          <Button
            className="flex items-center gap-2 w-full md:w-auto"
            onClick={() => setOpenCreateModal(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Invoice ID</TableHead>
                  <TableHead className="min-w-[200px]">Restaurant</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Amount Due</TableHead>
                  <TableHead className="min-w-[100px]">Amount Paid</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">
                    Payment Method
                  </TableHead>
                  <TableHead className="min-w-[120px] hidden md:table-cell">
                    Created Date
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-mono text-sm">
                        {invoice.id.slice(0, 8)}...
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invoice.restaurant.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.restaurant.owner.fullName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        {getStatusBadge(invoice.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(invoice.amountDue, invoice.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {invoice.amountPaid
                          ? formatCurrency(invoice.amountPaid, invoice.currency)
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {invoice.paymentMethod || "-"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(invoice.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          {invoice.status === "PENDING" && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(invoice.id)}
                            >
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            Delete Invoice
                          </DropdownMenuItem>
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

      {/* Create Invoice Modal */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <CreateInvoiceForm
            onSubmit={handleCreateInvoice}
            onClose={() => setOpenCreateModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
