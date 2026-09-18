"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LoyaltyScanRequestItem } from "@/contexts/SocketContext";
import { qrScansService } from "@/features/restaurant/qrScans/qrScansService";

function secondsLeft(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

type Props = {
  request: LoyaltyScanRequestItem | null;
  onResolved: (id: string) => void;
};

export function LoyaltyScanApprovalDialog({ request, onResolved }: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [, setNow] = useState(0);
  const remaining = request ? secondsLeft(request.expiresAt) : 0;
  const expired = Boolean(request) && remaining <= 0;

  useEffect(() => {
    if (!request) return;
    setError("");
    setBusy(null);
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [request]);

  useEffect(() => {
    if (!request || secondsLeft(request.expiresAt) > 0) return;
    const timer = window.setTimeout(() => onResolved(request.id), 2500);
    return () => window.clearTimeout(timer);
  }, [request, remaining, onResolved]);

  const customerName = useMemo(() => {
    if (!request) return "";
    return request.user.fullName?.trim() || request.user.email;
  }, [request]);

  const handle = async (action: "approve" | "reject") => {
    if (!request || busy) return;
    setBusy(action);
    setError("");
    try {
      if (action === "approve") {
        await qrScansService.approveScan(request.id);
      } else {
        await qrScansService.rejectScan(request.id);
      }
      onResolved(request.id);
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        t("dashboard.loyaltyScans.actionFailed");
      setError(message);
      if (
        e?.response?.status === 410 ||
        e?.response?.data?.code === "EXPIRED" ||
        e?.response?.data?.code === "ALREADY_RESOLVED" ||
        e?.response?.data?.code === "NOT_FOUND"
      ) {
        onResolved(request.id);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={Boolean(request)} onOpenChange={() => undefined}>
      <DialogContent hideCloseButton className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("dashboard.loyaltyScans.title")}</DialogTitle>
          <DialogDescription>
            {t("dashboard.loyaltyScans.description", {
              name: customerName,
              kind:
                request?.type === "drink"
                  ? t("dashboard.loyaltyScans.drink")
                  : t("dashboard.loyaltyScans.meal"),
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md bg-muted px-3 py-2 text-sm">
          {expired
            ? t("dashboard.loyaltyScans.expired")
            : t("dashboard.loyaltyScans.secondsLeft", { count: remaining })}
        </div>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            disabled={!request || Boolean(busy) || expired}
            onClick={() => void handle("reject")}
          >
            <X className="mr-1 h-4 w-4" />
            {busy === "reject"
              ? t("dashboard.loyaltyScans.rejecting")
              : t("dashboard.loyaltyScans.reject")}
          </Button>
          <Button
            disabled={!request || Boolean(busy) || expired}
            onClick={() => void handle("approve")}
          >
            <Check className="mr-1 h-4 w-4" />
            {busy === "approve"
              ? t("dashboard.loyaltyScans.approving")
              : t("dashboard.loyaltyScans.approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
