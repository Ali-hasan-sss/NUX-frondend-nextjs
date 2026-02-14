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
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { authService } from "@/features/auth/authService";
import { setEmailVerified } from "@/features/auth/authSlice";
import { Home, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
      const redirectPath =
        user?.role === "ADMIN"
          ? "/admin"
          : user?.role === "RESTAURANT_OWNER"
            ? "/dashboard"
            : "/";
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
            {t("landing.auth.enterVerificationCode")}
          </p>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xs">
            {t("landing.auth.enterVerificationCodeDescription")}
          </p>
        </div>
      </section>
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
