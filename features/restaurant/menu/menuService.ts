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
        preparationTime: payload.preparationTime,
        extras: payload.extras,
        discountType: payload.discountType,
        discountValue: payload.discountValue,
        allergies: payload.allergies,
        calories: payload.calories,
        kitchenSectionId: payload.kitchenSectionId,
      }
    );
    return res.data?.data as MenuItem;
  },

  async updateItem(payload: UpdateItemPayload): Promise<MenuItem> {
    // Build body with only defined fields so optional extras/discount/allergies don't send null and fail validation
    const body: Record<string, unknown> = {};
    if (payload.title !== undefined) body.title = payload.title;
    if (payload.description !== undefined)
      body.description = payload.description;
    if (payload.price !== undefined) body.price = payload.price;
    if (
      payload.image !== undefined &&
      payload.image !== null &&
      payload.image !== ""
    )
      body.image = payload.image;
    if (
      payload.preparationTime !== undefined &&
      payload.preparationTime !== null
    )
      body.preparationTime = payload.preparationTime;
    if (payload.extras !== undefined && payload.extras !== null)
      body.extras = payload.extras;
    if (payload.discountType !== undefined && payload.discountType !== null)
      body.discountType = payload.discountType;
    if (payload.discountValue !== undefined && payload.discountValue !== null)
      body.discountValue = payload.discountValue;
    if (payload.allergies !== undefined)
      body.allergies = Array.isArray(payload.allergies)
        ? payload.allergies
        : [];
    if (payload.calories !== undefined && payload.calories !== null)
      body.calories = payload.calories;
    if (
      payload.kitchenSectionId !== undefined &&
      payload.kitchenSectionId !== null
    )
      body.kitchenSectionId = payload.kitchenSectionId;

    const res = await axiosInstance.put(
      `/restaurants/menu/items/${payload.itemId}`,
      body
    );
    return res.data?.data as MenuItem;
  },

  async deleteItem(itemId: number): Promise<void> {
    await axiosInstance.delete(`/restaurants/menu/items/${itemId}`);
  },

  async getKitchenSections(): Promise<any[]> {
    const res = await axiosInstance.get("/restaurants/kitchen-sections");
    return (res.data?.data ?? []) as any[];
  },

  async applyDiscountToAllMenu(
    discountType: "PERCENTAGE" | "AMOUNT",
    discountValue: number
  ): Promise<{ count: number }> {
    const res = await axiosInstance.post("/restaurants/menu/discount/all", {
      discountType,
      discountValue,
    });
    return res.data?.data ?? { count: 0 };
  },

  async applyDiscountToCategory(
    categoryId: number,
    discountType: "PERCENTAGE" | "AMOUNT",
    discountValue: number
  ): Promise<{ count: number }> {
    const res = await axiosInstance.post(
      `/restaurants/menu/discount/category/${categoryId}`,
      { discountType, discountValue }
    );
    return res.data?.data ?? { count: 0 };
  },
};
