import { axiosInstance } from "@/utils/axiosInstance";
import type {
  CreateCategoryPayload,
  CreateItemPayload,
  MenuCategory,
  MenuItem,
  UpdateCategoryPayload,
  UpdateItemPayload,
} from "./menuTypes";

export const menuService = {
  async getCategories(): Promise<MenuCategory[]> {
    const res = await axiosInstance.get("/restaurants/menu");
    return (res.data?.data ?? []) as MenuCategory[];
  },

  async createCategory(payload: CreateCategoryPayload): Promise<MenuCategory> {
    const res = await axiosInstance.post(
      "/restaurants/menu/categories",
      payload
    );
    return res.data?.data as MenuCategory;
  },

  async updateCategory(payload: UpdateCategoryPayload): Promise<MenuCategory> {
    const res = await axiosInstance.put(
      `/restaurants/menu/categories/${payload.categoryId}`,
      {
        title: payload.title,
        description: payload.description,
        image: payload.image,
      }
    );
    return res.data?.data as MenuCategory;
  },

  async deleteCategory(categoryId: number): Promise<void> {
    await axiosInstance.delete(`/restaurants/menu/categories/${categoryId}`);
  },

  async getItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    const res = await axiosInstance.get(
      `/restaurants/menu/items/${categoryId}`
    );
    return (res.data?.data ?? []) as MenuItem[];
  },

  async createItem(payload: CreateItemPayload): Promise<MenuItem> {
    const res = await axiosInstance.post(
      `/restaurants/menu/items/${payload.categoryId}`,
      {
        title: payload.title,
        description: payload.description,
        price: payload.price,
        image: payload.image,
      }
    );
    return res.data?.data as MenuItem;
  },

  async updateItem(payload: UpdateItemPayload): Promise<MenuItem> {
    const res = await axiosInstance.put(
      `/restaurants/menu/items/${payload.itemId}`,
      {
        title: payload.title,
        description: payload.description,
        price: payload.price,
        image: payload.image,
      }
    );
    return res.data?.data as MenuItem;
  },

  async deleteItem(itemId: number): Promise<void> {
    await axiosInstance.delete(`/restaurants/menu/items/${itemId}`);
  },
};
