import { createSlice } from "@reduxjs/toolkit";
import type { WalletPaymentsState } from "./walletPaymentsTypes";
import { fetchWalletPaymentsData } from "./walletPaymentsThunks";

const initialState: WalletPaymentsState = {
  entries: [],
  pagination: null,
  stats: null,
  currency: "EUR",
  isLoading: false,
  error: null,
};

const walletPaymentsSlice = createSlice({
  name: "walletPayments",
  initialState,
  reducers: {
    clearWalletPayments: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletPaymentsData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletPaymentsData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload.report.entries;
        state.pagination = action.payload.report.pagination;
        state.currency = action.payload.report.currency;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchWalletPaymentsData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Error";
      });
  },
});

export const { clearWalletPayments } = walletPaymentsSlice.actions;
export default walletPaymentsSlice.reducer;
