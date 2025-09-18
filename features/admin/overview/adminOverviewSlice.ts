import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminOverviewStats,
  RecentActivity,
  AdminOverviewState,
} from "./adminOverviewTypes";
import { fetchAdminOverview } from "./adminOverviewThunks";

const initialState: AdminOverviewState = {
  stats: null,
  recentActivities: [],
  isLoading: false,
  error: null,
};

const adminOverviewSlice = createSlice({
  name: "adminOverview",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setStats: (state, action: PayloadAction<AdminOverviewStats>) => {
      state.stats = action.payload;
    },
    setRecentActivities: (state, action: PayloadAction<RecentActivity[]>) => {
      state.recentActivities = action.payload;
    },
    clearData: (state) => {
      state.stats = null;
      state.recentActivities = [];
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch admin overview
    builder
      .addCase(fetchAdminOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.recentActivities = action.payload.recentActivities;
        state.error = null;
      })
      .addCase(fetchAdminOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setStats,
  setRecentActivities,
  clearData,
  resetState,
} = adminOverviewSlice.actions;

export default adminOverviewSlice.reducer;
