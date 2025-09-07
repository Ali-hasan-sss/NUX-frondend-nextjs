import { axiosInstance } from "@/utils/axiosInstance";
import type {
  CreatePackagePayload,
  RestaurantPackage,
  UpdatePackagePayload,
} from "./packagesTypes";

export const packagesService = {
  async list(): Promise<RestaurantPackage[]> {
    const res = await axiosInstance.get("/restaurants/packages");
    return res.data?.data ?? [];
  },

  async getById(id: number): Promise<RestaurantPackage> {
    const res = await axiosInstance.get(`/restaurants/packages/${id}`);
    return res.data?.data as RestaurantPackage;
  },

  async create(data: CreatePackagePayload): Promise<RestaurantPackage> {
    const res = await axiosInstance.post(`/restaurants/packages`, data);
    return res.data?.data as RestaurantPackage;
  },

  async update(payload: UpdatePackagePayload): Promise<RestaurantPackage> {
    const res = await axiosInstance.put(
      `/restaurants/packages/${payload.id}`,
      payload
    );
    return res.data?.data as RestaurantPackage;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`/restaurants/packages/${id}`);
  },
};
