import { createAsyncThunk } from "@reduxjs/toolkit";
import { paymentsService } from "./paymentsService";
import {
  PaymentsResponse,
  PaymentStats,
  FetchPaymentsParams,
  FetchPaymentStatsParams,
} from "./paymentsTypes";

// Fetch restaurant payments with filtering and pagination
export const fetchPayments = createAsyncThunk<
  PaymentsResponse,
  FetchPaymentsParams,
  { rejectValue: string }
>("payments/fetchPayments", async (params, { rejectWithValue }) => {
  try {
    const response = await paymentsService.getPayments(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch payments"
    );
  }
});

// Fetch payment statistics
export const fetchPaymentStats = createAsyncThunk<
  PaymentStats,
  FetchPaymentStatsParams,
  { rejectValue: string }
>("payments/fetchPaymentStats", async (params, { rejectWithValue }) => {
  try {
    const response = await paymentsService.getPaymentStats(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch payment statistics"
    );
  }
});
