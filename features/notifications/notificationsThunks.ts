import { createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsService } from "./notificationsService";
import type {
  FetchNotificationsParams,
  NotificationsResponse,
  NotificationItem,
} from "./notificationsTypes";

// Fetch paginated notifications
export const fetchNotifications = createAsyncThunk<
  NotificationsResponse,
  FetchNotificationsParams,
  { rejectValue: string }
>("notifications/fetch", async (params, { rejectWithValue }) => {
  try {
    return await notificationsService.getAll(params);
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Failed to fetch notifications");
  }
});

// Mark one notification as read
export const markNotificationRead = createAsyncThunk<
  NotificationItem,
  number | string,
  { rejectValue: string }
>("notifications/markRead", async (id, { rejectWithValue }) => {
  try {
    return await notificationsService.markRead(id);
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Failed to mark as read");
  }
});

// Mark all as read
export const markAllNotificationsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("notifications/markAllRead", async (_, { rejectWithValue }) => {
  try {
    await notificationsService.markAllRead();
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Failed to mark all as read");
  }
});

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>("notifications/unreadCount", async (_, { rejectWithValue }) => {
  try {
    return await notificationsService.getUnreadCount();
  } catch (err: any) {
    return rejectWithValue(err?.message ?? "Failed to fetch unread count");
  }
});
