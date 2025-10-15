import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminSubscriptionsService } from "./adminSubscriptionsService";
import type {
  ActivateSubscriptionPayload,
  AdminSubscription,
  AdminSubscriptionsResponse,
  FetchAdminSubscriptionsParams,
  CancelSubscriptionRequest,
} from "./adminSubscriptionsTypes";

export const fetchAdminSubscriptions = createAsyncThunk<
  AdminSubscriptionsResponse,
  FetchAdminSubscriptionsParams,
  { rejectValue: string }
>("adminSubscriptions/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await adminSubscriptionsService.getAll(params);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load subscriptions");
  }
});

export const cancelAdminSubscription = createAsyncThunk<
  AdminSubscription,
  { id: number | string; body: CancelSubscriptionRequest },
  { rejectValue: string }
>("adminSubscriptions/cancel", async ({ id, body }, { rejectWithValue }) => {
  try {
    return await adminSubscriptionsService.cancel(id, body);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to cancel subscription");
  }
});

export const adminActivateSubscription = createAsyncThunk<
  AdminSubscription,
  ActivateSubscriptionPayload,
  { rejectValue: string }
>("adminSubscriptions/activate", async (payload, { rejectWithValue }) => {
  try {
    return await adminSubscriptionsService.activate(payload);
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message ?? "Error activating subscription"
    );
  }
});
