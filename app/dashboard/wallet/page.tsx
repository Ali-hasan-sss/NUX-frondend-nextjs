"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RestaurantWalletTopUpDialog } from "@/components/restaurant/restaurant-wallet-top-up-dialog";
import { RestaurantWalletWithdrawDialog } from "@/components/restaurant/restaurant-wallet-withdraw-dialog";
import { Wallet, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { walletLedgerTitleKey } from "@/lib/walletLedgerTitle";
import { restaurantWalletService } from "@/features/restaurant/wallet/restaurantWalletService";
import type { WalletBalanceData, WalletLedgerEntry } from "@/features/client/wallet/walletTypes";

const PAGE_TAKE = 20;

function RestaurantWalletPageContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [balance, setBalance] = useState<WalletBalanceData | null>(null);
  const [transactions, setTransactions] = useState<WalletLedgerEntry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorBalance, setErrorBalance] = useState<string | null>(null);
  const [errorTx, setErrorTx] = useState<string | null>(null);

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const loadBalance = useCallback(async () => {
    setLoadingBalance(true);
    setErrorBalance(null);
    try {
      const b = await restaurantWalletService.getBalance();
      setBalance(b);
    } catch {
      setErrorBalance(t("dashboard.wallet.loadError"));
    } finally {
      setLoadingBalance(false);
    }
  }, [t]);

  const loadTransactions = useCallback(
    async (opts: { append: boolean; nextCursor?: string | null }) => {
      setLoadingTx(true);
      setErrorTx(null);
      try {
        const items = await restaurantWalletService.getTransactions(
          PAGE_TAKE,
          opts.append && opts.nextCursor ? opts.nextCursor : undefined
        );
        if (opts.append) {
          setTransactions((prev) => [...prev, ...items]);
        } else {
          setTransactions(items);
        }
        if (items.length > 0) {
          const last = items[items.length - 1];
          setCursor(last.id);
        }
        setHasMore(items.length >= PAGE_TAKE);
      } catch {
        setErrorTx(t("dashboard.wallet.transactionsError"));
      } finally {
        setLoadingTx(false);
      }
    },
    [t]
  );

  const refreshAll = useCallback(async () => {
    await loadBalance();
    await loadTransactions({ append: false });
  }, [loadBalance, loadTransactions]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    const pi = searchParams.get("payment_intent");
    if (!pi) return;
    let cancelled = false;
    void (async () => {
      try {
        await restaurantWalletService.syncTopUpAfterPayment(pi);
      } catch {
        /* webhook may still apply */
      }
      if (!cancelled) {
        await refreshAll();
        router.replace("/dashboard/wallet");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, refreshAll]);

  const loadMore = () => {
    if (!hasMore || loadingTx || !cursor) return;
    void loadTransactions({ append: true, nextCursor: cursor });
  };

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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard.sidebar.wallet")}</h1>
        <p className="text-muted-foreground">{t("dashboard.wallet.pageDescription")}</p>
        <p className="text-sm text-muted-foreground">{t("dashboard.wallet.activityHint")}</p>
      </div>

      <div
        className={cn(
          "rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5 shadow-sm flex items-start gap-4"
        )}
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
          <Wallet className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{t("dashboard.wallet.balance")}</p>
          {loadingBalance && !balance ? (
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          ) : errorBalance ? (
            <p className="text-sm text-destructive">{errorBalance}</p>
          ) : (
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {balance?.balance ?? "—"} {balance?.currency ?? "EUR"}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setTopUpOpen(true)}>
              {t("wallet.addFunds")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setWithdrawOpen(true)}>
              {t("wallet.requestWithdrawal")}
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={loadingBalance} onClick={() => void loadBalance()}>
              {t("dashboard.wallet.refresh")}
            </Button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("wallet.transactions")}</h2>
      </div>

      {errorTx && <p className="text-sm text-destructive">{errorTx}</p>}

      {loadingTx && transactions.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("wallet.noTransactions")}</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => {
            const isCredit = tx.type === "CREDIT";
            const titleKey = walletLedgerTitleKey(tx.type, tx.source, "restaurant");
            return (
              <li
                key={tx.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isCredit ? "bg-emerald-500/15" : "bg-destructive/10"
                  )}
                >
                  {isCredit ? (
                    <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {titleKey ? t(titleKey) : isCredit ? t("wallet.credit") : t("wallet.debit")}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        isCredit ? "text-emerald-600" : "text-destructive"
                      )}
                    >
                      {isCredit ? "+" : "-"}
                      {tx.amount} {balance?.currency ?? "EUR"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDate(tx.createdAt)}</p>
                  {!titleKey && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("wallet.source")}: {tx.source}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && transactions.length > 0 && (
        <Button type="button" variant="outline" className="w-full" disabled={loadingTx} onClick={loadMore}>
          {loadingTx ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {t("wallet.loadMore")}
        </Button>
      )}

      <RestaurantWalletTopUpDialog
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        onCompleted={() => void refreshAll()}
      />
      <RestaurantWalletWithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        currency={balance?.currency ?? "EUR"}
        onCompleted={() => void refreshAll()}
      />
    </div>
  );
}

export default function RestaurantWalletPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RestaurantWalletPageContent />
    </Suspense>
  );
}
