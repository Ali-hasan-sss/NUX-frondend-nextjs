"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings, Users, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = { companyId: string };

export function CompanyMobileBottomNav({ companyId }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const base = `/company/${companyId}`;
  const onSettings =
    pathname === base ||
    pathname === `${base}/` ||
    (!!pathname?.startsWith(`${base}/`) &&
      !pathname.includes("/wallet") &&
      !pathname.includes("/invoices") &&
      !pathname.includes("/employees"));
  const tabs: {
    href: string;
    label: string;
    Icon: typeof Settings;
    active: boolean;
  }[] = [
    {
      href: base,
      label: t("companyPortal.nav.settings"),
      Icon: Settings,
      active: onSettings,
    },
    {
      href: `${base}/employees`,
      label: t("companyPortal.nav.employees"),
      Icon: Users,
      active: !!pathname?.startsWith(`${base}/employees`),
    },
    {
      href: `${base}/wallet`,
      label: t("companyPortal.nav.wallet"),
      Icon: WalletCards,
      active: !!pathname?.startsWith(`${base}/wallet`),
    },
    {
      href: `${base}/invoices`,
      label: t("companyPortal.nav.invoices"),
      Icon: FileText,
      active: !!pathname?.startsWith(`${base}/invoices`),
    },
  ];

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex lg:hidden",
        "border-t border-sidebar-border bg-background/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))] pb-2 pt-1",
        "shadow-[0_-4px_24px_-4px_hsl(var(--foreground)/0.06)]"
      )}
      aria-label={t("companyPortal.title")}
    >
      {tabs.map(({ href, label, Icon, active }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium transition-colors",
            active ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} />
          <span className="line-clamp-2 max-w-full text-center leading-tight">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
