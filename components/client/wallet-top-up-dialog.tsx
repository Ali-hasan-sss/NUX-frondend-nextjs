"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement, 
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createWalletTopUpIntent,
  fetchWalletBalance,
  fetchWalletTransactions,
  resetWalletTransactions,
  syncWalletTopUpAfterPayment,
} from "@/features/client";
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
import { useClientTheme } from "@/hooks/useClientTheme";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = pk ? loadStripe(pk) : null;

function TopUpPaymentForm({
  onSuccess,
  colors,
  isDark,
  paymentIntentId,
}: {
  onSuccess: () => void;
  colors: { text: string; primary: string; border: string };
  isDark: boolean;
  paymentIntentId: string;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/client/wallet`,
        },
        redirect: "if_required",
      });
      if (error) {
        toast.error(error.message || t("wallet.topUpFailed"));
      } else {
        if (paymentIntentId) {
          const sync = await dispatch(syncWalletTopUpAfterPayment(paymentIntentId));
          if (syncWalletTopUpAfterPayment.rejected.match(sync)) {
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
      <Button
        type="button"
        className="w-full"
        disabled={!stripe || busy}
        onClick={handleSubmit}
        style={{ backgroundColor: colors.primary }}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("wallet.confirmPayment")}
      </Button>
    </div>
  );
}

interface WalletTopUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletTopUpDialog({ open, onOpenChange }: WalletTopUpDialogProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { loading, error } = useAppSelector((s) => s.clientWallet);
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState("");

  useEffect(() => {
    if (!open) {
      setAmount("");
      setClientSecret(null);
      setPaymentIntentId("");
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
    const result = await dispatch(createWalletTopUpIntent(n));
    if (createWalletTopUpIntent.fulfilled.match(result)) {
      const secret = result.payload.clientSecret;
      setPaymentIntentId(result.payload.paymentIntentId || "");
      if (secret) setClientSecret(secret);
      else toast.error(t("wallet.noClientSecret"));
    }
  };

  const handleDone = () => {
    dispatch(fetchWalletBalance());
    dispatch(resetWalletTransactions());
    dispatch(fetchWalletTransactions({ take: 20, append: false }));
    setClientSecret(null);
    setPaymentIntentId("");
    setAmount("");
    onOpenChange(false);
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md max-h-[90vh] overflow-y-auto",
          isDark ? "bg-[rgba(26,31,58,0.98)] border-white/10" : ""
        )}
        style={{ borderColor: colors.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: colors.text }}>{t("wallet.addFunds")}</DialogTitle>
        </DialogHeader>

        {!pk || !stripePromise ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {t("wallet.stripeNotConfigured")}
          </p>
        ) : !clientSecret ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" style={{ color: colors.text }}>
                {t("wallet.amountEur")}
              </label>
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
            {error.topUpIntent && (
              <p className="text-sm text-red-500">{error.topUpIntent}</p>
            )}
            <Button
              type="button"
              onClick={handleStart}
              disabled={loading.topUpIntent}
              className="w-full"
              style={{ backgroundColor: colors.primary }}
            >
              {loading.topUpIntent ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("wallet.continueToPayment")
              )}
            </Button>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: isDark ? "night" : "stripe",
              },
            }}
          >
            <TopUpPaymentForm
              onSuccess={handleDone}
              colors={colors}
              isDark={isDark}
              paymentIntentId={paymentIntentId}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
