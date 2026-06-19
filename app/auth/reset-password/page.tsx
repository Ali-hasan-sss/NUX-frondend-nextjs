"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeInput } from "@/components/auth/code-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "next-themes";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import { authService } from "@/features/auth/authService";
import { Eye, EyeOff, Loader2, Home } from "lucide-react";
import { AuthBrandPanel, AuthFormPanel } from "@/components/auth/auth-brand-panel";

function ResetPasswordContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const emailFromQuery = searchParams?.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t("landing.auth.passwordsDoNotMatch"));
      return;
    }
    if (newPassword.length < 8) {
      setError(t("landing.auth.atLeast8Chars"));
      return;
    }
    try {
      setSubmitting(true);
      await authService.resetPassword(email, code.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t("landing.auth.resetCodeInvalid")
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
            {t("landing.auth.resetPasswordTitle")}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
            {t("landing.auth.resetPasswordDescription")}
          </p>

          {success ? (
            <Alert className="rounded-xl border-green-500 bg-green-500/10">
              <AlertDescription>
                {t("landing.auth.passwordResetSuccess")}
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
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t("landing.auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border border-input bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-sm font-medium text-foreground"
                >
                  {t("landing.auth.resetCode")}
                </Label>
                <CodeInput
                  id="code"
                  value={code}
                  onChange={setCode}
                  aria-label={t("landing.auth.resetCode")}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  {t("landing.auth.newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="h-12 rounded-xl border border-input bg-background pe-12 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-0 top-0 h-full px-3 rounded-s-none rounded-e-xl text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-foreground"
                >
                  {t("landing.auth.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border border-input bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
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
                {t("landing.auth.resetPassword")}
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
        bg="orbit"
        title={t("landing.auth.setNewPassword")}
        subtitle={t("landing.auth.setNewPasswordDescription")}
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <I18nProvider>
      <ResetPasswordContent />
    </I18nProvider>
  );
}
