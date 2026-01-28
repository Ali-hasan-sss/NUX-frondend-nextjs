import { axiosInstance } from "@/utils/axiosInstance";

export const seedService = {
  async seedMenuData(): Promise<{ success: boolean; message: string; data: { categories: number; items: number } }> {
    const res = await axiosInstance.post("/restaurants/menu/seed");
    return res.data;
  },
};
