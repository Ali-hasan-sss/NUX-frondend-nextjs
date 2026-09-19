import type { PublicPlan } from "./publicPlansTypes";

type PlanDescriptionSource = Pick<
  PublicPlan,
  | "description"
  | "descriptionEn"
  | "descriptionAr"
  | "descriptionDe"
  | "descriptionTr"
>;

export function planLangCode(language?: string | null): string {
  return String(language || "en")
    .toLowerCase()
    .split(/[-_]/)[0]
    .trim() || "en";
}

export function stripPlanHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function isMeaningfulDescription(text: string): boolean {
  return Boolean(text) && !/^[.\u2022\-\s]+$/.test(text);
}

export function pickLocalizedPlanDescriptionHtml(
  plan: PlanDescriptionSource,
  language?: string | null,
): string {
  const lang = planLangCode(language);
  const byLang: Record<string, string | null | undefined> = {
    en: plan.descriptionEn,
    ar: plan.descriptionAr,
    de: plan.descriptionDe,
    tr: plan.descriptionTr,
  };
  const candidates = [
    byLang[lang],
    plan.description,
    plan.descriptionEn,
    plan.descriptionDe,
    plan.descriptionAr,
    plan.descriptionTr,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    if (isMeaningfulDescription(stripPlanHtml(candidate))) {
      return candidate.trim();
    }
  }

  return "";
}
