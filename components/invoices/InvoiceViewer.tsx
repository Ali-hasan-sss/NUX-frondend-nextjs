"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { InvoicePDF } from "./InvoicePDF";
import { PDFGenerator } from "./PDFGenerator";

interface InvoiceViewerProps {
  invoice: any;
  restaurant: any;
  isOpen: boolean;
  onClose: () => void;
  loading?: boolean;
  error?: string;
  appLogo?: string;
}

export function InvoiceViewer({
  invoice,
  restaurant,
  isOpen,
  onClose,
  loading = false,
  error,
  appLogo,
}: InvoiceViewerProps) {
  const [viewMode, setViewMode] = useState<"preview" | "pdf">("preview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading invoice details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Invoice</DialogTitle>
            <DialogDescription>
              An error occurred while loading invoice details
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <br />
              <span className="text-sm mt-2 block">
                Please try refreshing the page or contact support if the issue
                persists.
              </span>
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details</span>
            <div className="flex items-center space-x-2 space-x-reverse">
              {getStatusIcon(invoice.status)}
              {getStatusBadge(invoice.status)}
            </div>
          </DialogTitle>
          <DialogDescription>
            View and download subscription invoice
          </DialogDescription>
        </DialogHeader>

        {/* View Mode Toggle */}
        <div className="flex space-x-2 space-x-reverse mb-6">
          <Button
            variant={viewMode === "preview" ? "default" : "outline"}
            onClick={() => setViewMode("preview")}
            size="sm"
          >
            Preview
          </Button>
          <Button
            variant={viewMode === "pdf" ? "default" : "outline"}
            onClick={() => setViewMode("pdf")}
            size="sm"
          >
            View PDF
          </Button>
        </div>

        {/* Content */}
        {viewMode === "preview" ? (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Invoice Number
                </h4>
                <p className="text-lg">
                  {invoice.stripeInvoiceId || invoice.id}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Issue Date
                </h4>
                <p className="text-lg">{formatDate(invoice.createdAt)}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Restaurant
                </h4>
                <p className="text-lg font-medium">
                  {invoice.restaurant?.name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.restaurant?.address || ""}
                </p>
              </div>
            </div>

            {/* Amount Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Amount Due
                </h4>
                <p className="text-2xl font-bold">
                  {formatPrice(invoice.amountDue, invoice.currency)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Amount Paid
                </h4>
                <p className="text-2xl font-bold">
                  {invoice.amountPaid
                    ? formatPrice(invoice.amountPaid, invoice.currency)
                    : "Unpaid"}
                </p>
              </div>
            </div>

            {/* Subscription Details */}
            {invoice.subscription && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Subscription Details
                </h4>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span>
                      {invoice.subscription.plan?.title || "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span>
                      {invoice.subscription.plan
                        ? formatPrice(
                            invoice.subscription.plan.price,
                            invoice.subscription.plan.currency
                          )
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>
                      {invoice.subscription.plan?.duration || "Not specified"}{" "}
                      days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>
                      {invoice.subscription.startDate
                        ? formatDate(invoice.subscription.startDate)
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Date:</span>
                    <span>
                      {invoice.subscription.endDate
                        ? formatDate(invoice.subscription.endDate)
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="capitalize">
                      {invoice.subscription.status || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            {invoice.payment && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Payment Details
                </h4>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>{invoice.payment.method || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span>{invoice.payment.status || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Date:</span>
                    <span>{formatDate(invoice.payment.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <PDFGenerator
                invoice={invoice}
                restaurant={restaurant}
                appLogo={appLogo}
                className="flex-1"
              />
              {invoice.hostedInvoiceUrl && (
                <Button variant="outline" asChild className="flex-1">
                  <a
                    href={invoice.hostedInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View in Stripe
                  </a>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* PDF Preview */}
            <div className="border rounded-lg overflow-hidden">
              <InvoicePDF
                invoice={invoice}
                restaurant={restaurant}
                appLogo={appLogo}
              />
            </div>

            {/* PDF Actions */}
            <div className="flex justify-center">
              <PDFGenerator
                invoice={invoice}
                restaurant={restaurant}
                appLogo={appLogo}
                className="w-full max-w-md"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
