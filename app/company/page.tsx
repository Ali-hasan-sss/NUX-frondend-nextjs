"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, Building2 } from "lucide-react";
import { companyOwnerApi, type CompanyListRow } from "@/features/company/companyOwnerApi";

export default function CompanyPortalHomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [rows, setRows] = useState<CompanyListRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await companyOwnerApi.listCompanies();
        if (cancelled) return;
        setRows(list);
        if (list.length > 0) {
          router.replace(`/company/${list[0].id}`);
          return;
        }
      } catch {
        if (!cancelled) setError(t("companyPortal.loadError"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, t]);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (rows === null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t("companyPortal.redirecting")}</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">{t("companyPortal.companiesHeading")}</h1>
        <p className="text-sm text-muted-foreground">{t("companyPortal.noCompanies")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{t("companyPortal.redirecting")}</p>
    </div>
  );
}
