"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, FileText, LogOut, Settings, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { useTranslation } from "react-i18next";

type CompanySidebarProps = {
  companyId: string;
  companyName?: string;
};

export function CompanySidebar({ companyId, companyName }: CompanySidebarProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const base = `/company/${companyId}`;
  const settingsActive =
    pathname === base ||
    pathname === `${base}/` ||
    (!!pathname?.startsWith(`${base}/`) &&
      !pathname.includes("/wallet") &&
      !pathname.includes("/invoices") &&
      !pathname.includes("/employees"));
  const items = [
    {
      href: base,
      label: t("companyPortal.nav.settings"),
      icon: Settings,
      active: settingsActive,
    },
    {
      href: `${base}/employees`,
      label: t("companyPortal.nav.employees"),
      icon: Users,
      active: !!pathname?.startsWith(`${base}/employees`),
    },
    {
      href: `${base}/wallet`,
      label: t("companyPortal.nav.wallet"),
      icon: WalletCards,
      active: !!pathname?.startsWith(`${base}/wallet`),
    },
    {
      href: `${base}/invoices`,
      label: t("companyPortal.nav.invoices"),
      icon: FileText,
      active: !!pathname?.startsWith(`${base}/invoices`),
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  return (
    <div
      className={cn(
        "sidebar-panel fixed inset-y-0 z-40 hidden w-64 transform transition-transform duration-300 ease-in-out lg:flex lg:translate-x-0 lg:static lg:inset-0 lg:rounded-e-2xl lg:my-2 lg:ms-2 lg:h-[calc(100vh-1rem)]",
        isRTL ? "right-0 lg:right-auto" : "left-0"
      )}
    >
      <div className="flex h-full w-full flex-col overflow-y-auto py-2 sidebar-scroll">
        <div
          className={cn(
            "mx-4 mt-4 flex items-center gap-3 px-4 py-3",
            isRTL && "flex-row-reverse"
          )}
        >
          <button
            type="button"
            className="sidebar-brand flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-start"
            onClick={() => router.push("/")}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-accent/50">
              <Building2 className="h-5 w-5 text-sidebar-foreground" />
            </div>
            <div className={cn("min-w-0 flex-1", isRTL && "text-end")}>
              <span className="block truncate font-semibold text-sidebar-foreground">
                {companyName || t("companyPortal.title")}
              </span>
              <p className="block truncate text-xs text-sidebar-foreground/70">{user?.email}</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "sidebar-nav-item flex items-center gap-3 px-3 py-2.5 text-sm",
                it.active
                  ? "sidebar-nav-item--active"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/80 hover:text-sidebar-foreground"
              )}
            >
              <it.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{it.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="sidebar-user-card p-3">
            <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {user?.fullName || t("companyPortal.title")}
                </p>
                <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={cn(
                "mt-2 w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                isRTL && "flex-row-reverse"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">{t("dashboard.sidebar.signOut")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
