"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { cn } from "@/lib/utils";

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

  const logoSectionGradient = isDark
    ? "linear-gradient(135deg, #0A0E27 0%, #1A1F3A 35%, #2D1B4E 50%, #1A1F3A 75%, #0A0E27 100%)"
    : "linear-gradient(135deg, rgba(0,217,255,0.45) 0%, rgba(255,107,157,0.4) 30%, rgba(0,217,255,0.55) 50%, rgba(255,107,157,0.4) 70%, rgba(0,217,255,0.45) 100%)";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300">
      {/* النصف الأول: الفورم */}
      <section
        className={cn(
          "flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 sm:px-6 sm:py-10 md:px-8 order-2 lg:order-1 bg-background border-t lg:border-t-0 lg:border-e border-border/80"
        )}
      >
        <div className="w-full max-w-[340px] sm:max-w-sm md:max-w-md mx-auto">
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
        </div>
      </section>

      {/* النصف الثاني: اللوجو — مخفي على الموبايل */}
      <section className="hidden lg:flex relative flex-col items-center justify-center min-h-screen w-full px-6 py-24 order-1 lg:order-2 overflow-hidden">
        <div
          className="absolute inset-0 animate-gradient-brand"
          style={{
            backgroundImage: logoSectionGradient,
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 50%",
            backgroundColor: isDark ? "#0A0E27" : "rgba(0,217,255,0.2)",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 end-1/4 w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-primary/25 blur-3xl animate-orb-float" />
          <div
            className="absolute bottom-1/4 start-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-secondary/20 blur-3xl animate-orb-float"
            style={{ animationDelay: "-4s" }}
          />
          {isDark && (
            <>
              <div className="absolute top-1/2 start-1/2 w-[240px] sm:w-[300px] h-[240px] sm:h-[300px] border border-primary/25 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ring-glow" />
              <div
                className="absolute top-1/2 start-1/2 w-[160px] sm:w-[200px] h-[160px] sm:h-[200px] border border-secondary/25 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ring-glow"
                style={{ animationDelay: "-2s" }}
              />
            </>
          )}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 p-3 sm:p-4 md:p-5 shadow-xl mb-4 sm:mb-6 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/images/logo.png"
              alt="NUX"
              width={140}
              height={70}
              className="h-10 sm:h-12 md:h-14 w-auto"
            />
          </Link>
          <p className="text-foreground font-semibold text-base sm:text-xl md:text-2xl">
            {t("landing.auth.setNewPassword")}
          </p>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xs">
            {t("landing.auth.setNewPasswordDescription")}
          </p>
        </div>
      </section>
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
