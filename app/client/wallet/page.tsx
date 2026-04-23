"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchWalletBalance,
  fetchWalletTransactions,
  resetWalletTransactions,
  syncWalletTopUpAfterPayment,
} from "@/features/client";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import { Button } from "@/components/ui/button";
import { WalletTopUpDialog } from "@/components/client/wallet-top-up-dialog";
import { Wallet, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { walletLedgerTitleKey } from "@/lib/walletLedgerTitle";

function WalletPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();
  const { colors, mounted } = useClientTheme();
  const { user } = useAppSelector((s) => s.auth);
  const {
    balance,
    transactions,
    transactionsCursor,
    hasMoreTransactions,
    loading,
    error,
  } = useAppSelector((s) => s.clientWallet);

  const [topUpOpen, setTopUpOpen] = useState(false);

  const refreshLists = useCallback(() => {
    dispatch(fetchWalletBalance());
    dispatch(resetWalletTransactions());
    dispatch(fetchWalletTransactions({ take: 20, append: false }));
  }, [dispatch]);

  useEffect(() => {
    if (user?.role === "USER") {
      refreshLists();
    }
  }, [user?.role, refreshLists]);

  useEffect(() => {
    const pi = searchParams.get("payment_intent");
    if (!pi || user?.role !== "USER") return;
    let cancelled = false;
    void (async () => {
      await dispatch(syncWalletTopUpAfterPayment(pi));
      if (!cancelled) {
        refreshLists();
        router.replace("/client/wallet");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, refreshLists, dispatch, user?.role]);

  const loadMore = () => {
    if (!hasMoreTransactions || loading.transactions || !transactionsCursor) return;
    dispatch(
      fetchWalletTransactions({
        take: 20,
        cursor: transactionsCursor,
        append: true,
      })
    );
  };

  if (!mounted) return null;

  if (user?.role !== "USER") {
    return (
      <div className="min-h-screen pb-20 px-5 py-5">
        <p style={{ color: colors.textSecondary }}>{t("home.errorLoadingData")}</p>
      </div>
    );
  }

  const fmtDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 px-5 py-5">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          {t("wallet.title")}
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {t("wallet.subtitle")}
        </p>
      </div>

      <div
        className={cn("rounded-2xl p-5 mb-6 shadow-lg flex items-start gap-4")}
        style={{ backgroundColor: colors.surface }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${colors.primary}25` }}
        >
          <Wallet className="h-7 w-7" style={{ color: colors.primary }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
            {t("wallet.balance")}
          </p>
          {loading.balance && !balance ? (
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.primary }} />
          ) : error.balance ? (
            <p className="text-sm" style={{ color: colors.error }}>
              {error.balance}
            </p>
          ) : (
            <p className="text-3xl font-bold tabular-nums" style={{ color: colors.text }}>
              {balance?.balance ?? "—"} {balance?.currency ?? "EUR"}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              type="button"
              size="sm"
              onClick={() => setTopUpOpen(true)}
              style={{ backgroundColor: colors.primary, color: "#fff" }}
            >
              {t("wallet.addFunds")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
          {t("wallet.transactions")}
        </h2>
      </div>

      {error.transactions && (
        <p className="text-sm mb-3" style={{ color: colors.error }}>
          {error.transactions}
        </p>
      )}

      {loading.transactions && transactions.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.primary }} />
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm py-8 text-center" style={{ color: colors.textSecondary }}>
          {t("wallet.noTransactions")}
        </p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => {
            const isCredit = tx.type === "CREDIT";
            const titleKey = walletLedgerTitleKey(tx.type, tx.source, "user");
            return (
              <li
                key={tx.id}
                className="rounded-xl p-4 flex gap-3 items-start"
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isCredit ? `${colors.success}22` : `${colors.error}22`,
                  }}
                >
                  {isCredit ? (
                    <ArrowDownLeft className="h-5 w-5" style={{ color: colors.success }} />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" style={{ color: colors.error }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2 items-baseline">
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      {titleKey ? t(titleKey) : isCredit ? t("wallet.credit") : t("wallet.debit")}
                    </span>
                    <span
                      className="text-sm font-semibold tabular-nums shrink-0"
                      style={{ color: isCredit ? colors.success : colors.error }}
                    >
                      {isCredit ? "+" : "-"}
                      {tx.amount} {balance?.currency ?? "EUR"}
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                    {fmtDate(tx.createdAt)}
                  </p>
                  {!titleKey && (
                    <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                      {t("wallet.source")}: {tx.source}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasMoreTransactions && transactions.length > 0 && (
        <Button
          type="button"
          variant="outline"
          className="w-full mt-4"
          disabled={loading.transactions}
          onClick={loadMore}
        >
          {loading.transactions ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {t("wallet.loadMore")}
        </Button>
      )}

      <WalletTopUpDialog open={topUpOpen} onOpenChange={setTopUpOpen} />
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center pb-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <WalletPageContent />
    </Suspense>
  );
}
