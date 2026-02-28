"use client";

import type React from "react";

import { useState } from "react";
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

export function LoginForm() {
  const { t, i18n } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error } = useAppSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      setSubmitting(true);
      const result = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(result)) {
        if (result.payload.user.role === "ADMIN") {
          router.push("/admin");
        } else if (result.payload.user.role === "RESTAURANT_OWNER") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
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
      {error && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertDescription>
            {error.includes("sign in with Google") || error.includes("USE_GOOGLE")
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

      <Button
        type="submit"
        className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
        disabled={submitting}
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

      <GoogleSignInButton mode="signin" className="flex justify-center" />

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
            href="/auth/register"
            className="text-primary font-medium hover:underline"
          >
            {t("landing.auth.signUpLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
