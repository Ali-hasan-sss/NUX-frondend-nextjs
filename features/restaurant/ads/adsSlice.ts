import { createSlice } from "@reduxjs/toolkit";
import type { RestaurantAdsState, RestaurantAd } from "./adsTypes";
import {
  createAdThunk,
  deleteAdThunk,
  fetchMyAds,
  updateAdThunk,
} from "./adsThunks";

const initialState: RestaurantAdsState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

export const adsSlice = createSlice({
  name: "restaurantAds",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyAds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyAds.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(createAdThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })

      .addCase(updateAdThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex(
          (a: RestaurantAd) => a.id === action.payload.id
        );
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id)
          state.selected = action.payload;
      })

      .addCase(deleteAdThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((a) => a.id !== id);
        if (state.selected?.id === id) state.selected = null;
      });
  },
});

export default adsSlice.reducer;
