import { createAsyncThunk } from "@reduxjs/toolkit";
import { menuService } from "./menuService";
import { MenuCategory, MenuItem } from "./menuTypes";

// Fetch menu categories by QR code
export const fetchMenuCategories = createAsyncThunk<
  MenuCategory[],
  string,
  { rejectValue: string }
>("clientMenu/fetchCategories", async (qrCode, { rejectWithValue }) => {
  try {
    const response = await menuService.getCategoriesByQRCode(qrCode);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch menu categories"
    );
  }
});

// Fetch menu items by category
export const fetchMenuItems = createAsyncThunk<
  MenuItem[],
  number,
  { rejectValue: string }
>("clientMenu/fetchItems", async (categoryId, { rejectWithValue }) => {
  try {
    const response = await menuService.getItemsByCategory(categoryId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch menu items"
    );
  }
});
