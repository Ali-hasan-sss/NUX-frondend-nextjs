import { createSlice } from "@reduxjs/toolkit";
import type {
  AdminRestaurantsState,
  AdminRestaurant,
} from "./adminRestaurantsTypes";
import {
  fetchAdminRestaurants,
  fetchAdminRestaurantById,
  createAdminRestaurant,
  createRestaurantWithOwner,
  updateAdminRestaurant,
  deleteAdminRestaurant,
} from "./adminRestaurantsThunks";

const initialState: AdminRestaurantsState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
  pagination: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
  },
};

const adminRestaurantsSlice = createSlice({
  name: "adminRestaurants",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(fetchAdminRestaurantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminRestaurantById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchAdminRestaurantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(createAdminRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdminRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createAdminRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(createRestaurantWithOwner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRestaurantWithOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.pagination.totalItems = (state.pagination.totalItems ?? 0) + 1;
      })
      .addCase(createRestaurantWithOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(updateAdminRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        const index = state.items.findIndex(
          (r: AdminRestaurant) => r.id === updated.id
        );
        if (index !== -1) state.items[index] = updated;
        if (state.selected?.id === updated.id) state.selected = updated;
      })
      .addCase(updateAdminRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(deleteAdminRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdminRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((r) => r.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteAdminRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      });
  },
});

export default adminRestaurantsSlice.reducer;
