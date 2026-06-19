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
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { authService } from "@/features/auth/authService";
import { setEmailVerified } from "@/features/auth/authSlice";
import { Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getDashboardPathForRole } from "@/lib/roleDashboard";
import { AuthBrandPanel, AuthFormPanel } from "@/components/auth/auth-brand-panel";

function VerifyEmailContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);
  const [mounted, setMounted] = useState(false);

  const emailFromQuery = searchParams?.get("email") || "";
  const emailLocked = !!(emailFromQuery || user?.email);
  const [email, setEmail] = useState(emailFromQuery || user?.email || "");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
    else if (user?.email) setEmail(user.email);
  }, [emailFromQuery, user?.email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !code || code.length !== 6) {
      setError(t("landing.auth.verifyCodeRequired"));
      return;
    }
    try {
      setSubmitting(true);
      await authService.verifyEmail(email, code.trim());
      setSuccess(true);
      dispatch(setEmailVerified());
      const redirectPath = getDashboardPathForRole(user?.role);
      setTimeout(() => router.push(redirectPath), 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || t("landing.auth.verifyCodeInvalid")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setError(null);
    try {
      setResending(true);
      await authService.sendVerificationCode(email);
      toast.success(t("landing.auth.verificationCodeSent"));
    } catch {
      // no-op
    } finally {
      setResending(false);
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
            {t("landing.auth.verifyEmailTitle")}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
            {t("landing.auth.verifyEmailDescription")}
          </p>

          {success ? (
            <Alert className="rounded-xl border-green-500 bg-green-500/10">
              <AlertDescription>
                {t("landing.auth.emailVerifiedSuccess")}
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
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
                  placeholder={t("landing.auth.enterEmail")}
                  value={email}
                  onChange={(e) => !emailLocked && setEmail(e.target.value)}
                  readOnly={emailLocked}
                  required
                  className={cn(
                    "h-12 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0",
                    emailLocked && "cursor-not-allowed opacity-90"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-sm font-medium text-foreground"
                >
                  {t("landing.auth.enterVerificationCode")}
                </Label>
                <CodeInput
                  id="code"
                  value={code}
                  onChange={setCode}
                  aria-label={t("landing.auth.verificationCode")}
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
                {t("landing.auth.verifyEmail")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl"
                disabled={resending || !email}
                onClick={handleResend}
              >
                {resending && (
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                )}
                {t("landing.auth.resendCode")}
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
        bg="stripes"
        title={t("landing.auth.enterVerificationCode")}
        subtitle={t("landing.auth.enterVerificationCodeDescription")}
      />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <I18nProvider>
      <VerifyEmailContent />
    </I18nProvider>
  );
}
