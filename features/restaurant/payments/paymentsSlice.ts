import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  RestaurantPayment,
  PaymentPagination,
  PaymentStats,
  PaymentsState,
} from "./paymentsTypes";
import { fetchPayments, fetchPaymentStats } from "./paymentsThunks";

const initialState: PaymentsState = {
  payments: [],
  pagination: null,
  stats: null,
  isLoading: false,
  error: null,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setPayments: (state, action: PayloadAction<RestaurantPayment[]>) => {
      state.payments = action.payload;
    },
    setPagination: (state, action: PayloadAction<PaymentPagination>) => {
      state.pagination = action.payload;
    },
    setStats: (state, action: PayloadAction<PaymentStats>) => {
      state.stats = action.payload;
    },
    clearData: (state) => {
      state.payments = [];
      state.pagination = null;
      state.stats = null;
      state.error = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch payments
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch payment stats
    builder
      .addCase(fetchPaymentStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  setPayments,
  setPagination,
  setStats,
  clearData,
  resetState,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
