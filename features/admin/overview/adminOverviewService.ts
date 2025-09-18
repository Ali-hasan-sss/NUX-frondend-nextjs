import { axiosInstance } from "@/utils/axiosInstance";
import { AdminOverviewResponse } from "./adminOverviewTypes";

const API_URL = "/admin/overview";

export const adminOverviewService = {
  // Get admin overview statistics
  async getOverview(): Promise<AdminOverviewResponse> {
    const response = await axiosInstance.get(API_URL);
    const data = response.data.data;

    // Extract stats and recentActivities from the response
    const { recentActivities, ...stats } = data;

    return {
      stats,
      recentActivities,
    };
  },
};
