"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useAppDispatch } from "@/app/hooks";
import { loginWithGoogle } from "@/features/auth/authThunks";
import { getDashboardPathForRole } from "@/lib/roleDashboard";
import { readAndClearGoogleIdToken } from "@/lib/googleAuth";
import { resolvePostLoginPath } from "@/lib/authRedirect";

function GoogleCompleteContent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = readAndClearGoogleIdToken();
    if (!token) {
      router.replace("/auth/login?google_error=1");
      return;
    }

    void (async () => {
      const result = await dispatch(loginWithGoogle(token));
      if (loginWithGoogle.fulfilled.match(result)) {
        const user = result.payload.user;
        if (user?.emailVerified === false || user?.emailVerified === undefined) {
          router.replace(
            `/auth/verify-email?email=${encodeURIComponent(user?.email ?? "")}`,
          );
          return;
        }
        router.replace(
          resolvePostLoginPath({
            role: user?.role,
            emailVerified: user?.emailVerified,
            email: user?.email,
            fallback: getDashboardPathForRole(user?.role),
          }),
        );
        return;
      }
      router.replace("/auth/login?google_error=1");
    })();
  }, [dispatch, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background px-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {t("landing.auth.googleSigningIn")}
      </p>
    </div>
  );
}

export default function GoogleCompletePage() {
  return (
    <I18nProvider>
      <GoogleCompleteContent />
    </I18nProvider>
  );
}
