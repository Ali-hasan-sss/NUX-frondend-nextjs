"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "next-themes";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import { authService } from "@/features/auth/authService";
import { Home, Loader2 } from "lucide-react";
import { AuthBrandPanel, AuthFormPanel } from "@/components/auth/auth-brand-panel";

function ForgotPasswordContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const emailFromQuery = searchParams?.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) return;
    try {
      setSubmitting(true);
      await authService.requestPasswordReset(email);
      setSent(true);
      setTimeout(
        () =>
          router.push(
            `/auth/reset-password?email=${encodeURIComponent(email)}`
          ),
        1500
      );
    } catch {
      setSent(true);
      setTimeout(
        () =>
          router.push(
            `/auth/reset-password?email=${encodeURIComponent(email)}`
          ),
        1500
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;
  const isDark = theme === "dark" || theme === "system";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300">
      <AuthFormPanel>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8"
        >
          <Home className="h-4 w-4" />
          {t("tabs.home")}
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          {t("landing.auth.forgotPasswordTitle")}
        </h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
          {t("landing.auth.forgotPasswordDescription")}
        </p>

        {sent ? (
          <Alert className="rounded-xl border-green-500 bg-green-500/10">
            <AlertDescription>
              {t("landing.auth.resetCodeSent")}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t("landing.auth.email")}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t("landing.auth.enterEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={submitting}
            >
              {submitting && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {t("landing.auth.sendResetCode")}
            </Button>
            <p className="text-center text-sm text-muted-foreground pt-2">
              <Link
                href="/auth/login"
                className="text-primary font-medium hover:underline"
              >
                {t("landing.auth.backToLogin")}
              </Link>
            </p>
          </form>
        )}
      </AuthFormPanel>

      <AuthBrandPanel
        isDark={isDark}
        bg="mesh"
        title={t("landing.auth.enterEmailForReset")}
        subtitle={t("landing.auth.enterEmailForResetDescription")}
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <I18nProvider>
      <ForgotPasswordContent />
    </I18nProvider>
  );
}
