"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import {
  persistGoogleIdToken,
  readAndClearGoogleIdToken,
} from "@/lib/googleAuth";

function GoogleCallbackContent() {
  const { t } = useTranslation();
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

    persistGoogleIdToken(token);
    router.replace("/auth/google/complete");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background px-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">
        {t("landing.auth.googleSigningIn")}
      </p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <I18nProvider>
      <GoogleCallbackContent />
    </I18nProvider>
  );
}
