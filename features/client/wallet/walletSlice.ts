import { createSlice } from "@reduxjs/toolkit";
import type { WalletState } from "./walletTypes";
import {
  fetchWalletBalance,
  fetchWalletTransactions,
  createWalletTopUpIntent,
  payRestaurantWithWallet,
  requestWalletWithdrawal,
} from "./walletThunks";

const initialState: WalletState = {
  balance: null,
  transactions: [],
  transactionsCursor: null,
  hasMoreTransactions: true,
  loading: {
    balance: false,
    transactions: false,
    topUpIntent: false,
    pay: false,
    withdraw: false,
  },
  error: {
    balance: null,
    transactions: null,
    topUpIntent: null,
    pay: null,
    withdraw: null,
  },
};

const walletSlice = createSlice({
  name: "clientWallet",
  initialState,
  reducers: {
    clearWalletErrors: (state) => {
      state.error = {
        balance: null,
        transactions: null,
        topUpIntent: null,
        pay: null,
        withdraw: null,
      };
    },
    resetWalletTransactions: (state) => {
      state.transactions = [];
      state.transactionsCursor = null;
      state.hasMoreTransactions = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading.balance = true;
        state.error.balance = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading.balance = false;
        state.balance = action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading.balance = false;
        state.error.balance = action.payload ?? "Error";
      });

    builder
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.loading.transactions = true;
        state.error.transactions = null;
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.loading.transactions = false;
        const { items, append } = action.payload;
        if (append) {
          state.transactions = [...state.transactions, ...items];
        } else {
          state.transactions = items;
        }
        const last = items[items.length - 1];
        state.transactionsCursor = last?.id ?? null;
        state.hasMoreTransactions = items.length >= (action.meta.arg.take ?? 20);
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error.transactions = action.payload ?? "Error";
      });

    builder
      .addCase(createWalletTopUpIntent.pending, (state) => {
        state.loading.topUpIntent = true;
        state.error.topUpIntent = null;
      })
      .addCase(createWalletTopUpIntent.fulfilled, (state) => {
        state.loading.topUpIntent = false;
      })
      .addCase(createWalletTopUpIntent.rejected, (state, action) => {
        state.loading.topUpIntent = false;
        state.error.topUpIntent = action.payload ?? "Error";
      });

    builder
      .addCase(payRestaurantWithWallet.pending, (state) => {
        state.loading.pay = true;
        state.error.pay = null;
      })
      .addCase(payRestaurantWithWallet.fulfilled, (state) => {
        state.loading.pay = false;
      })
      .addCase(payRestaurantWithWallet.rejected, (state, action) => {
        state.loading.pay = false;
        state.error.pay = action.payload ?? "Error";
      });

    builder
      .addCase(requestWalletWithdrawal.pending, (state) => {
        state.loading.withdraw = true;
        state.error.withdraw = null;
      })
      .addCase(requestWalletWithdrawal.fulfilled, (state) => {
        state.loading.withdraw = false;
      })
      .addCase(requestWalletWithdrawal.rejected, (state, action) => {
        state.loading.withdraw = false;
        state.error.withdraw = action.payload ?? "Error";
      });
  },
});

export const { clearWalletErrors, resetWalletTransactions } = walletSlice.actions;
export default walletSlice.reducer;
