"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loginUser } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { getDashboardPathForRole } from "@/lib/roleDashboard";
import { peekAuthRedirect, rememberAuthRedirect, resolvePostLoginPath } from "@/lib/authRedirect";
import { LegalConsentCheckbox } from "@/components/auth/legal-consent-checkbox";

export function LoginForm() {
  const { t, i18n } = useTranslation();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error } = useAppSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);
  const [googleRedirectError, setGoogleRedirectError] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGoogleRedirectError(params.get("google_error") === "1");
    const next = peekAuthRedirect();
    if (next) {
      rememberAuthRedirect(next);
      setNextPath(next);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return;
    dispatch(clearError());

    try {
      setSubmitting(true);
      const result = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(result)) {
        const user = result.payload.user;
        router.push(
          resolvePostLoginPath({
            role: user.role,
            emailVerified: user.emailVerified,
            email: user.email,
            fallback: getDashboardPathForRole(user.role),
          }),
        );
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {(error || googleRedirectError) && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>
            {googleRedirectError && !error
              ? t("landing.auth.googleSignInFailed")
              : error?.includes("sign in with Google") || error?.includes("USE_GOOGLE")
                ? t("landing.auth.pleaseSignInWithGoogle")
                : error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          {t("landing.auth.email")}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("landing.auth.enterEmail")}
          value={formData.email}
          onChange={handleChange}
          required
          className="h-12 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
        />
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          {t("landing.auth.password")}
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("landing.auth.enterPassword")}
            value={formData.password}
            onChange={handleChange}
            required
            dir={i18n.dir()}
            className="h-12 rounded-xl border border-input bg-background pe-12 rtl:ps-12 rtl:pe-4 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent rounded-s-none rounded-e-xl text-muted-foreground"
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

      <LegalConsentCheckbox
        id="login-legal-consent"
        checked={agreedToTerms}
        onCheckedChange={setAgreedToTerms}
      />

      <Button
        type="submit"
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
        disabled={submitting || !agreedToTerms}
      >
        {submitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
        {t("landing.auth.signIn")}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("landing.auth.or")}
          </span>
        </div>
      </div>

      <GoogleSignInButton
        mode="signin"
        className="w-full"
        disabled={!agreedToTerms}
      />

      <div className="space-y-3 pt-2">
        {error && (error.includes("verify") || error.includes("verif")) && (
          <p className="text-sm">
            <Link
              href={`/auth/verify-email?email=${encodeURIComponent(
                formData.email
              )}`}
              className="text-primary font-medium hover:underline"
            >
              {t("landing.auth.verifyEmailLink")}
            </Link>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/auth/forgot-password${
              formData.email
                ? `?email=${encodeURIComponent(formData.email)}`
                : ""
            }`}
            className="text-primary hover:underline font-medium"
          >
            {t("landing.auth.forgotPassword")}
          </Link>
        </p>
        <p className="text-sm text-muted-foreground">
          {t("landing.auth.dontHaveAccount")}{" "}
          <Link
            href={
              nextPath
                ? `/auth/register?next=${encodeURIComponent(nextPath)}`
                : "/auth/register"
            }
            className="text-primary font-medium hover:underline"
          >
            {t("landing.auth.signUpLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
