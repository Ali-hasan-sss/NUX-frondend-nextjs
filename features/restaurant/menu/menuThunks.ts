import { createAsyncThunk } from "@reduxjs/toolkit";
import { menuService } from "./menuService";
import type {
  CreateCategoryPayload,
  CreateItemPayload,
  MenuCategory,
  MenuItem,
  UpdateCategoryPayload,
  UpdateItemPayload,
} from "./menuTypes";

const rejectPayload = (e: any, fallback: string) => ({
  message: e?.response?.data?.message ?? e?.message ?? fallback,
  code: e?.response?.data?.code ?? undefined,
});

// Categories
export const fetchMenuCategories = createAsyncThunk<
  MenuCategory[],
  void,
  { rejectValue: { message: string; code?: string } }
>("restaurantMenu/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    return await menuService.getCategories();
  } catch (e: any) {
    return rejectWithValue(rejectPayload(e, "Failed to load categories"));
  }
});

export const createMenuCategory = createAsyncThunk<
  MenuCategory,
  CreateCategoryPayload,
  { rejectValue: string }
>("restaurantMenu/createCategory", async (payload, { rejectWithValue }) => {
  try {
    return await menuService.createCategory(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to create category");
  }
});

export const updateMenuCategory = createAsyncThunk<
  MenuCategory,
  UpdateCategoryPayload,
  { rejectValue: string }
>("restaurantMenu/updateCategory", async (payload, { rejectWithValue }) => {
  try {
    return await menuService.updateCategory(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to update category");
  }
});

export const deleteMenuCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("restaurantMenu/deleteCategory", async (categoryId, { rejectWithValue }) => {
  try {
    await menuService.deleteCategory(categoryId);
    return categoryId;
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to delete category");
  }
});

// Items
export const fetchItemsByCategory = createAsyncThunk<
  { categoryId: number; items: MenuItem[] },
  number,
  { rejectValue: { message: string; code?: string } }
>(
  "restaurantMenu/fetchItemsByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const items = await menuService.getItemsByCategory(categoryId);
      return { categoryId, items };
    } catch (e: any) {
      return rejectWithValue(rejectPayload(e, "Failed to load items"));
    }
  }
);

export const createMenuItemThunk = createAsyncThunk<
  MenuItem,
  CreateItemPayload,
  { rejectValue: string }
>("restaurantMenu/createItem", async (payload, { rejectWithValue }) => {
  try {
    return await menuService.createItem(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to create item");
  }
});

export const updateMenuItemThunk = createAsyncThunk<
  MenuItem,
  UpdateItemPayload,
  { rejectValue: string }
>("restaurantMenu/updateItem", async (payload, { rejectWithValue }) => {
  try {
    return await menuService.updateItem(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to update item");
  }
});

export const deleteMenuItemThunk = createAsyncThunk<
  { categoryId: number; itemId: number },
  { categoryId: number; itemId: number },
  { rejectValue: string }
>(
  "restaurantMenu/deleteItem",
  async ({ categoryId, itemId }, { rejectWithValue }) => {
    try {
      await menuService.deleteItem(itemId);
      return { categoryId, itemId };
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Failed to delete item");
    }
  }
);

// Kitchen Sections
export const fetchKitchenSections = createAsyncThunk<
  any[],
  void,
  { rejectValue: { message: string; code?: string } }
>("restaurantMenu/fetchKitchenSections", async (_, { rejectWithValue }) => {
  try {
    return await menuService.getKitchenSections();
  } catch (e: any) {
    return rejectWithValue(rejectPayload(e, "Failed to load kitchen sections"));
  }
});

// Apply discount to all menu items
export const applyDiscountToAllMenuThunk = createAsyncThunk<
  { count: number },
  { discountType: "PERCENTAGE" | "AMOUNT"; discountValue: number },
  { rejectValue: string }
>(
  "restaurantMenu/applyDiscountToAll",
  async (payload, { rejectWithValue }) => {
    try {
      return await menuService.applyDiscountToAllMenu(
        payload.discountType,
        payload.discountValue
      );
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? e?.message ?? "Failed to apply discount"
      );
    }
  }
);

// Apply discount to category items
export const applyDiscountToCategoryThunk = createAsyncThunk<
  { count: number },
  { categoryId: number; discountType: "PERCENTAGE" | "AMOUNT"; discountValue: number },
  { rejectValue: string }
>(
  "restaurantMenu/applyDiscountToCategory",
  async (payload, { rejectWithValue }) => {
    try {
      return await menuService.applyDiscountToCategory(
        payload.categoryId,
        payload.discountType,
        payload.discountValue
      );
    } catch (e: any) {
      return rejectWithValue(
        e?.response?.data?.message ?? e?.message ?? "Failed to apply discount"
      );
    }
  }
);
