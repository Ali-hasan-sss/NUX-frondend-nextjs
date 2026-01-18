"use client";

import { MultiStepRegisterForm } from "@/components/auth/multi-step-register-form";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";

function RegisterPageContent() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-b from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
          : "bg-gradient-to-b from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">{t("landing.auth.joinNux")}</h1>
            <p className="text-muted-foreground">
              {t("landing.auth.createAccountDescription")}
            </p>
          </div>
          <MultiStepRegisterForm />
        </div>
      </main>
      <Footer />
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
