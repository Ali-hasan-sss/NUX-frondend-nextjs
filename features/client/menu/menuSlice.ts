import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuState, MenuCategory, MenuRestaurantInfo } from "./menuTypes";
import { fetchMenuCategories, fetchMenuItems } from "./menuThunks";

const initialState: MenuState = {
  categories: [],
  items: [],
  selectedCategory: null,
  currentRestaurantId: null,
  restaurant: null,
  currency: null,
  loading: {
    categories: false,
    items: false,
  },
  error: {
    categories: null,
    items: null,
  },
};

const menuSlice = createSlice({
  name: "clientMenu",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = {
        categories: null,
        items: null,
      };
    },
    clearMenu: (state) => {
      state.categories = [];
      state.items = [];
      state.selectedCategory = null;
      state.currentRestaurantId = null;
      state.restaurant = null;
      state.currency = null;
    },
    setSelectedCategory: (
      state,
      action: PayloadAction<MenuCategory | null>
    ) => {
      state.selectedCategory = action.payload;
    },
    setCurrentRestaurantId: (state, action: PayloadAction<string | null>) => {
      state.currentRestaurantId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch menu categories
    builder
      .addCase(fetchMenuCategories.pending, (state) => {
        state.loading.categories = true;
        state.error.categories = null;
      })
      .addCase(fetchMenuCategories.fulfilled, (state, action) => {
        state.loading.categories = false;
        const payload = action.payload;
        state.categories = payload.data ?? [];
        state.restaurant = payload.restaurant ?? null;
        state.currency = payload.currency ?? state.currency ?? null;
        state.error.categories = null;
      })
      .addCase(fetchMenuCategories.rejected, (state, action) => {
        state.loading.categories = false;
        state.error.categories = action.payload || "Failed to fetch categories";
      });

    // Fetch menu items
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading.items = true;
        state.error.items = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading.items = false;
        const payload = action.payload;
        state.items = Array.isArray(payload) ? payload : (payload?.data ?? []);
        state.currency = (payload as any)?.currency ?? state.currency ?? null;
        state.error.items = null;
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading.items = false;
        state.error.items = action.payload || "Failed to fetch items";
      });
  },
});

export const {
  clearErrors,
  clearMenu,
  setSelectedCategory,
  setCurrentRestaurantId,
} = menuSlice.actions;
export default menuSlice.reducer;
