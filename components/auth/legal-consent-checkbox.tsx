"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LegalConsentCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
};

export function LegalConsentCheckbox({
  checked,
  onCheckedChange,
  id = "legal-consent",
  className,
}: LegalConsentCheckboxProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-border bg-muted/30 p-3",
        isRtl && "flex-row-reverse",
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-0.5"
      />
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-normal leading-relaxed text-muted-foreground cursor-pointer",
          isRtl && "text-right"
        )}
      >
        {t("landing.auth.legalConsentPrefix")}{" "}
        <Link
          href="/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {t("drawer.privacyPolicy") || "Privacy Policy"}
        </Link>{" "}
        {t("landing.auth.legalAnd")}{" "}
        <Link
          href="/legal/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-medium hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {t("drawer.termsOfUse") || "Terms of Use"}
        </Link>
      </Label>
    </div>
  );
}
