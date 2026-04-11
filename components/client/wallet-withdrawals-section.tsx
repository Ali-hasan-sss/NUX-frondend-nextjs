"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { WalletWithdrawalRequestRow } from "@/features/client/wallet/walletTypes";

function withdrawalStatusLabel(t: (k: string) => string, status: string): string {
  switch (status) {
    case "PENDING":
      return t("wallet.withdrawalStatusPending");
    case "COMPLETED":
      return t("wallet.withdrawalStatusCompleted");
    case "REJECTED":
      return t("wallet.withdrawalStatusRejected");
    case "CANCELLED":
      return t("wallet.withdrawalStatusCancelled");
    case "APPROVED":
      return t("wallet.withdrawalStatusApproved");
    default:
      return status;
  }
}

export function WalletWithdrawalsSection(props: {
  items: WalletWithdrawalRequestRow[];
  loading: boolean;
  error: string | null;
  currency: string;
  cancellingId: string | null;
  setCancellingId: (id: string | null) => void;
  onCancelRequest: (id: string) => Promise<void>;
  onRefresh: () => void | Promise<void>;
  /** Themed client area */
  colors?: {
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    primary: string;
    error: string;
  };
}) {
  const { t, i18n } = useTranslation();
  const {
    items,
    loading,
    error,
    currency,
    cancellingId,
    setCancellingId,
    onCancelRequest,
    onRefresh,
    colors,
  } = props;

  const fmtDate = useCallback(
    (iso: string) => {
      try {
        return new Intl.DateTimeFormat(i18n.language, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(iso));
      } catch {
        return iso;
      }
    },
    [i18n.language]
  );

  const handleCancel = async (id: string) => {
    if (!window.confirm(t("wallet.cancelWithdrawalConfirm"))) return;
    setCancellingId(id);
    try {
      await onCancelRequest(id);
      toast.success(t("wallet.withdrawalCancelSuccess"));
      await onRefresh();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t("wallet.withdrawalCancelError");
      toast.error(typeof msg === "string" ? msg : String(msg));
    } finally {
      setCancellingId(null);
    }
  };

  const cardStyle = colors
    ? {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        color: colors.text,
      }
    : undefined;
  const cardClass = colors ? undefined : "bg-card border-border text-foreground";

  return (
    <div className="mb-6">
      <h2
        className={`text-lg font-semibold mb-3 ${!colors ? "text-foreground" : ""}`}
        style={colors ? { color: colors.text } : undefined}
      >
        {t("wallet.withdrawalRequests")}
      </h2>
      {error && (
        <p className="text-sm mb-2" style={colors ? { color: colors.error } : { color: "var(--destructive)" }}>
          {error}
        </p>
      )}
      {loading && items.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={colors ? { color: colors.primary } : undefined}
          />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm py-4" style={colors ? { color: colors.textSecondary } : undefined}>
          {t("wallet.noWithdrawalRequests")}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((row) => (
            <li
              key={row.id}
              className={`rounded-xl p-4 flex flex-col gap-2 border ${cardClass ?? ""}`}
              style={cardStyle}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium" style={colors ? { color: colors.text } : undefined}>
                  {withdrawalStatusLabel(t, row.status)}
                </span>
                <span className="text-sm font-semibold tabular-nums" style={colors ? { color: colors.text } : undefined}>
                  {row.amount} {row.currency || currency}
                </span>
              </div>
              <p className="text-xs" style={colors ? { color: colors.textSecondary } : undefined}>
                {t("wallet.requestedAt")}: {fmtDate(row.createdAt)}
              </p>
              {row.reviewedAt && (
                <p className="text-xs" style={colors ? { color: colors.textSecondary } : undefined}>
                  {t("wallet.reviewedAt")}: {fmtDate(row.reviewedAt)}
                </p>
              )}
              {row.status === "PENDING" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="self-start mt-1"
                  disabled={cancellingId !== null}
                  onClick={() => void handleCancel(row.id)}
                >
                  {cancellingId === row.id ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : null}
                  {t("wallet.cancelWithdrawal")}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
