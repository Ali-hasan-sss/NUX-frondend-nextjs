import axios from "axios";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { planLangCode } from "./planDescription";
import { PublicPlan } from "./publicPlansTypes";

function plansUrl(path = ""): string {
  return `${getApiBaseUrl()}/plans${path}`;
}

function langParams(lang?: string) {
  const code = planLangCode(lang);
  return {
    params: { lang: code },
    headers: { "Accept-Language": code },
  };
}

/**
 * Get all available plans
 */
export const getPublicPlans = async (lang?: string): Promise<PublicPlan[]> => {
  try {
    const response = await axios.get(plansUrl(), langParams(lang));

    if (response.data.success) {
      return response.data.data as PublicPlan[];
    }

    throw new Error(response.data.message || "Failed to fetch plans");
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

/**
 * Get a specific plan by ID
 */
export const getPublicPlanById = async (
  id: number,
  lang?: string,
): Promise<PublicPlan> => {
  try {
    const response = await axios.get(plansUrl(`/${id}`), langParams(lang));

    if (response.data.success) {
      return response.data.data as PublicPlan;
    }

    throw new Error(response.data.message || "Plan not found");
  } catch (error) {
    console.error("Error fetching plan:", error);
    throw error;
  }
};
