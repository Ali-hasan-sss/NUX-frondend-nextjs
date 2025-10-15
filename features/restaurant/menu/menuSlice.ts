import { createSlice } from "@reduxjs/toolkit";
import type { RestaurantMenuState, MenuCategory, MenuItem } from "./menuTypes";
import {
  createMenuCategory,
  createMenuItemThunk,
  deleteMenuCategory,
  deleteMenuItemThunk,
  fetchItemsByCategory,
  fetchMenuCategories,
  updateMenuCategory,
  updateMenuItemThunk,
} from "./menuThunks";

const initialState: RestaurantMenuState = {
  categories: [],
  itemsByCategory: {},
  isLoading: false,
  error: null,
};

export const menuSlice = createSlice({
  name: "restaurantMenu",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchMenuCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMenuCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchMenuCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createMenuCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateMenuCategory.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.categories.findIndex(
          (c: MenuCategory) => c.id === updated.id
        );
        if (idx !== -1) state.categories[idx] = updated;
      })
      .addCase(deleteMenuCategory.fulfilled, (state, action) => {
        const id = action.payload;
        state.categories = state.categories.filter((c) => c.id !== id);
        delete state.itemsByCategory[id];
      })

      // Items
      .addCase(fetchItemsByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItemsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const { categoryId, items } = action.payload;
        state.itemsByCategory[categoryId] = items;
      })
      .addCase(fetchItemsByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(createMenuItemThunk.fulfilled, (state, action) => {
        const item = action.payload;
        const list = state.itemsByCategory[item.categoryId] ?? [];
        state.itemsByCategory[item.categoryId] = [...list, item];
      })
      .addCase(updateMenuItemThunk.fulfilled, (state, action) => {
        const item = action.payload;
        const list = state.itemsByCategory[item.categoryId] ?? [];
        const idx = list.findIndex((i: MenuItem) => i.id === item.id);
        if (idx !== -1) list[idx] = item;
        state.itemsByCategory[item.categoryId] = [...list];
      })
      .addCase(deleteMenuItemThunk.fulfilled, (state, action) => {
        const { categoryId, itemId } = action.payload;
        const list = state.itemsByCategory[categoryId] ?? [];
        state.itemsByCategory[categoryId] = list.filter((i) => i.id !== itemId);
      });
  },
});

export default menuSlice.reducer;
