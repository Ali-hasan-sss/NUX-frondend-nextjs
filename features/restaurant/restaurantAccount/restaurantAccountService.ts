import { axiosInstance } from "@/utils/axiosInstance";
import type {
  RestaurantAccountInfo,
  UpdateRestaurantAccountRequest,
} from "./restaurantAccountTypes";

export const restaurantAccountService = {
  async getMe(): Promise<RestaurantAccountInfo> {
    const response = await axiosInstance.get("/restaurants/account/me");
    return response.data.data as RestaurantAccountInfo;
  },

  async updateMe(
    payload: UpdateRestaurantAccountRequest
  ): Promise<RestaurantAccountInfo> {
    const response = await axiosInstance.put(
      "/restaurants/account/update",
      payload
    );
    return response.data.data as RestaurantAccountInfo;
  },

  async regenerateQr(): Promise<RestaurantAccountInfo> {
    const response = await axiosInstance.put(
      "/restaurants/account/qr/regenerate"
    );
    return response.data.data as RestaurantAccountInfo;
  },
};
