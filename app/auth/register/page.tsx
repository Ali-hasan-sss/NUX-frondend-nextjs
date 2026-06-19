"use client";

import { MultiStepRegisterForm } from "@/components/auth/multi-step-register-form";
import { AuthBrandPanel, AuthFormPanel } from "@/components/auth/auth-brand-panel";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Home } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { getAuthenticatedAppHome } from "@/lib/roleDashboard";

function RegisterPageContent() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated && user) {
      router.replace(getAuthenticatedAppHome(user.role));
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || (isAuthenticated && user)) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300">
      <AuthFormPanel wide>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8"
        >
          <Home className="h-4 w-4" />
          {t("tabs.home")}
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {t("landing.auth.joinNux")}
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
          {t("landing.auth.createAccountDescription")}
        </p>
        <MultiStepRegisterForm />
      </AuthFormPanel>

      <AuthBrandPanel
        isDark={isDark}
        bg="aurora"
        title={t("landing.auth.createAccountDescription")}
        subtitle={t("landing.auth.chooseAccountType")}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <I18nProvider>
      <RegisterPageContent />
    </I18nProvider>
  );
}
