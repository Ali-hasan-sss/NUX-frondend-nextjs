import axios from "axios";
import { PublicPlan, PublicPlansApiResponse } from "./publicPlansTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// API endpoints
const ENDPOINTS = {
  PLANS: `${API_BASE_URL}/plans`,
  PLAN_BY_ID: (id: number) => `${API_BASE_URL}/plans/${id}`,
} as const;

/**
 * Get all available plans
 */
export const getPublicPlans = async (): Promise<PublicPlan[]> => {
  try {
    const response = await axios.get(ENDPOINTS.PLANS);

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
export const getPublicPlanById = async (id: number): Promise<PublicPlan> => {
  try {
    const response = await axios.get(ENDPOINTS.PLAN_BY_ID(id));

    if (response.data.success) {
      return response.data.data as PublicPlan;
    }

    throw new Error(response.data.message || "Plan not found");
  } catch (error) {
    console.error("Error fetching plan:", error);
    throw error;
  }
};
