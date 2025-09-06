"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, CreditCard, CheckCircle, AlertTriangle } from "lucide-react"

// Mock data - in real app, this would come from API
const paymentHistory = [
  {
    id: "pay_1",
    date: "2024-01-30",
    amount: 79,
    plan: "Professional",
    status: "paid",
    method: "Credit Card ****1234",
    invoiceId: "INV-2024-001",
  },
  {
    id: "pay_2",
    date: "2023-12-30",
    amount: 79,
    plan: "Professional",
    status: "paid",
    method: "Credit Card ****1234",
    invoiceId: "INV-2023-012",
  },
  {
    id: "pay_3",
    date: "2023-11-30",
    amount: 79,
    plan: "Professional",
    status: "paid",
    method: "Credit Card ****1234",
    invoiceId: "INV-2023-011",
  },
  {
    id: "pay_4",
    date: "2023-10-30",
    amount: 29,
    plan: "Starter",
    status: "paid",
    method: "Credit Card ****1234",
    invoiceId: "INV-2023-010",
  },
  {
    id: "pay_5",
    date: "2023-09-30",
    amount: 29,
    plan: "Starter",
    status: "failed",
    method: "Credit Card ****1234",
    invoiceId: "INV-2023-009",
  },
]

const currentSubscription = {
  plan: "Professional",
  amount: 79,
  nextPayment: "2024-02-29",
  status: "active",
  paymentMethod: "Credit Card ****1234",
}

export function PaymentHistory() {
  const totalPaid = paymentHistory.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
  const successfulPayments = paymentHistory.filter((p) => p.status === "paid").length
  const failedPayments = paymentHistory.filter((p) => p.status === "failed").length

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
        <p className="text-muted-foreground">Track your subscription payments and billing history</p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plan</p>
              <p className="text-2xl font-bold">{currentSubscription.plan}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
              <p className="text-2xl font-bold">${currentSubscription.amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Next Payment</p>
              <p className="text-2xl font-bold">{new Date(currentSubscription.nextPayment).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{currentSubscription.status}</Badge>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">{currentSubscription.paymentMethod}</p>
              </div>
              <Button variant="outline" className="bg-transparent">
                Update Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Total Paid</p>
                <p className="text-2xl font-bold">${totalPaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Successful Payments</p>
                <p className="text-2xl font-bold">{successfulPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Failed Payments</p>
                <p className="text-2xl font-bold">{failedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All your subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.plan}</Badge>
                    </TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {payment.status === "paid" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <Badge variant={payment.status === "paid" ? "default" : "destructive"}>{payment.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{payment.invoiceId}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" disabled={payment.status !== "paid"}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
