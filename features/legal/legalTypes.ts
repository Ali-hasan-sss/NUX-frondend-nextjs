export type LegalLocale = "en" | "ar" | "de";
export type LegalPublicType = "privacy" | "terms";

export type LegalLocaleContent = Record<LegalLocale, string>;

export type LegalContentMap = {
  privacy: LegalLocaleContent;
  terms: LegalLocaleContent;
};

export type PublicLegalDocument = {
  type: string;
  locale: LegalLocale;
  content: string;
  updatedAt: string | null;
};
