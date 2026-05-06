"use client";

import { useState, useEffect, useMemo } from "react";
import { companyWalletService } from "@/features/company/companyWalletService";
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
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompanyWalletWithdrawDialogProps {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onCompleted: () => void;
}

export function CompanyWalletWithdrawDialog({
  companyId,
  open,
  onOpenChange,
  currency,
  onCompleted,
}: CompanyWalletWithdrawDialogProps) {
  const wallet = useMemo(() => companyWalletService(companyId), [companyId]);
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setAmount("");
      setIban("");
      setHolder("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const n = parseFloat(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error(t("wallet.invalidAmount"));
      return;
    }
    if (n < 200) {
      toast.error(t("wallet.minWithdrawal200"));
      return;
    }
    if (!iban.trim() || !holder.trim()) {
      toast.error(t("wallet.fillPayoutDetails"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await wallet.requestWithdrawal({
        amount: n,
        currency: currency || "EUR",
        accountInfo: { iban: iban.trim(), accountHolder: holder.trim() },
      });
      toast.success(t("wallet.withdrawSubmittedFrozen"));
      onCompleted();
      onOpenChange(false);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("dashboard.wallet.withdrawError");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("wallet.requestWithdrawal")}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">{t("wallet.withdrawHint")}</p>
        <Alert className="border-amber-500/40 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-950 dark:text-amber-100 text-xs">
            {t("wallet.withdrawFreezeNotice")} {t("wallet.minWithdrawal200Hint")}
          </AlertDescription>
        </Alert>
        {error && (
          <Alert variant="destructive" className="bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t("payment.paymentAmount")}</label>
            <Input
              type="number"
              min={200}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">IBAN</label>
            <Input value={iban} onChange={(e) => setIban(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">{t("wallet.accountHolder")}</label>
            <Input value={holder} onChange={(e) => setHolder(e.target.value)} className="mt-1" />
          </div>
          <Button type="button" className="w-full" disabled={loading} onClick={handleSubmit}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("wallet.submitRequest")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
