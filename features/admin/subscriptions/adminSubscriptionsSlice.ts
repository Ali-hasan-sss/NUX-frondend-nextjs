import { createSlice } from "@reduxjs/toolkit";
import type { AdminSubscriptionsState } from "./adminSubscriptionsTypes";
import {
  fetchAdminSubscriptions,
  cancelAdminSubscription,
  adminActivateSubscription,
} from "./adminSubscriptionsThunks";

const initialState: AdminSubscriptionsState = {
  items: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  },
  statistics: {
    active: 0,
    cancelled: 0,
    expired: 0,
    totalValue: 0,
  },
  isLoading: false,
  error: null,
};

const adminSubscriptionsSlice = createSlice({
  name: "adminSubscriptions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAdminSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
        state.statistics = action.payload.statistics;
      })
      .addCase(fetchAdminSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error fetching subscriptions";
      })

      // Cancel subscription
      .addCase(cancelAdminSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelAdminSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.map((s) =>
          s.id === action.payload.id ? action.payload : s
        );
      })
      .addCase(cancelAdminSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error cancelling subscription";
      })

      // Activate subscription
      .addCase(adminActivateSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminActivateSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(
          (sub) => sub.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(adminActivateSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminSubscriptionsSlice.reducer;
