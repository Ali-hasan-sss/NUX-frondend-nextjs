"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { I18nProvider } from "@/components/client/i18n-provider";
import { CompanySidebar } from "@/components/company/company-sidebar";
import { CompanyPortalHeader } from "@/components/company/company-portal-header";
import { CompanyMobileBottomNav } from "@/components/company/company-mobile-bottom-nav";
import { companyOwnerApi, type CompanyListRow } from "@/features/company/companyOwnerApi";

function CompanyLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const m = pathname?.match(/^\/company\/([0-9a-f-]{36})/i);
  const companyId = m?.[1];
  const [companies, setCompanies] = useState<CompanyListRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void companyOwnerApi.listCompanies().then((rows) => {
      if (!cancelled) setCompanies(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const companyName = companyId ? companies.find((c) => c.id === companyId)?.name : undefined;

  return (
    <div className="flex h-screen bg-background">
      {companyId ? <CompanySidebar companyId={companyId} companyName={companyName} /> : null}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden pb-[4.75rem] lg:pb-0">
        <CompanyPortalHeader companyId={companyId} />
        <div className="flex-1 overflow-y-auto p-3 md:p-4">{children}</div>
        {companyId ? <CompanyMobileBottomNav companyId={companyId} /> : null}
      </main>
    </div>
  );
}

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ProtectedRoute requiredRole="COMPANY_OWNER">
        <CompanyLayoutShell>{children}</CompanyLayoutShell>
      </ProtectedRoute>
    </I18nProvider>
  );
}
