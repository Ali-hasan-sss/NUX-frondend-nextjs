"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companyOwnerApi } from "@/features/company/companyOwnerApi";

export default function CompanyAllowanceInvoicesPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const companyId = String(params.companyId ?? "");

  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setUTCDate(monthAgo.getUTCDate() - 30);

  const [startDate, setStartDate] = useState(monthAgo.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(today.toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<
    Array<{
      id: string;
      createdAt: string;
      amount: string;
      currency: string;
      employeeEmail: string | null;
      employeeName: string | null;
      yearMonth: string | null;
    }>
  >([]);
  const [total, setTotal] = useState(0);

  const isoStart = startDate ? `${startDate}T00:00:00.000Z` : undefined;
  const isoEnd = endDate ? `${endDate}T23:59:59.999Z` : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await companyOwnerApi.listAllowanceTransfers(companyId, {
        take: 200,
        skip: 0,
        startDate: isoStart,
        endDate: isoEnd,
      });
      setItems(out.items);
      setTotal(out.total);
    } catch {
      setError(t("companyPortal.loadError"));
    } finally {
      setLoading(false);
    }
  }, [companyId, isoStart, isoEnd, t]);

  useEffect(() => {
    void load();
  }, [load]);

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

  const handleExport = async () => {
    if (!isoStart && !isoEnd) {
      toast.error(t("companyPortal.exportNeedsRange"));
      return;
    }
    setExporting(true);
    try {
      await companyOwnerApi.downloadAllowanceExport(companyId, {
        startDate: isoStart,
        endDate: isoEnd,
      });
    } catch {
      toast.error(t("companyPortal.loadError"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("companyPortal.invoicesTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("companyPortal.invoicesHint")}</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("companyPortal.dateFrom")}</label>
          <Input type="date" className="mt-1 w-auto" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("companyPortal.dateTo")}</label>
          <Input type="date" className="mt-1 w-auto" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("companyPortal.applyRange")}
        </Button>
        <Button type="button" onClick={() => void handleExport()} disabled={exporting}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="mr-1 h-4 w-4" />}
          {t("companyPortal.exportCsv")}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && items.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("companyPortal.noTransfers")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="p-3 font-medium">{t("wallet.requestedAt")}</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">{t("companyPortal.amount")}</th>
                <th className="p-3 font-medium">{t("companyPortal.period")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="p-3 text-muted-foreground">{fmtDate(row.createdAt)}</td>
                  <td className="p-3">
                    <span className="font-medium text-foreground">{row.employeeEmail ?? "—"}</span>
                    {row.employeeName && (
                      <span className="ml-2 text-xs text-muted-foreground">({row.employeeName})</span>
                    )}
                  </td>
                  <td className="p-3 tabular-nums">
                    {row.amount} {row.currency}
                  </td>
                  <td className="p-3">{row.yearMonth ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
            {total} {total === 1 ? "row" : "rows"}
          </p>
        </div>
      )}
    </div>
  );
}
