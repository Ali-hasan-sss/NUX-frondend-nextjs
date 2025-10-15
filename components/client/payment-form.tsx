"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { payAtRestaurant } from "@/features/client";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wallet, Coffee, Utensils, AlertCircle } from "lucide-react";

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: (result: any) => void;
}

export function PaymentForm({
  open,
  onOpenChange,
  onPaymentSuccess,
}: PaymentFormProps) {
  const dispatch = useAppDispatch();
  const { userBalances, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );
  const [formData, setFormData] = useState({
    targetId: "",
    currencyType: "" as "balance" | "stars_meal" | "stars_drink",
    amount: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.targetId || !formData.currencyType || !formData.amount) {
      return;
    }

    try {
      const result = await dispatch(
        payAtRestaurant({
          targetId: formData.targetId,
          currencyType: formData.currencyType,
          amount: parseFloat(formData.amount),
        })
      );

      if (payAtRestaurant.fulfilled.match(result)) {
        onPaymentSuccess?.(result.payload);
        setFormData({ targetId: "", currencyType: "" as any, amount: "" });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  const getCurrencyIcon = (type: string) => {
    switch (type) {
      case "balance":
        return <Wallet className="h-4 w-4 text-green-600" />;
      case "stars_meal":
        return <Utensils className="h-4 w-4 text-yellow-600" />;
      case "stars_drink":
        return <Coffee className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const getCurrencyLabel = (type: string) => {
    switch (type) {
      case "balance":
        return "Balance ($)";
      case "stars_meal":
        return "Meal Stars";
      case "stars_drink":
        return "Drink Stars";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Make Payment
          </DialogTitle>
          <DialogDescription>
            Use your loyalty points or balance to make a payment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error.payment && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.payment}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="targetId">Restaurant/Target ID</Label>
            <Input
              id="targetId"
              placeholder="Enter restaurant ID or scan QR code"
              value={formData.targetId}
              onChange={(e) =>
                setFormData({ ...formData, targetId: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currencyType">Payment Method</Label>
            <Select
              value={formData.currencyType}
              onValueChange={(value) =>
                setFormData({ ...formData, currencyType: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-green-600" />
                    Balance ($)
                  </div>
                </SelectItem>
                <SelectItem value="stars_meal">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-yellow-600" />
                    Meal Stars
                  </div>
                </SelectItem>
                <SelectItem value="stars_drink">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-blue-600" />
                    Drink Stars
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading.payment ||
                !formData.targetId ||
                !formData.currencyType ||
                !formData.amount
              }
              className="flex-1"
            >
              {loading.payment && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Pay Now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
