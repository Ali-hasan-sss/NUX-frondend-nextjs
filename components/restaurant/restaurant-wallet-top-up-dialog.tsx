"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { restaurantWalletService } from "@/features/restaurant/wallet/restaurantWalletService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

function TopUpPaymentForm({
  onSuccess,
  paymentIntentId,
}: {
  onSuccess: () => void;
  paymentIntentId: string;
}) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${origin}/dashboard/wallet`,
        },
        redirect: "if_required",
      });
      if (error) {
        toast.error(error.message || t("wallet.topUpFailed"));
      } else {
        if (paymentIntentId) {
          try {
            const sync = await restaurantWalletService.syncTopUpAfterPayment(paymentIntentId);
            if (!sync.applied && !sync.duplicate) {
              toast.warning(t("wallet.topUpSyncPending"));
            }
          } catch {
            toast.warning(t("wallet.topUpSyncPending"));
          }
        }
        toast.success(t("wallet.topUpSuccess"));
        onSuccess();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button type="button" className="w-full" disabled={!stripe || busy} onClick={handleSubmit}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("wallet.confirmPayment")}
      </Button>
    </div>
  );
}

interface RestaurantWalletTopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}

export function RestaurantWalletTopUpDialog({
  open,
  onOpenChange,
  onCompleted,
}: RestaurantWalletTopUpDialogProps) {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setClientSecret(null);
      setPaymentIntentId("");
      setIntentError(null);
    }
  }, [open]);

  const handleStart = async () => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n < 1) {
      toast.error(t("wallet.minAmount"));
      return;
    }
    if (!stripePromise) {
      toast.error(t("wallet.stripeNotConfigured"));
      return;
    }
    setIntentLoading(true);
    setIntentError(null);
    try {
      const out = await restaurantWalletService.createTopUpPaymentIntent(n);
      setPaymentIntentId(out.paymentIntentId || "");
      if (out.clientSecret) setClientSecret(out.clientSecret);
      else {
        toast.error(t("wallet.noClientSecret"));
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("wallet.topUpFailed");
      setIntentError(msg);
    } finally {
      setIntentLoading(false);
    }
  };

  const handleDone = () => {
    setClientSecret(null);
    setPaymentIntentId("");
    setAmount("");
    onCompleted();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-md max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle>{t("wallet.addFunds")}</DialogTitle>
        </DialogHeader>

        {!pk || !stripePromise ? (
          <p className="text-sm text-muted-foreground">{t("wallet.stripeNotConfigured")}</p>
        ) : !clientSecret ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("wallet.amountEur")}</label>
              <Input
                type="number"
                min={1}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
                placeholder="10"
              />
            </div>
            {intentError && <p className="text-sm text-destructive">{intentError}</p>}
            <Button type="button" onClick={handleStart} disabled={intentLoading} className="w-full">
              {intentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("wallet.continueToPayment")}
            </Button>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: isDark ? "night" : "stripe" },
            }}
          >
            <TopUpPaymentForm onSuccess={handleDone} paymentIntentId={paymentIntentId} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
