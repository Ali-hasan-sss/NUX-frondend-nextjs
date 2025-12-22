import { axiosInstance } from "@/utils/axiosInstance";
import { AdsResponse, AdsFilters } from "./adsTypes";

export const adsService = {
  // Get all ads with filters and pagination (for users)
  async getAds(filters: AdsFilters = {}): Promise<AdsResponse> {
    try {
      const params: any = {
        page: filters.page || 1,
        pageSize: filters.pageSize || 10,
      };

      // Add search query
      if (filters.search?.trim()) {
        params.search = filters.search.trim();
      }

      // Add category filter
      if (filters.category) {
        params.category = filters.category;
      }

      // Add location filters
      if (
        filters.lat !== undefined &&
        filters.lng !== undefined &&
        filters.radius !== undefined
      ) {
        params.lat = filters.lat;
        params.lng = filters.lng;
        params.radius = filters.radius;
      }

      const response = await axiosInstance.get<AdsResponse>("/ads", { params });
      return response.data;
    } catch (error: any) {
      console.error("❌ Error fetching ads:", error);
      throw error;
    }
  },
};

