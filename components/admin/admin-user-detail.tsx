"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";
import { formatDate } from "@/lib/utils";
import { adminUsersService } from "@/features/admin/users/adminUsersService";
import type { AdminUserDetail } from "@/features/admin/users/adminUsersTypes";
import {
  adminWalletService,
  type AdminUserWalletDetail,
} from "@/features/admin/wallet/adminWalletService";
import type { TranslationKey } from "@/lib/translations";

const ADMIN_USER_ERR: Record<string, TranslationKey> = {
  "You cannot access admin user details": "adminUsersErrorCannotAccessAdmin",
};

function moneyLabel(amount: string, ccy: string) {
  return `${amount} ${ccy}`;
}

export function AdminUserDetail() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { t } = useLanguage();

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [walletDetail, setWalletDetail] = useState<AdminUserWalletDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chargeOpen, setChargeOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeNote, setChargeNote] = useState("");
  const [chargeSubmitting, setChargeSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const u = await adminUsersService.getDetailById(id);
      setUser(u);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load user";
      setError(typeof msg === "string" ? msg : String(msg));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadWallet = useCallback(async () => {
    if (!id) return;
    setWalletLoading(true);
    try {
      const w = await adminWalletService.getUserWalletDetail(id);
      setWalletDetail(w);
    } catch {
      setWalletDetail(null);
      toast.error(t("adminWalletDetailLoadError"));
    } finally {
      setWalletLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (user) void loadWallet();
  }, [user, loadWallet]);

  const onSubmitCharge = async () => {
    if (!id) return;
    const n = parseFloat(chargeAmount.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return;
    setChargeSubmitting(true);
    try {
      const out = await adminWalletService.manualWalletCredit({
        ownerType: "USER",
        ownerId: id,
        amount: n,
        currency: walletDetail?.wallet.currency ?? "EUR",
        ...(chargeNote.trim() ? { note: chargeNote.trim() } : {}),
      });
      toast.success(
        t("adminWalletCreditSuccess")
          .replace("{{balance}}", out.availableBalanceAfter)
          .replace("{{currency}}", out.currency),
      );
      setChargeOpen(false);
      setChargeAmount("");
      setChargeNote("");
      await loadWallet();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || t("adminWalletError");
      toast.error(typeof msg === "string" ? msg : String(msg));
    } finally {
      setChargeSubmitting(false);
    }
  };

  const translatedError =
    error && ADMIN_USER_ERR[error] ? t(ADMIN_USER_ERR[error]) : error;

  if (!id) {
    return (
      <div className="p-6 text-muted-foreground">
        {t("adminWalletError")}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
        <Link href="/admin/users">
          <ArrowLeft className="h-4 w-4" />
          {t("backToUsersList")}
        </Link>
      </Button>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("loadingUsers")}
        </div>
      ) : error ? (
        <div className="text-destructive text-sm">{translatedError}</div>
      ) : user ? (
        <>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("userDetailTitle")}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("user")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">{t("fullName")}: </span>
                {user.fullName ?? "—"}
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">{t("role")}: </span>
                <Badge variant="secondary">{user.role}</Badge>
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">{t("status")}: </span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? t("active") : t("inactive")}
                </Badge>
              </p>
              <p>
                <span className="text-muted-foreground">{t("joinDate")}: </span>
                {user.createdAt ? formatDate(user.createdAt) : t("na")}
              </p>
            </CardContent>
          </Card>

          {user.restaurants.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("userDetailRestaurants")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {user.restaurants.map((r) => (
                    <li key={r.id}>{r.name}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {user.companiesOwned && user.companiesOwned.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("userDetailCompanies")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {user.companiesOwned.map((c) => (
                    <li
                      key={c.id}
                      className="border rounded-md p-3 space-y-1 list-none"
                    >
                      <div className="font-medium">{c.name}</div>
                      {c.taxNumber != null && (
                        <div className="text-muted-foreground">
                          {t("taxNumber")}: {c.taxNumber}
                        </div>
                      )}
                      {c.commercialRegister != null && (
                        <div className="text-muted-foreground">
                          {t("commercialRegister")}: {c.commercialRegister}
                        </div>
                      )}
                      {c.reportedEmployeeCount != null && (
                        <div className="text-muted-foreground">
                          {t("employeeCount")}: {c.reportedEmployeeCount}
                        </div>
                      )}
                      {c.subscriptionStatus != null && (
                        <div>
                          <Badge variant="secondary">{c.subscriptionStatus}</Badge>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {t("adminWalletWalletSection")}
                </CardTitle>
                <CardDescription>{t("userDetailChargeHint")}</CardDescription>
              </div>
              <Button type="button" onClick={() => setChargeOpen(true)}>
                {t("userDetailChargeWallet")}
              </Button>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {walletLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("loadingUsers")}
                </div>
              ) : walletDetail ? (
                <>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletAvailableBalance")}:{" "}
                    </span>
                    {moneyLabel(
                      walletDetail.wallet.availableBalance,
                      walletDetail.wallet.currency,
                    )}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletLedgerCompleted")}:{" "}
                    </span>
                    {moneyLabel(
                      walletDetail.wallet.ledgerCompletedBalance,
                      walletDetail.wallet.currency,
                    )}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      {t("adminWalletPendingHold")}:{" "}
                    </span>
                    {moneyLabel(
                      walletDetail.wallet.pendingWithdrawalHold,
                      walletDetail.wallet.currency,
                    )}
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground">{t("adminWalletDetailLoadError")}</p>
              )}
            </CardContent>
          </Card>

          <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("userDetailChargeDialogTitle")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="charge-amount">{t("adminWalletDebitAmount")}</Label>
                  <Input
                    id="charge-amount"
                    inputMode="decimal"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="charge-note">{t("adminWalletDebitNote")}</Label>
                  <Input
                    id="charge-note"
                    value={chargeNote}
                    onChange={(e) => setChargeNote(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChargeOpen(false)}
                  disabled={chargeSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={() => void onSubmitCharge()}
                  disabled={
                    chargeSubmitting ||
                    !chargeAmount.trim() ||
                    !Number.isFinite(parseFloat(chargeAmount.replace(",", "."))) ||
                    parseFloat(chargeAmount.replace(",", ".")) <= 0
                  }
                >
                  {chargeSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("userDetailChargeWallet")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}
