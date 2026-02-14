"use client";

import { forwardRef } from "react";
import { formatDate } from "@/lib/utils";

const formatPrice = (price: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(price);
};

const TAX_RATE = 0.19; // 19% German VAT

/** Plan total is gross (incl. tax). Net = total / (1 + 0.19), tax = total - net */
function getNetAndTax(grossTotal: number) {
  const net = grossTotal / (1 + TAX_RATE);
  const tax = grossTotal - net;
  return { net, tax };
}

const COMPANY_TAX = {
  name: "NUX",
  email: "info@nuxapp.de",
  address: "Bundesallee 38, 10717 Berlin Deutschland",
  steuerNummer: "27/304/00089",
  amtsgericht: "Amtsgericht Charlottenburg (zu HRB 279128 B)",
};

interface InvoicePDFProps {
  invoice: any;
  restaurant: any;
  appLogo?: string;
}

export const InvoicePDF = forwardRef<HTMLDivElement, InvoicePDFProps>(
  ({ invoice, restaurant, appLogo }, ref) => {
    // Fallback data to ensure PDF has content
    const invoiceData = invoice || {
      id: "INV-SAMPLE",
      stripeInvoiceId: "INV-SAMPLE-001",
      amountDue: 50.0,
      currency: "USD",
      status: "PAID",
      createdAt: new Date().toISOString(),
      subscription: {
        plan: {
          title: "Basic Plan",
          price: 50.0,
          currency: "USD",
          duration: 30,
        },
      },
    };

    const restaurantData = invoice?.restaurant ||
      restaurant || {
        name: "Sample Restaurant",
        address: "123 Main Street, City, Country",
      };
    const getStatusText = (status: string) => {
      switch (status) {
        case "PAID":
          return "Paid";
        case "PENDING":
          return "Pending";
        case "FAILED":
          return "Failed";
        case "CANCELLED":
          return "Cancelled";
        default:
          return "Unpaid";
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "PAID":
          return "text-green-600";
        case "PENDING":
          return "text-yellow-600";
        case "FAILED":
        case "CANCELLED":
          return "text-red-600";
        default:
          return "text-gray-600";
      }
    };

    return (
      <div
        ref={ref}
        className="w-full bg-white p-8 text-gray-900"
        style={{
          fontFamily: "Arial, sans-serif",
          lineHeight: "1.6",
          width: "800px",
          minHeight: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice</h1>
            <div className="text-sm text-gray-600">
              <p>
                Invoice Number: {invoiceData.stripeInvoiceId || invoiceData.id}
              </p>
              <p>Issue Date: {formatDate(invoiceData.createdAt)}</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            {appLogo && (
              <img src={appLogo} alt="App Logo" className="h-16 w-auto mb-4" />
            )}
            <p className="font-semibold text-lg text-gray-900">{COMPANY_TAX.name}</p>
            <p>Restaurant Management System</p>
            <p className="mt-2">{COMPANY_TAX.address}</p>
            <p>{COMPANY_TAX.email}</p>
            <p className="mt-2 font-medium text-gray-700">Steuer-Nr. {COMPANY_TAX.steuerNummer}</p>
            <p>{COMPANY_TAX.amtsgericht}</p>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Restaurant Information
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700">Restaurant Name:</p>
                <p className="text-gray-900">{restaurantData.name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Address:</p>
                <p className="text-gray-900">{restaurantData.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Invoice Details
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Quantity
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Price
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const { net, tax } = getNetAndTax(invoiceData.amountDue);
                  return (
                    <tr>
                      <td className="border border-gray-300 px-4 py-3">
                        {invoiceData.subscription?.plan?.title ||
                          "Subscription Plan"}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        1
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {formatPrice(net, invoiceData.currency)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                        {formatPrice(net, invoiceData.currency)}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals - Net + 19% tax = Total (plan price) */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-md">
            <div className="space-y-2">
              {(() => {
                const { net, tax } = getNetAndTax(invoiceData.amountDue);
                return (
                  <>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium">Subtotal (net):</span>
                      <span>{formatPrice(net, invoiceData.currency)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="font-medium">VAT 19%:</span>
                      <span>{formatPrice(tax, invoiceData.currency)}</span>
                    </div>
                    <div className="flex justify-between py-3 text-lg font-bold bg-gray-100 px-4 rounded">
                      <span>Total:</span>
                      <span>
                        {formatPrice(invoiceData.amountDue, invoiceData.currency)}
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Status and Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Payment Status
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p
                className={`font-semibold text-lg ${getStatusColor(
                  invoiceData.status
                )}`}
              >
                {getStatusText(invoiceData.status)}
              </p>
              {invoiceData.amountPaid && (
                <p className="text-sm text-gray-600 mt-2">
                  Amount Paid:{" "}
                  {formatPrice(invoiceData.amountPaid, invoiceData.currency)}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Payment Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {invoiceData.payment ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Payment Method:</span>{" "}
                    {invoiceData.payment.method || "Not specified"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Payment Date:</span>{" "}
                    {formatDate(invoiceData.payment.createdAt)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No payment information</p>
              )}
            </div>
          </div>
        </div>

        {/* Billing Period */}
        {(invoice.periodStart ||
          invoice.periodEnd ||
          invoice.subscription?.startDate ||
          invoice.subscription?.endDate) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Billing Period
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Start Date:</p>
                  <p className="text-gray-900">
                    {invoice.periodStart
                      ? formatDate(invoice.periodStart)
                      : invoice.subscription?.startDate
                      ? formatDate(invoice.subscription.startDate)
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">End Date:</p>
                  <p className="text-gray-900">
                    {invoice.periodEnd
                      ? formatDate(invoice.periodEnd)
                      : invoice.subscription?.endDate
                      ? formatDate(invoice.subscription.endDate)
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-600">
          <p>Thank you for using NUX</p>
          <p className="mt-2">
            {COMPANY_TAX.name} · {COMPANY_TAX.address}
          </p>
          <p>
            For inquiries: <a href={`mailto:${COMPANY_TAX.email}`} className="underline">{COMPANY_TAX.email}</a>
          </p>
        </div>
      </div>
    );
  }
);

InvoicePDF.displayName = "InvoicePDF";
