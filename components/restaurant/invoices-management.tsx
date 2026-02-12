"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceViewer } from "@/components/invoices/InvoiceViewer";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { useTranslation } from "react-i18next";
import {
  fetchInvoices,
  fetchInvoiceById,
  clearSelectedInvoice,
} from "@/features/restaurant/invoices/invoicesThunks";

export function InvoicesManagement() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { invoices, selectedInvoice, loading, error, pagination } =
    useAppSelector((state) => state.restaurantInvoices);

  // Get restaurant info for PDF
  const { data: restaurant } = useAppSelector(
    (state) => state.restaurantAccount
  );

  // Load invoices on component mount
  useEffect(() => {
    dispatch(fetchInvoices({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const handleInvoiceClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsDialogOpen(true);
    dispatch(fetchInvoiceById(invoiceId));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedInvoiceId(null);
    dispatch(clearSelectedInvoice());
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const truncateInvoiceId = (id: string) => {
    return id.length > 5 ? `${id.slice(0, 5)}...` : id;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <div className="h-4 w-4 bg-green-600 rounded-full" />;
      case "PENDING":
        return <div className="h-4 w-4 bg-yellow-600 rounded-full" />;
      case "FAILED":
      case "CANCELLED":
        return <div className="h-4 w-4 bg-red-600 rounded-full" />;
      default:
        return <div className="h-4 w-4 bg-gray-600 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PAID: "bg-green-100 text-green-800 hover:bg-green-100",
      PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      FAILED: "bg-red-100 text-red-800 hover:bg-red-100",
      CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100",
      UNPAID: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    };

    return (
      <Badge
        className={variants[status as keyof typeof variants] || variants.UNPAID}
      >
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("dashboard.invoices.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.invoices.description")}
        </p>
      </div>

      {/* Error Alert */}
      {error.invoices && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.invoices}</AlertDescription>
        </Alert>
      )}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.invoices.billingHistory")}</CardTitle>
          <CardDescription>
            {t("dashboard.invoices.allSubscriptionInvoices")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading.invoices ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t("dashboard.invoices.loadingInvoices")}</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center p-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("dashboard.invoices.noInvoicesFound")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">{t("dashboard.invoices.id")}</TableHead>
                      <TableHead className="w-32">{t("dashboard.invoices.restaurant")}</TableHead>
                      <TableHead className="w-24">{t("dashboard.invoices.plan")}</TableHead>
                      <TableHead className="w-20">{t("dashboard.invoices.amount")}</TableHead>
                      <TableHead className="w-24">{t("dashboard.invoices.period")}</TableHead>
                      <TableHead className="w-20">{t("dashboard.invoices.payment")}</TableHead>
                      <TableHead className="w-20">{t("dashboard.invoices.status")}</TableHead>
                      <TableHead className="w-20">{t("dashboard.invoices.date")}</TableHead>
                      <TableHead className="w-20">{t("dashboard.invoices.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium text-xs">
                          <span title={invoice.stripeInvoiceId || invoice.id}>
                            {truncateInvoiceId(
                              invoice.stripeInvoiceId || invoice.id
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col">
                            <span
                              className="font-medium truncate max-w-[100px]"
                              title={invoice.restaurant?.name || "N/A"}
                            >
                              {invoice.restaurant?.name || "N/A"}
                            </span>
                            <span
                              className="text-xs text-muted-foreground truncate max-w-[100px]"
                              title={invoice.restaurant?.address || ""}
                            >
                              {invoice.restaurant?.address || ""}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span
                            className="truncate max-w-[80px] block"
                            title={invoice.subscription?.plan?.title || "N/A"}
                          >
                            {invoice.subscription?.plan?.title || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {formatPrice(invoice.amountDue, invoice.currency)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {invoice.subscription?.startDate &&
                          invoice.subscription?.endDate ? (
                            <span className="whitespace-nowrap">
                              {formatDateShort(invoice.subscription.startDate)}→
                              {formatDateShort(invoice.subscription.endDate)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span
                            className="truncate max-w-[60px] block"
                            title={invoice.payment?.paymentMethod}
                          >
                            {invoice.payment?.paymentMethod?.split(" ")[0] ||
                              "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {getStatusIcon(invoice.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDateShort(invoice.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs px-2 py-1 h-7"
                            onClick={() => handleInvoiceClick(invoice.id)}
                          >
                            {t("dashboard.invoices.view")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {invoices.length} of {pagination.total} invoices
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        dispatch(
                          fetchInvoices({
                            page: pagination.page - 1,
                            pageSize: pagination.pageSize,
                          })
                        )
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() =>
                        dispatch(
                          fetchInvoices({
                            page: pagination.page + 1,
                            pageSize: pagination.pageSize,
                          })
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <InvoiceViewer
        invoice={selectedInvoice}
        restaurant={restaurant}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        loading={loading.selectedInvoice}
        error={error.selectedInvoice ?? undefined}
        appLogo="/logo.png" // Add your app logo path
      />
    </div>
  );
}
