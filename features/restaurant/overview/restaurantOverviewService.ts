import { axiosInstance } from "@/utils/axiosInstance";
import { RestaurantOverviewResponse } from "./restaurantOverviewTypes";

const API_URL = "/restaurants/overview";

export const restaurantOverviewService = {
  // Get restaurant overview statistics
  async getOverview(): Promise<RestaurantOverviewResponse> {
    const response = await axiosInstance.get(API_URL);
    const data = response.data.data;

    // Extract restaurant, stats and recentActivities from the response
    const { restaurant, stats, recentActivities } = data;

    return {
      restaurant,
      stats,
      recentActivities,
    };
  },
};
