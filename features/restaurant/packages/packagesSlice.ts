import { createSlice } from "@reduxjs/toolkit";
import type {
  RestaurantPackagesState,
  RestaurantPackage,
} from "./packagesTypes";
import {
  createPackageThunk,
  deletePackageThunk,
  fetchPackageById,
  fetchPackages,
  updatePackageThunk,
} from "./packagesThunks";

const initialState: RestaurantPackagesState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
  errorCode: null,
};

export const packagesSlice = createSlice({
  name: "restaurantPackages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.isLoading = false;
        const p = action.payload as { message?: string; code?: string } | undefined;
        state.error = p?.message ?? action.error.message ?? null;
        state.errorCode = p?.code ?? null;
      })

      .addCase(fetchPackageById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })

      .addCase(createPackageThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      .addCase(updatePackageThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (p: RestaurantPackage) => p.id === action.payload.id
        );
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id)
          state.selected = action.payload;
      })

      .addCase(deletePackageThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((p) => p.id !== id);
        if (state.selected?.id === id) state.selected = null;
      });
  },
});

export default packagesSlice.reducer;
