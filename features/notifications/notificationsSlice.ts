import { createSlice } from "@reduxjs/toolkit";
import type { NotificationsState } from "./notificationsTypes";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "./notificationsThunks";

const initialState: NotificationsState = {
  items: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  },
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Error fetching notifications";
      })

      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      .addCase(markNotificationRead.fulfilled, (state, action) => {
        // Update read state for a single notification
        state.items = state.items.map((n) =>
          n.id === action.payload.id ? { ...n, isRead: true } : n
        );
        if (state.unreadCount > 0) state.unreadCount -= 1;
      })

      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        // Mark all as read locally
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export default notificationsSlice.reducer;
