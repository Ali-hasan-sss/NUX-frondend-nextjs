import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  RestaurantInfo,
  RestaurantOverviewStats,
  RecentActivity,
  RestaurantOverviewState,
} from "./restaurantOverviewTypes";
import { fetchRestaurantOverview } from "./restaurantOverviewThunks";

const initialState: RestaurantOverviewState = {
  restaurant: null,
  stats: null,
  recentActivities: [],
  isLoading: false,
  error: null,
};

const restaurantOverviewSlice = createSlice({
  name: "restaurantOverview",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setRestaurant: (state, action: PayloadAction<RestaurantInfo>) => {
      state.restaurant = action.payload;
    },
    setStats: (state, action: PayloadAction<RestaurantOverviewStats>) => {
      state.stats = action.payload;
    },
    setRecentActivities: (state, action: PayloadAction<RecentActivity[]>) => {
      state.recentActivities = action.payload;
    },
    clearData: (state) => {
      state.restaurant = null;
      state.stats = null;
      state.recentActivities = [];
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch restaurant overview
    builder
      .addCase(fetchRestaurantOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.restaurant = action.payload.restaurant;
        state.stats = action.payload.stats;
        state.recentActivities = action.payload.recentActivities;
        state.error = null;
      })
      .addCase(fetchRestaurantOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setRestaurant,
  setStats,
  setRecentActivities,
  clearData,
  resetState,
} = restaurantOverviewSlice.actions;

export default restaurantOverviewSlice.reducer;
