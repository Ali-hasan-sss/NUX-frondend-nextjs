"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { requestWalletWithdrawal, fetchWalletBalance } from "@/features/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletWithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletWithdrawDialog({ open, onOpenChange }: WalletWithdrawDialogProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { loading, error, balance } = useAppSelector((s) => s.clientWallet);
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");

  useEffect(() => {
    if (!open) {
      setAmount("");
      setIban("");
      setHolder("");
    }
  }, [open]);

  const handleSubmit = async () => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error(t("wallet.invalidAmount"));
      return;
    }
    if (!iban.trim() || !holder.trim()) {
      toast.error(t("wallet.fillPayoutDetails"));
      return;
    }
    const result = await dispatch(
      requestWalletWithdrawal({
        amount: n,
        currency: balance?.currency || "EUR",
        accountInfo: { iban: iban.trim(), accountHolder: holder.trim() },
      })
    );
    if (requestWalletWithdrawal.fulfilled.match(result)) {
      toast.success(t("wallet.withdrawSubmitted"));
      dispatch(fetchWalletBalance());
      onOpenChange(false);
    }
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md",
          isDark ? "bg-[rgba(26,31,58,0.98)] border-white/10" : ""
        )}
        style={{ borderColor: colors.border }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: colors.text }}>{t("wallet.requestWithdrawal")}</DialogTitle>
        </DialogHeader>
        <p className="text-xs" style={{ color: colors.textSecondary }}>
          {t("wallet.withdrawHint")}
        </p>
        {error.withdraw && (
          <Alert variant="destructive" className="bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error.withdraw}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-3">
          <div>
            <label className="text-sm" style={{ color: colors.text }}>
              {t("wallet.amount")}
            </label>
            <Input
              type="number"
              min={0.01}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm" style={{ color: colors.text }}>
              IBAN
            </label>
            <Input value={iban} onChange={(e) => setIban(e.target.value)} />
          </div>
          <div>
            <label className="text-sm" style={{ color: colors.text }}>
              {t("wallet.accountHolder")}
            </label>
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} />
          </div>
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading.withdraw}
          className="w-full"
          style={{ backgroundColor: colors.primary }}
        >
          {loading.withdraw ? <Loader2 className="h-4 w-4 animate-spin" /> : t("wallet.submitRequest")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
