"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { legalService } from "@/features/legal/legalService";
import type { LegalLocale, LegalPublicType } from "@/features/legal/legalTypes";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const LOCALES: LegalLocale[] = ["en", "ar", "de"];

function resolveLocale(lang: string | undefined, langParam: string | null): LegalLocale {
  const fromQuery = langParam?.trim().toLowerCase();
  if (fromQuery && LOCALES.includes(fromQuery as LegalLocale)) {
    return fromQuery as LegalLocale;
  }
  const fromI18n = lang?.trim().toLowerCase();
  if (fromI18n && LOCALES.includes(fromI18n as LegalLocale)) {
    return fromI18n as LegalLocale;
  }
  return "en";
}

type LegalDocumentViewProps = {
  type: LegalPublicType;
};

export function LegalDocumentView({ type }: LegalDocumentViewProps) {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const embed = searchParams?.get("embed") === "1";
  const langParam = searchParams?.get("lang") ?? searchParams?.get("locale");

  const [locale, setLocale] = useState<LegalLocale>(() =>
    resolveLocale(i18n.language, langParam)
  );
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocale(resolveLocale(i18n.language, langParam));
  }, [i18n.language, langParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    legalService
      .getPublic(type, locale)
      .then((doc) => {
        if (!cancelled) setHtml(doc.content || "");
      })
      .catch((e: any) => {
        if (!cancelled) {
          setError(
            e?.response?.data?.message ||
              t("legal.loadError") ||
              "Failed to load document"
          );
          setHtml("");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, locale, t]);

  const title =
    type === "privacy"
      ? t("drawer.privacyPolicy") || "Privacy Policy"
      : t("drawer.termsOfUse") || "Terms of Use";

  return (
    <div
      className={cn(
        "min-h-screen bg-background text-foreground",
        embed ? "p-4 pt-6" : "px-4 py-8"
      )}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className={cn("mx-auto w-full", embed ? "max-w-3xl" : "max-w-4xl")}>
        {!embed && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← {t("legal.backHome") || "Home"}
              </Link>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold">{title}</h1>
            </div>
            <div className="flex gap-2">
              {LOCALES.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    locale === loc
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {embed && (
          <h1 className="mb-4 text-xl font-bold">{title}</h1>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 flex gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        ) : html.trim() ? (
          <article
            className={cn(
              "legal-document-prose prose prose-neutral dark:prose-invert max-w-none",
              "prose-headings:font-semibold prose-a:text-primary"
            )}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            {t("legal.empty") || "Content is not available yet."}
          </p>
        )}
      </div>
    </div>
  );
}
