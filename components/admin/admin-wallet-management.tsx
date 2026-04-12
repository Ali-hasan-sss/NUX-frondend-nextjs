"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@/hooks/use-language";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  RefreshCw,
  Wallet,
  Check,
  X,
  Users,
  Store,
  CheckCircle2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  adminWalletService,
  type AdminRestaurantWalletDetail,
  type AdminUserWalletDetail,
  type AdminWalletOverview,
  type AdminWalletOverviewCurrency,
  type AdminWalletSelectRestaurantItem,
  type AdminWalletSelectUserItem,
  type AdminWalletWithdrawalRow,
} from "@/features/admin/wallet/adminWalletService";

const PAGE_SIZE = 25;

const walletSelectClassName = cn(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
  "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
);

function formatUserPickLabel(u: AdminWalletSelectUserItem) {
  return u.fullName?.trim() ? `${u.fullName.trim()} · ${u.email}` : u.email;
}

function formatRestaurantPickLabel(r: AdminWalletSelectRestaurantItem) {
  return `${r.name} · ${r.ownerEmail}`;
}

/** Search + results in one control; opens automatically when there is text and results (or no-results) return from the API. */
function WalletPickerCombobox<T extends { id: string }>({
  inputId,
  label,
  placeholder,
  search,
  onSearchChange,
  options,
  loading,
  value,
  onValueChange,
  getOptionLabel,
  noResultsLabel,
  clearLabel,
  loadingLabel,
}: {
  inputId: string;
  label: string;
  placeholder: string;
  search: string;
  onSearchChange: (v: string) => void;
  options: T[];
  loading: boolean;
  value: string;
  onValueChange: (id: string) => void;
  getOptionLabel: (item: T) => string;
  noResultsLabel: string;
  clearLabel: string;
  loadingLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (search.trim().length > 0) {
      setOpen(true);
    }
  }, [loading, search, options.length]);

  useEffect(() => {
    if (!search.trim()) {
      setOpen(false);
    }
  }, [search]);

  const selected = value ? options.find((o) => o.id === value) : undefined;
  const selectedLabel = selected
    ? getOptionLabel(selected)
    : value || undefined;

  const showPanel =
    open && (search.trim().length > 0 || loading || options.length > 0);

  return (
    <div className="space-y-1">
      <Label htmlFor={inputId} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <div
          className={cn(
            "rounded-md border border-input bg-background shadow-sm overflow-hidden",
            open && "ring-2 ring-ring ring-offset-2 ring-offset-background",
          )}
        >
          <div className="relative">
            <Input
              id={inputId}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${inputId}-listbox`}
              value={search}
              onChange={(e) => {
                const next = e.target.value;
                if (value) onValueChange("");
                onSearchChange(next);
              }}
              onFocus={() => {
                if (search.trim().length > 0 || options.length > 0) {
                  setOpen(true);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => setOpen(false), 160);
              }}
              placeholder={placeholder}
              className="border-0 rounded-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-10 bg-transparent"
              autoComplete="off"
            />
            {loading ? (
              <span className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2">
                <Loader2
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  aria-hidden
                />
              </span>
            ) : null}
          </div>

          {value ? (
            <div className="flex items-center justify-between gap-2 border-t border-border px-2 py-1.5 text-xs bg-muted/25">
              <span
                className="truncate text-foreground/90"
                title={selectedLabel}
              >
                {selectedLabel}
              </span>
              <button
                type="button"
                className="shrink-0 rounded px-1.5 py-0.5 text-primary hover:underline"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onValueChange("")}
              >
                {clearLabel}
              </button>
            </div>
          ) : null}
        </div>

        {showPanel ? (
          <ul
            id={`${inputId}-listbox`}
            role="listbox"
            className={cn(
              "absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-border bg-popover py-1 text-sm shadow-md",
              "text-popover-foreground",
            )}
          >
            {loading && options.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <Loader2
                  className="h-3.5 w-3.5 animate-spin shrink-0"
                  aria-hidden
                />
                {loadingLabel}
              </li>
            ) : null}
            {!loading && search.trim().length > 0 && options.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-foreground">
                {noResultsLabel}
              </li>
            ) : null}
            {!loading && options.length > 0
              ? options.map((item) => (
                  <li key={item.id} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={item.id === value}
                      className={cn(
                        "w-full text-start px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                        item.id === value && "bg-accent/40",
                      )}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onValueChange(item.id);
                        onSearchChange("");
                        setOpen(false);
                      }}
                    >
                      {getOptionLabel(item)}
                    </button>
                  </li>
                ))
              : null}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

type WithdrawalFilter =
  | "ALL"
  | "PENDING"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

function accountInfoSummary(info: Record<string, unknown> | null): string {
  if (!info || typeof info !== "object") return "—";
  const iban = info.iban ?? info.IBAN;
  const holder = info.accountHolder ?? info.accountHolderName ?? info.holder;
  const parts: string[] = [];
  if (typeof holder === "string" && holder) parts.push(holder);
  if (typeof iban === "string" && iban) parts.push(iban);
  return parts.length ? parts.join(" · ") : JSON.stringify(info);
}

const localeForDate: Record<string, string> = {
  en: "en-GB",
  ar: "ar",
  de: "de-DE",
};

function ReconBadge({
  ok,
  labelOk,
  labelBad,
}: {
  ok: boolean;
  labelOk: string;
  labelBad: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0",
        ok
          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
          : "bg-destructive/15 text-destructive",
      )}
    >
      {ok ? (
        <CheckCircle2 className="h-3 w-3" aria-hidden />
      ) : (
        <X className="h-3 w-3" aria-hidden />
      )}
      {ok ? labelOk : labelBad}
    </span>
  );
}

function Money({ amount, ccy }: { amount: string; ccy: string }) {
  return (
    <span className="tabular-nums font-semibold tracking-tight">
      {amount}
      <span className="text-muted-foreground font-medium ms-1 text-[0.92em]">
        {ccy}
      </span>
    </span>
  );
}

function StatRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-end shrink-0">{children}</div>
    </div>
  );
}

function Kpi({
  label,
  amount,
  ccy,
  accent,
}: {
  label: string;
  amount: string;
  ccy: string;
  accent?: "in" | "out" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 text-center shadow-sm",
        accent === "in" && "border-emerald-500/20 bg-emerald-500/[0.06]",
        accent === "out" && "border-amber-500/20 bg-amber-500/[0.06]",
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground leading-none mb-1.5">
        {label}
      </p>
      <p className="text-lg font-bold tabular-nums leading-tight">
        {amount}{" "}
        <span className="text-xs font-semibold text-muted-foreground">
          {ccy}
        </span>
      </p>
    </div>
  );
}

function statusLabel(
  t: (k: import("@/lib/translations").TranslationKey) => string,
  status: string,
) {
  switch (status) {
    case "PENDING":
      return t("adminWalletStatusPending");
    case "COMPLETED":
      return t("adminWalletStatusCompleted");
    case "REJECTED":
      return t("adminWalletStatusRejected");
    case "CANCELLED":
      return t("adminWalletStatusCancelled");
    default:
      return status;
  }
}

function CurrencyOverviewCard({
  row,
  t,
}: {
  row: AdminWalletOverviewCurrency;
  t: (k: import("@/lib/translations").TranslationKey) => string;
}) {
  const ccy = row.currency;
  const delta = (d: string, ok: boolean) =>
    ok ? null : (
      <span className="text-[10px] text-destructive ms-1 tabular-nums">
        Δ{d}
      </span>
    );

  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden ring-1 ring-black/[0.03] dark:ring-white/[0.06]">
      <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent px-4 py-3 border-b border-border/60">
        <span className="text-xl font-bold tracking-tight tabular-nums">
          {ccy}
        </span>
      </div>

      <div className="p-4 md:p-5 grid md:grid-cols-2 gap-5 md:gap-6">
        {/* Users */}
        <div className="space-y-3 rounded-xl border border-sky-500/15 bg-sky-500/[0.03] p-4 dark:bg-sky-500/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-400">
                <Users className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight truncate">
                  {t("adminWalletSectionUsers")}
                </h3>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  ×{row.walletCount}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              <span
                className="flex items-center gap-1"
                title={t("adminWalletLedgerDelta")}
              >
                <ReconBadge
                  ok={row.ledgerReconciliationOk}
                  labelOk={t("adminWalletReconOk")}
                  labelBad={t("adminWalletReconIssue")}
                />
              </span>
              <span
                className="flex items-center gap-1"
                title={t("adminWalletWithdrawalReconDelta")}
              >
                <ReconBadge
                  ok={row.withdrawalReconciliationOk}
                  labelOk={t("adminWalletReconOk")}
                  labelBad={t("adminWalletReconIssue")}
                />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Kpi
              label={t("adminWalletActualBalanceInWallets")}
              amount={row.totalBalance}
              ccy={ccy}
            />
            <Kpi
              label={t("adminWalletTotalDepositsLabel")}
              amount={row.totalCredits}
              ccy={ccy}
              accent="in"
            />
            <Kpi
              label={t("adminWalletTotalWithdrawalsLabel")}
              amount={row.completedUserWithdrawalsSum}
              ccy={ccy}
              accent="out"
            />
          </div>

          <div className="rounded-lg bg-background/60 border border-border/50 px-2.5 py-0.5">
            <StatRow label={t("adminWalletDebits")}>
              <Money amount={row.totalDebits} ccy={ccy} />
            </StatRow>
            <StatRow label={t("adminWalletOtherDebitsLabel")}>
              <Money amount={row.otherDebitsFromLedgerSum} ccy={ccy} />
            </StatRow>
            <StatRow label={t("adminWalletNetFromLedger")}>
              <span className="tabular-nums font-medium">
                {row.netFromLedger}{" "}
                <span className="text-muted-foreground text-xs">{ccy}</span>
                {delta(
                  row.ledgerReconciliationDelta,
                  row.ledgerReconciliationOk,
                )}
              </span>
            </StatRow>
            <StatRow label={t("adminWalletWithdrawalLedgerDebits")}>
              <span className="tabular-nums font-medium">
                {row.userWithdrawalDebitsFromLedgerSum}{" "}
                <span className="text-muted-foreground text-xs">{ccy}</span>
                {delta(
                  row.withdrawalReconciliationDelta,
                  row.withdrawalReconciliationOk,
                )}
              </span>
            </StatRow>
            <StatRow label={t("adminWalletPendingUserTotal")}>
              <Money amount={row.pendingUserWithdrawalsTotal} ccy={ccy} />
            </StatRow>
          </div>
        </div>

        {/* Restaurants */}
        <div className="space-y-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] p-4 dark:bg-amber-500/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-400">
                <Store className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight truncate">
                  {t("adminWalletSectionRestaurants")}
                </h3>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  ×{row.restaurantWalletCount}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              <span title={t("adminWalletRestaurantLedgerReconShort")}>
                <ReconBadge
                  ok={row.restaurantLedgerReconciliationOk}
                  labelOk={t("adminWalletReconOk")}
                  labelBad={t("adminWalletReconIssue")}
                />
              </span>
              <span title={t("adminWalletRestaurantWithdrawalReconShort")}>
                <ReconBadge
                  ok={row.restaurantWithdrawalReconciliationOk}
                  labelOk={t("adminWalletReconOk")}
                  labelBad={t("adminWalletReconIssue")}
                />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Kpi
              label={t("adminWalletRestaurantActualBalanceInWallets")}
              amount={row.restaurantTotalBalance}
              ccy={ccy}
            />
            <Kpi
              label={t("adminWalletRestaurantDepositsLabel")}
              amount={row.restaurantTotalCredits}
              ccy={ccy}
              accent="in"
            />
            <Kpi
              label={t("adminWalletRestaurantWithdrawalsCompleted")}
              amount={row.completedRestaurantWithdrawalsSum}
              ccy={ccy}
              accent="out"
            />
          </div>

          <div className="rounded-lg bg-background/60 border border-border/50 px-2.5 py-0.5">
            <StatRow label={t("adminWalletRestaurantDebitsAll")}>
              <Money amount={row.restaurantTotalDebits} ccy={ccy} />
            </StatRow>
            <StatRow label={t("adminWalletRestaurantOtherDebitsLabel")}>
              <Money
                amount={row.restaurantOtherDebitsFromLedgerSum}
                ccy={ccy}
              />
            </StatRow>
            <StatRow label={t("adminWalletRestaurantNetFromLedger")}>
              <span className="tabular-nums font-medium">
                {row.restaurantNetFromLedger}{" "}
                <span className="text-muted-foreground text-xs">{ccy}</span>
                {delta(
                  row.restaurantLedgerReconciliationDelta,
                  row.restaurantLedgerReconciliationOk,
                )}
              </span>
            </StatRow>
            <StatRow label={t("adminWalletWithdrawalLedgerDebits")}>
              <span className="tabular-nums font-medium">
                {row.restaurantWithdrawalDebitsFromLedgerSum}{" "}
                <span className="text-muted-foreground text-xs">{ccy}</span>
                {delta(
                  row.restaurantWithdrawalReconciliationDelta,
                  row.restaurantWithdrawalReconciliationOk,
                )}
              </span>
            </StatRow>
            <StatRow label={t("adminWalletPendingRestaurantTotal")}>
              <Money amount={row.pendingRestaurantWithdrawalsTotal} ccy={ccy} />
            </StatRow>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminWalletManagement() {
  const { t, locale } = useLanguage();
  const dateLocale = localeForDate[locale] ?? "en-GB";
  const [overview, setOverview] = useState<AdminWalletOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<AdminWalletWithdrawalRow[]>(
    [],
  );
  const [wdTotal, setWdTotal] = useState(0);
  const [wdSkip, setWdSkip] = useState(0);
  const [wdFilter, setWdFilter] = useState<WithdrawalFilter>("ALL");
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [lookupUserSearch, setLookupUserSearch] = useState("");
  const [lookupUserPickOptions, setLookupUserPickOptions] = useState<
    AdminWalletSelectUserItem[]
  >([]);
  const [lookupUserPickLoading, setLookupUserPickLoading] = useState(false);
  const [debitUserSearch, setDebitUserSearch] = useState("");
  const [debitUserPickOptions, setDebitUserPickOptions] = useState<
    AdminWalletSelectUserItem[]
  >([]);
  const [debitUserPickLoading, setDebitUserPickLoading] = useState(false);
  const [lookupUserId, setLookupUserId] = useState("");
  const [userWalletDetail, setUserWalletDetail] =
    useState<AdminUserWalletDetail | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);

  const [lookupRestaurantSearch, setLookupRestaurantSearch] = useState("");
  const [lookupRestaurantPickOptions, setLookupRestaurantPickOptions] =
    useState<AdminWalletSelectRestaurantItem[]>([]);
  const [lookupRestaurantPickLoading, setLookupRestaurantPickLoading] =
    useState(false);
  const [debitRestaurantSearch, setDebitRestaurantSearch] = useState("");
  const [debitRestaurantPickOptions, setDebitRestaurantPickOptions] = useState<
    AdminWalletSelectRestaurantItem[]
  >([]);
  const [debitRestaurantPickLoading, setDebitRestaurantPickLoading] =
    useState(false);
  const [lookupRestaurantId, setLookupRestaurantId] = useState("");
  const [restaurantWalletDetail, setRestaurantWalletDetail] =
    useState<AdminRestaurantWalletDetail | null>(null);
  const [restaurantDetailLoading, setRestaurantDetailLoading] = useState(false);

  const [debitOwnerType, setDebitOwnerType] = useState<"USER" | "RESTAURANT">(
    "USER",
  );
  const [debitUserId, setDebitUserId] = useState("");
  const [debitRestaurantId, setDebitRestaurantId] = useState("");
  const [debitAmount, setDebitAmount] = useState("");
  const [debitCurrency, setDebitCurrency] = useState("EUR");
  const [debitNote, setDebitNote] = useState("");
  const [debitIdempotency, setDebitIdempotency] = useState("");
  const [debitLoading, setDebitLoading] = useState(false);

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const ov = await adminWalletService.getOverview();
      setOverview(ov);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (e as { message?: string })?.message ||
        t("adminWalletError");
      setError(typeof msg === "string" ? msg : t("adminWalletError"));
    } finally {
      setOverviewLoading(false);
    }
  }, [t]);

  const fetchWithdrawals = useCallback(async () => {
    setTableLoading(true);
    try {
      const { items, total } = await adminWalletService.listWithdrawals({
        status: wdFilter,
        skip: wdSkip,
        take: PAGE_SIZE,
      });
      setWithdrawals(items);
      setWdTotal(total);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (e as { message?: string })?.message ||
        t("adminWalletError");
      setError(typeof msg === "string" ? msg : t("adminWalletError"));
    } finally {
      setTableLoading(false);
    }
  }, [t, wdFilter, wdSkip]);

  const refreshAll = useCallback(async () => {
    setError(null);
    await Promise.all([fetchOverview(), fetchWithdrawals()]);
  }, [fetchOverview, fetchWithdrawals]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    void fetchWithdrawals();
  }, [fetchWithdrawals]);

  useEffect(() => {
    let cancelled = false;
    const h = setTimeout(() => {
      void (async () => {
        setLookupUserPickLoading(true);
        try {
          const { items } = await adminWalletService.listWalletSelectUsers({
            search: lookupUserSearch.trim() || undefined,
            take: 200,
          });
          if (!cancelled) setLookupUserPickOptions(items);
        } catch {
          if (!cancelled) setLookupUserPickOptions([]);
        } finally {
          if (!cancelled) setLookupUserPickLoading(false);
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [lookupUserSearch]);

  useEffect(() => {
    let cancelled = false;
    const h = setTimeout(() => {
      void (async () => {
        setDebitUserPickLoading(true);
        try {
          const { items } = await adminWalletService.listWalletSelectUsers({
            search: debitUserSearch.trim() || undefined,
            take: 200,
          });
          if (!cancelled) setDebitUserPickOptions(items);
        } catch {
          if (!cancelled) setDebitUserPickOptions([]);
        } finally {
          if (!cancelled) setDebitUserPickLoading(false);
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [debitUserSearch]);

  useEffect(() => {
    let cancelled = false;
    const h = setTimeout(() => {
      void (async () => {
        setLookupRestaurantPickLoading(true);
        try {
          const { items } =
            await adminWalletService.listWalletSelectRestaurants({
              search: lookupRestaurantSearch.trim() || undefined,
              take: 200,
            });
          if (!cancelled) setLookupRestaurantPickOptions(items);
        } catch {
          if (!cancelled) setLookupRestaurantPickOptions([]);
        } finally {
          if (!cancelled) setLookupRestaurantPickLoading(false);
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [lookupRestaurantSearch]);

  useEffect(() => {
    let cancelled = false;
    const h = setTimeout(() => {
      void (async () => {
        setDebitRestaurantPickLoading(true);
        try {
          const { items } =
            await adminWalletService.listWalletSelectRestaurants({
              search: debitRestaurantSearch.trim() || undefined,
              take: 200,
            });
          if (!cancelled) setDebitRestaurantPickOptions(items);
        } catch {
          if (!cancelled) setDebitRestaurantPickOptions([]);
        } finally {
          if (!cancelled) setDebitRestaurantPickLoading(false);
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(h);
    };
  }, [debitRestaurantSearch]);

  const loadUserWalletDetailById = useCallback(
    async (id: string) => {
      const trimmed = id.trim();
      if (!trimmed) return;
      setUserDetailLoading(true);
      setUserWalletDetail(null);
      try {
        const d = await adminWalletService.getUserWalletDetail(trimmed);
        setUserWalletDetail(d);
      } catch {
        toast.error(t("adminWalletDetailLoadError"));
      } finally {
        setUserDetailLoading(false);
      }
    },
    [t],
  );

  const loadRestaurantWalletDetailById = useCallback(
    async (id: string) => {
      const trimmed = id.trim();
      if (!trimmed) return;
      setRestaurantDetailLoading(true);
      setRestaurantWalletDetail(null);
      try {
        const d = await adminWalletService.getRestaurantWalletDetail(trimmed);
        setRestaurantWalletDetail(d);
      } catch {
        toast.error(t("adminWalletDetailLoadError"));
      } finally {
        setRestaurantDetailLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (!lookupUserId) {
      setUserWalletDetail(null);
      return;
    }
    void loadUserWalletDetailById(lookupUserId);
  }, [lookupUserId, loadUserWalletDetailById]);

  useEffect(() => {
    if (!lookupRestaurantId) {
      setRestaurantWalletDetail(null);
      return;
    }
    void loadRestaurantWalletDetailById(lookupRestaurantId);
  }, [lookupRestaurantId, loadRestaurantWalletDetailById]);

  const fmtWhen = (iso: string | null) =>
    iso ? formatDate(iso, dateLocale) : "—";

  const onApprove = async (id: string) => {
    setActionId(id);
    try {
      await adminWalletService.approveWithdrawal(id);
      await refreshAll();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("adminWalletError");
      setError(typeof msg === "string" ? msg : String(msg));
    } finally {
      setActionId(null);
    }
  };

  const openReject = (id: string) => {
    setRejectTargetId(id);
    setRejectReason("");
    setRejectOpen(true);
  };

  const submitReject = async () => {
    if (!rejectTargetId) return;
    if (!rejectReason.trim()) {
      setError(t("adminWalletRejectReasonRequired"));
      return;
    }
    setActionId(rejectTargetId);
    try {
      await adminWalletService.rejectWithdrawal(rejectTargetId, rejectReason);
      setRejectOpen(false);
      setRejectTargetId(null);
      await refreshAll();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("adminWalletError");
      setError(typeof msg === "string" ? msg : String(msg));
    } finally {
      setActionId(null);
    }
  };

  const requesterLabel = (row: AdminWalletWithdrawalRow) => {
    if (row.user) {
      return row.user.fullName || row.user.email || row.user.id;
    }
    if (row.restaurant) {
      const owner = row.restaurant.owner;
      const ownerLabel = owner?.fullName || owner?.email || "";
      return `${row.restaurant.name}${ownerLabel ? ` (${ownerLabel})` : ""}`;
    }
    return "—";
  };

  const onFilterChange = (value: WithdrawalFilter) => {
    setWdFilter(value);
    setWdSkip(0);
  };

  const submitManualDebit = async () => {
    const ownerId =
      debitOwnerType === "USER" ? debitUserId.trim() : debitRestaurantId.trim();
    const n = parseFloat(debitAmount);
    if (!ownerId || !Number.isFinite(n) || n <= 0) return;
    setDebitLoading(true);
    try {
      const out = await adminWalletService.manualWalletDebit({
        ownerType: debitOwnerType,
        ownerId,
        amount: n,
        currency: debitCurrency.trim() || "EUR",
        ...(debitNote.trim() ? { note: debitNote.trim() } : {}),
        ...(debitIdempotency.trim().length >= 8
          ? { idempotencyKey: debitIdempotency.trim() }
          : {}),
      });
      toast.success(
        t("adminWalletDebitSuccess")
          .replace("{{balance}}", out.availableBalanceAfter)
          .replace("{{currency}}", out.currency),
      );
      setDebitAmount("");
      setDebitNote("");
      setDebitIdempotency("");
      await refreshAll();
      if (debitOwnerType === "USER" && lookupUserId.trim() === ownerId) {
        await loadUserWalletDetailById(ownerId);
      }
      if (
        debitOwnerType === "RESTAURANT" &&
        lookupRestaurantId.trim() === ownerId
      ) {
        await loadRestaurantWalletDetailById(ownerId);
      }
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("adminWalletError");
      toast.error(typeof msg === "string" ? msg : String(msg));
    } finally {
      setDebitLoading(false);
    }
  };

  const busy = overviewLoading && tableLoading;
  const from = wdTotal === 0 ? 0 : wdSkip + 1;
  const to = Math.min(wdSkip + withdrawals.length, wdTotal);
  const paginationLabel = t("adminWalletPaginationSummary")
    .replace("{{from}}", String(from))
    .replace("{{to}}", String(to))
    .replace("{{total}}", String(wdTotal));

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("adminWalletTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("adminWalletDescriptionShort")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void refreshAll()}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t("adminWalletRefresh")}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" />
            {t("adminWalletTotalsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {overviewLoading && !overview ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !overview?.byCurrency?.length ? (
            <p className="text-sm text-muted-foreground">
              {t("adminWalletNoWallets")}
            </p>
          ) : (
            <div className="grid gap-5 max-w-5xl mx-auto">
              {overview.byCurrency.map((row) => (
                <CurrencyOverviewCard key={row.currency} row={row} t={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between space-y-0">
          <div>
            <CardTitle>{t("adminWalletWithdrawalsTitle")}</CardTitle>
            <CardDescription>{t("adminWalletWithdrawalsHint")}</CardDescription>
          </div>
          <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[200px]">
            <Label
              htmlFor="wd-status"
              className="text-xs text-muted-foreground"
            >
              {t("adminWalletFilterStatus")}
            </Label>
            <select
              id="wd-status"
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              value={wdFilter}
              onChange={(e) =>
                onFilterChange(e.target.value as WithdrawalFilter)
              }
            >
              <option value="ALL">{t("adminWalletStatusAll")}</option>
              <option value="PENDING">{t("adminWalletStatusPending")}</option>
              <option value="COMPLETED">
                {t("adminWalletStatusCompleted")}
              </option>
              <option value="REJECTED">{t("adminWalletStatusRejected")}</option>
              <option value="CANCELLED">
                {t("adminWalletStatusCancelled")}
              </option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tableLoading && withdrawals.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {t("adminWalletNoWithdrawals")}
            </p>
          ) : (
            <div className="rounded-md border overflow-x-auto relative">
              {tableLoading ? (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : null}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("adminWalletRequester")}</TableHead>
                    <TableHead>{t("adminWalletStatusColumn")}</TableHead>
                    <TableHead>{t("adminWalletAmount")}</TableHead>
                    <TableHead>{t("adminWalletPayoutDetails")}</TableHead>
                    <TableHead>{t("adminWalletCreatedAt")}</TableHead>
                    <TableHead>{t("adminWalletReviewedAt")}</TableHead>
                    <TableHead className="text-end w-[200px]">
                      {t("adminWalletActions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium max-w-[200px]">
                        <span className="line-clamp-2">
                          {requesterLabel(row)}
                        </span>
                        {row.user && (
                          <span className="block text-xs text-muted-foreground truncate">
                            {t("adminWalletTypeUser")}
                          </span>
                        )}
                        {row.restaurant && !row.user && (
                          <span className="block text-xs text-muted-foreground truncate">
                            {t("adminWalletTypeRestaurant")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {statusLabel(t, row.status)}
                      </TableCell>
                      <TableCell className="tabular-nums whitespace-nowrap">
                        {row.amount} {row.currency}
                      </TableCell>
                      <TableCell className="max-w-[220px] text-sm text-muted-foreground">
                        <span className="line-clamp-3">
                          {accountInfoSummary(row.accountInfo)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {fmtWhen(row.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {fmtWhen(row.reviewedAt)}
                      </TableCell>
                      <TableCell className="text-end">
                        {row.status === "PENDING" ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              size="sm"
                              className="gap-1"
                              disabled={actionId !== null}
                              onClick={() => void onApprove(row.id)}
                            >
                              {actionId === row.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              {t("adminWalletApprove")}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              disabled={actionId !== null}
                              onClick={() => openReject(row.id)}
                            >
                              <X className="h-3 w-3" />
                              {t("adminWalletReject")}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {wdTotal > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>{paginationLabel}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={wdSkip <= 0 || tableLoading}
                  onClick={() => setWdSkip((s) => Math.max(0, s - PAGE_SIZE))}
                >
                  {t("adminWalletPaginationPrev")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={wdSkip + PAGE_SIZE >= wdTotal || tableLoading}
                  onClick={() => setWdSkip((s) => s + PAGE_SIZE)}
                >
                  {t("adminWalletPaginationNext")}
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {t("adminWalletToolsTitle")}
          </CardTitle>
          <CardDescription>{t("adminWalletToolsHint")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-border/80 p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t("adminWalletLookupUserTitle")}
              </h3>
              <div className="space-y-2">
                <WalletPickerCombobox<AdminWalletSelectUserItem>
                  inputId="wallet-lookup-user"
                  label={t("adminWalletSelectUserPrompt")}
                  placeholder={t("adminWalletSearchUsers")}
                  search={lookupUserSearch}
                  onSearchChange={setLookupUserSearch}
                  options={lookupUserPickOptions}
                  loading={lookupUserPickLoading}
                  value={lookupUserId}
                  onValueChange={setLookupUserId}
                  getOptionLabel={formatUserPickLabel}
                  noResultsLabel={t("adminWalletSearchNoResults")}
                  clearLabel={t("adminWalletClearSelection")}
                  loadingLabel={t("adminWalletOptionsLoading")}
                />
                {userDetailLoading && lookupUserId ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin shrink-0"
                      aria-hidden
                    />
                    {t("adminWalletOptionsLoading")}
                  </p>
                ) : null}
              </div>
              {userWalletDetail ? (
                <div className="text-sm space-y-2 pt-2 border-t border-border/60">
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletUserEmail")}:{" "}
                    </span>
                    {userWalletDetail.user.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletUserName")}:{" "}
                    </span>
                    {userWalletDetail.user.fullName ?? "—"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletUserRole")}:{" "}
                    </span>
                    {userWalletDetail.user.role}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletUserActive")}:{" "}
                    </span>
                    {userWalletDetail.user.isActive
                      ? t("adminWalletYes")
                      : t("adminWalletNo")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtWhen(userWalletDetail.user.createdAt)}
                  </p>
                  <p className="font-medium pt-2">
                    {t("adminWalletWalletSection")}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletAvailableBalance")}:{" "}
                    </span>
                    <Money
                      amount={userWalletDetail.wallet.availableBalance}
                      ccy={userWalletDetail.wallet.currency}
                    />
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletLedgerCompleted")}:{" "}
                    </span>
                    <Money
                      amount={userWalletDetail.wallet.ledgerCompletedBalance}
                      ccy={userWalletDetail.wallet.currency}
                    />
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletPendingHold")}:{" "}
                    </span>
                    <Money
                      amount={userWalletDetail.wallet.pendingWithdrawalHold}
                      ccy={userWalletDetail.wallet.currency}
                    />
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletMinSelfWithdrawal")}:{" "}
                    </span>
                    <Money
                      amount={userWalletDetail.minSelfServiceWithdrawalEur}
                      ccy="EUR"
                    />
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 rounded-xl border border-border/80 p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Store className="h-4 w-4" />
                {t("adminWalletLookupRestaurantTitle")}
              </h3>
              <div className="space-y-2">
                <WalletPickerCombobox<AdminWalletSelectRestaurantItem>
                  inputId="wallet-lookup-restaurant"
                  label={t("adminWalletSelectRestaurantPrompt")}
                  placeholder={t("adminWalletSearchRestaurants")}
                  search={lookupRestaurantSearch}
                  onSearchChange={setLookupRestaurantSearch}
                  options={lookupRestaurantPickOptions}
                  loading={lookupRestaurantPickLoading}
                  value={lookupRestaurantId}
                  onValueChange={setLookupRestaurantId}
                  getOptionLabel={formatRestaurantPickLabel}
                  noResultsLabel={t("adminWalletSearchNoResults")}
                  clearLabel={t("adminWalletClearSelection")}
                  loadingLabel={t("adminWalletOptionsLoading")}
                />
                {restaurantDetailLoading && lookupRestaurantId ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin shrink-0"
                      aria-hidden
                    />
                    {t("adminWalletOptionsLoading")}
                  </p>
                ) : null}
              </div>
              {restaurantWalletDetail ? (
                <div className="text-sm space-y-2 pt-2 border-t border-border/60">
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletRestaurantName")}:{" "}
                    </span>
                    {restaurantWalletDetail.restaurant.name}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletOwnerEmail")}:{" "}
                    </span>
                    {restaurantWalletDetail.restaurant.owner.email}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletUserName")}:{" "}
                    </span>
                    {restaurantWalletDetail.restaurant.owner.fullName ?? "—"}
                  </p>
                  <p className="font-medium pt-2">
                    {t("adminWalletWalletSection")}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletAvailableBalance")}:{" "}
                    </span>
                    <Money
                      amount={restaurantWalletDetail.wallet.availableBalance}
                      ccy={restaurantWalletDetail.wallet.currency}
                    />
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletLedgerCompleted")}:{" "}
                    </span>
                    <Money
                      amount={
                        restaurantWalletDetail.wallet.ledgerCompletedBalance
                      }
                      ccy={restaurantWalletDetail.wallet.currency}
                    />
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletPendingHold")}:{" "}
                    </span>
                    <Money
                      amount={
                        restaurantWalletDetail.wallet.pendingWithdrawalHold
                      }
                      ccy={restaurantWalletDetail.wallet.currency}
                    />
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletMinSelfWithdrawal")}:{" "}
                    </span>
                    <Money
                      amount={
                        restaurantWalletDetail.minSelfServiceWithdrawalEur
                      }
                      ccy="EUR"
                    />
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-border/80 p-4 space-y-3">
            <h3 className="text-sm font-semibold">
              {t("adminWalletManualDebitTitle")}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1">
                <Label>{t("adminWalletDebitOwnerType")}</Label>
                <select
                  className={walletSelectClassName}
                  value={debitOwnerType}
                  onChange={(e) =>
                    setDebitOwnerType(e.target.value as "USER" | "RESTAURANT")
                  }
                >
                  <option value="USER">{t("adminWalletTypeUser")}</option>
                  <option value="RESTAURANT">
                    {t("adminWalletTypeRestaurant")}
                  </option>
                </select>
              </div>
              {debitOwnerType === "USER" ? (
                <div className="sm:col-span-2">
                  <WalletPickerCombobox<AdminWalletSelectUserItem>
                    inputId="wallet-debit-user"
                    label={t("adminWalletDebitOwnerId")}
                    placeholder={t("adminWalletSearchUsers")}
                    search={debitUserSearch}
                    onSearchChange={setDebitUserSearch}
                    options={debitUserPickOptions}
                    loading={debitUserPickLoading}
                    value={debitUserId}
                    onValueChange={setDebitUserId}
                    getOptionLabel={formatUserPickLabel}
                    noResultsLabel={t("adminWalletSearchNoResults")}
                    clearLabel={t("adminWalletClearSelection")}
                    loadingLabel={t("adminWalletOptionsLoading")}
                  />
                </div>
              ) : (
                <div className="sm:col-span-2">
                  <WalletPickerCombobox<AdminWalletSelectRestaurantItem>
                    inputId="wallet-debit-restaurant"
                    label={t("adminWalletDebitOwnerId")}
                    placeholder={t("adminWalletSearchRestaurants")}
                    search={debitRestaurantSearch}
                    onSearchChange={setDebitRestaurantSearch}
                    options={debitRestaurantPickOptions}
                    loading={debitRestaurantPickLoading}
                    value={debitRestaurantId}
                    onValueChange={setDebitRestaurantId}
                    getOptionLabel={formatRestaurantPickLabel}
                    noResultsLabel={t("adminWalletSearchNoResults")}
                    clearLabel={t("adminWalletClearSelection")}
                    loadingLabel={t("adminWalletOptionsLoading")}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label>{t("adminWalletDebitAmount")}</Label>
                <Input
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("adminWalletDebitCurrency")}</Label>
                <Input
                  value={debitCurrency}
                  onChange={(e) =>
                    setDebitCurrency(e.target.value.toUpperCase())
                  }
                  maxLength={3}
                />
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <Label>{t("adminWalletDebitNote")}</Label>
                <Input
                  value={debitNote}
                  onChange={(e) => setDebitNote(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                <Label>{t("adminWalletDebitIdempotency")}</Label>
                <Input
                  className="font-mono text-sm"
                  value={debitIdempotency}
                  onChange={(e) => setDebitIdempotency(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              disabled={
                debitLoading ||
                (debitOwnerType === "USER"
                  ? !debitUserId.trim()
                  : !debitRestaurantId.trim()) ||
                !Number.isFinite(parseFloat(debitAmount)) ||
                parseFloat(debitAmount) <= 0
              }
              onClick={() => void submitManualDebit()}
            >
              {debitLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("adminWalletDebitSubmit")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("adminWalletRejectDialogTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="reject-reason">
              {t("adminWalletRejectReasonLabel")}
            </Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("adminWalletRejectReasonPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={actionId !== null || !rejectReason.trim()}
              onClick={() => void submitReject()}
            >
              {actionId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t("adminWalletReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
