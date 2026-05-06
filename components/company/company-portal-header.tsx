"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { companyOwnerApi, type CompanyListRow } from "@/features/company/companyOwnerApi";
import { companyRouteSuffix } from "@/lib/companyPortalPaths";

type Props = {
  companyId?: string;
};

export function CompanyPortalHeader({ companyId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);
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

  const suffix = useMemo(() => companyRouteSuffix(pathname), [pathname]);

  const currentCompanyName = useMemo(() => {
    if (!companyId) return t("companyPortal.title");
    return companies.find((c) => c.id === companyId)?.name ?? t("companyPortal.title");
  }, [companyId, companies, t]);

  const switchCompany = (id: string) => {
    router.push(`/company/${id}${suffix}`);
  };

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/95 px-3 backdrop-blur md:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 ps-0.5">
        <span className="truncate text-sm font-semibold text-foreground lg:hidden">{currentCompanyName}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <LanguageSwitcher />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1 rounded-full border border-border bg-card p-1 ps-2 shadow-sm outline-none ring-offset-background hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                "max-w-[min(100vw-8rem,220px)]"
              )}
              aria-label={t("companyPortal.companySwitcher")}
            >
              <Avatar className="h-8 w-8 border border-primary/30">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {user?.fullName?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    "C"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-xs font-medium text-foreground sm:inline">
                {currentCompanyName}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName || user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t("companyPortal.companySwitcher")}</DropdownMenuLabel>
            {companies.length === 0 ? (
              <div className="px-2 py-2 text-xs text-muted-foreground">{t("companyPortal.loadingCompanies")}</div>
            ) : (
              <DropdownMenuRadioGroup
                value={companyId ?? ""}
                onValueChange={(v) => {
                  if (v) switchCompany(v);
                }}
              >
                {companies.map((c) => (
                  <DropdownMenuRadioItem key={c.id} value={c.id} className="gap-2">
                    <Building2 className="h-4 w-4 shrink-0 opacity-70" />
                    <span className="truncate">{c.name}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/" className="flex cursor-pointer items-center gap-2">
                <Home className="h-4 w-4" />
                {t("tabs.home")}
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
