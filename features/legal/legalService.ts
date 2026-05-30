import { axiosInstance } from "@/utils/axiosInstance";
import type { LegalContentMap, LegalLocale, LegalPublicType, PublicLegalDocument } from "./legalTypes";

export const legalService = {
  async getPublic(type: LegalPublicType, locale: LegalLocale): Promise<PublicLegalDocument> {
    const res = await axiosInstance.get(`/public/legal/${type}`, {
      params: { locale },
    });
    return res.data.data as PublicLegalDocument;
  },

  async getAdminAll(): Promise<LegalContentMap> {
    const res = await axiosInstance.get("/admin/legal");
    return res.data.data as LegalContentMap;
  },

  async updateAdminAll(map: LegalContentMap): Promise<LegalContentMap> {
    const res = await axiosInstance.put("/admin/legal", map);
    return res.data.data as LegalContentMap;
  },
};
