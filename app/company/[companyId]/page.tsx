"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, WalletCards, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { companyOwnerApi, type CompanyDetail } from "@/features/company/companyOwnerApi";

export default function CompanySettingsPage() {
  const { t } = useTranslation();
  const params = useParams();
  const companyId = String(params.companyId ?? "");

  const [data, setData] = useState<CompanyDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    taxNumber: "",
    commercialRegister: "",
    reportedEmployeeCount: "" as string,
    monthlyAllowancePerEmployee: "" as string,
  });

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const c = await companyOwnerApi.getCompany(companyId);
      setData(c);
      setForm({
        name: c.name,
        taxNumber: c.taxNumber,
        commercialRegister: c.commercialRegister,
        reportedEmployeeCount:
          c.reportedEmployeeCount != null ? String(c.reportedEmployeeCount) : "",
        monthlyAllowancePerEmployee: String(c.monthlyAllowancePerEmployee ?? ""),
      });
    } catch {
      setLoadError(t("companyPortal.loadError"));
    }
  }, [companyId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await companyOwnerApi.updateCompany(companyId, {
        name: form.name.trim(),
        taxNumber: form.taxNumber.trim(),
        commercialRegister: form.commercialRegister.trim(),
        reportedEmployeeCount: form.reportedEmployeeCount
          ? parseInt(form.reportedEmployeeCount, 10)
          : undefined,
        monthlyAllowancePerEmployee: form.monthlyAllowancePerEmployee.trim() || "0",
      });
      setData(updated);
      toast.success(t("companyPortal.settingsSaved"));
    } catch {
      toast.error(t("companyPortal.settingsError"));
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }
  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-foreground">{t("companyPortal.settingsTitle")}</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/company/${companyId}/wallet`}>
              <WalletCards className="mr-1 h-4 w-4" />
              {t("companyPortal.nav.wallet")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/company/${companyId}/invoices`}>
              <FileText className="mr-1 h-4 w-4" />
              {t("companyPortal.nav.invoices")}
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/company/${companyId}/employees`}>
              <Users className="mr-1 h-4 w-4" />
              {t("companyPortal.nav.employees")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">{t("companyPortal.companyName")}</label>
            <Input
              className="mt-1"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tax / ID</label>
            <Input
              className="mt-1"
              value={form.taxNumber}
              onChange={(e) => setForm((f) => ({ ...f, taxNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Commercial register</label>
            <Input
              className="mt-1"
              value={form.commercialRegister}
              onChange={(e) => setForm((f) => ({ ...f, commercialRegister: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reported headcount</label>
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.reportedEmployeeCount}
              onChange={(e) => setForm((f) => ({ ...f, reportedEmployeeCount: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t("companyPortal.allowancePerEmployeeLabel")}</label>
            <Input
              className="mt-1"
              value={form.monthlyAllowancePerEmployee}
              onChange={(e) => setForm((f) => ({ ...f, monthlyAllowancePerEmployee: e.target.value }))}
            />
          </div>
        </div>
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("companyPortal.saveSettings")}
        </Button>
      </div>

    </div>
  );
}
