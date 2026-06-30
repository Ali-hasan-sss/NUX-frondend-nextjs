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

export const refundAdminSubscription = createAsyncThunk<
  {
    refundId: string;
    amount: number;
    apologyIncluded?: boolean;
    notificationSent?: boolean;
    emailSent?: boolean;
  },
  { id: number | string; reason?: string; apologyMessage?: string; amount?: number },
  { rejectValue: string }
>("adminSubscriptions/refund", async ({ id, reason, apologyMessage, amount }, { rejectWithValue }) => {
  try {
    const result = await adminSubscriptionsService.refund(id, {
      reason,
      apologyMessage,
      amount,
    });
    return {
      refundId: result.refundId,
      amount: result.amount,
      apologyIncluded: result.apologyIncluded,
      notificationSent: result.notificationSent,
      emailSent: result.emailSent,
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? "Refund failed");
  }
});
