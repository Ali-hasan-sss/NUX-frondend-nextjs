import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MenuState, MenuCategory } from "./menuTypes";
import { fetchMenuCategories, fetchMenuItems } from "./menuThunks";

const initialState: MenuState = {
  categories: [],
  items: [],
  selectedCategory: null,
  currentRestaurantId: null,
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
        state.categories = action.payload;
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
        state.items = action.payload;
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
