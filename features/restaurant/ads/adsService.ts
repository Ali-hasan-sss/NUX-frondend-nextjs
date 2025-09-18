import { axiosInstance } from "@/utils/axiosInstance";
import type {
  CreateAdPayload,
  RestaurantAd,
  UpdateAdPayload,
} from "./adsTypes";

export const adsService = {
  async listMy(): Promise<RestaurantAd[]> {
    const res = await axiosInstance.get("/restaurants/ads/my");
    return res.data?.data ?? [];
  },

  async create(data: CreateAdPayload): Promise<RestaurantAd> {
    const res = await axiosInstance.post("/restaurants/ads", data);
    return res.data?.data as RestaurantAd;
  },

  async update(payload: UpdateAdPayload): Promise<RestaurantAd> {
    const res = await axiosInstance.put(
      `/restaurants/ads/${payload.id}`,
      payload
    );
    return res.data?.data as RestaurantAd;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`/restaurants/ads/${id}`);
  },
};
