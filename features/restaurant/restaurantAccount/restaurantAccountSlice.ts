import { createSlice } from "@reduxjs/toolkit";
import type { RestaurantAccountState } from "./restaurantAccountTypes";
import {
  fetchRestaurantAccount,
  regenerateRestaurantQr,
  updateRestaurantAccount,
} from "./restaurantAccountThunks";

const initialState: RestaurantAccountState = {
  data: null,
  isLoading: false,
  error: null,
};

export const restaurantAccountSlice = createSlice({
  name: "restaurantAccount",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchRestaurantAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchRestaurantAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })
      // update
      .addCase(updateRestaurantAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRestaurantAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateRestaurantAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })
      // regenerate QR
      .addCase(regenerateRestaurantQr.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(regenerateRestaurantQr.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(regenerateRestaurantQr.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      });
  },
});

export default restaurantAccountSlice.reducer;
