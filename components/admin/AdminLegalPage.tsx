"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useLanguage } from "@/hooks/use-language";
import { legalService } from "@/features/legal/legalService";
import type { LegalContentMap, LegalLocale } from "@/features/legal/legalTypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const LOCALES: LegalLocale[] = ["en", "ar", "de"];

const emptyMap = (): LegalContentMap => ({
  privacy: { en: "", ar: "", de: "" },
  terms: { en: "", ar: "", de: "" },
});

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

export function AdminLegalPage() {
  const { t } = useLanguage();
  const [content, setContent] = useState<LegalContentMap>(emptyMap);
  const [docType, setDocType] = useState<"privacy" | "terms">("privacy");
  const [locale, setLocale] = useState<LegalLocale>("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await legalService.getAdminAll();
      setContent(data);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          t("adminLegalLoadError")
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const currentHtml = useMemo(
    () => content[docType][locale] ?? "",
    [content, docType, locale]
  );

  const setCurrentHtml = (html: string) => {
    setContent((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], [locale]: html },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await legalService.updateAdminAll(content);
      setContent(updated);
      toast.success(t("adminLegalSaved"));
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || t("adminLegalSaveError")
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            {t("adminLegalTitle")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("adminLegalDescription")}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {t("adminLegalSaveAll")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminLegalEditorTitle")}</CardTitle>
          <CardDescription>
            {t("adminLegalEditorHint")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={docType}
            onValueChange={(v) => setDocType(v as "privacy" | "terms")}
          >
            <TabsList>
              <TabsTrigger value="privacy">
                {t("adminLegalPrivacyTab")}
              </TabsTrigger>
              <TabsTrigger value="terms">
                {t("adminLegalTermsTab")}
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap gap-2 pt-4">
              {LOCALES.map((loc) => (
                <Button
                  key={loc}
                  type="button"
                  size="sm"
                  variant={locale === loc ? "default" : "outline"}
                  onClick={() => setLocale(loc)}
                >
                  {loc === "en"
                    ? t("adminLegalLangEn")
                    : loc === "ar"
                      ? t("adminLegalLangAr")
                      : t("adminLegalLangDe")}
                </Button>
              ))}
            </div>

          </Tabs>

          <div className="mt-4">
            <LegalEditor
              value={currentHtml}
              onChange={setCurrentHtml}
              locale={locale}
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {t("adminLegalPreviewHint")}{" "}
        <a href="/legal/privacy" target="_blank" rel="noreferrer" className="text-primary underline">
          /legal/privacy
        </a>
        {" · "}
        <a href="/legal/terms" target="_blank" rel="noreferrer" className="text-primary underline">
          /legal/terms
        </a>
      </p>
    </div>
  );
}

function LegalEditor({
  value,
  onChange,
  locale,
}: {
  value: string;
  onChange: (html: string) => void;
  locale: LegalLocale;
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-background overflow-hidden",
        "[&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[280px]",
        locale === "ar" && "[&_.ql-editor]:text-right"
      )}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <ReactQuill theme="snow" value={value} onChange={onChange} modules={quillModules} />
    </div>
  );
}
