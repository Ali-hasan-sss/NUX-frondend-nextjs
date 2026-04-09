import { createAsyncThunk } from "@reduxjs/toolkit";
import { walletService } from "./walletService";
import type {
  WalletBalanceData,
  WalletLedgerEntry,
  PayRestaurantPayload,
  WithdrawalPayload,
} from "./walletTypes";

export const fetchWalletBalance = createAsyncThunk<
  WalletBalanceData,
  void,
  { rejectValue: string }
>("wallet/fetchBalance", async (_, { rejectWithValue }) => {
  try {
    return await walletService.getBalance();
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Failed to load wallet";
    return rejectWithValue(msg);
  }
});

export const fetchWalletTransactions = createAsyncThunk<
  { items: WalletLedgerEntry[]; append: boolean },
  { take?: number; cursor?: string; append?: boolean },
  { rejectValue: string }
>("wallet/fetchTransactions", async ({ take = 20, cursor, append = false }, { rejectWithValue }) => {
  try {
    const items = await walletService.getTransactions(take, cursor);
    return { items, append: Boolean(append) };
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Failed to load transactions";
    return rejectWithValue(msg);
  }
});

export const createWalletTopUpIntent = createAsyncThunk<
  { clientSecret: string | null; paymentIntentId: string },
  number,
  { rejectValue: string }
>("wallet/createTopUpIntent", async (amountEur, { rejectWithValue }) => {
  try {
    return await walletService.createTopUpPaymentIntent(amountEur);
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Failed to start payment";
    return rejectWithValue(msg);
  }
});

export const syncWalletTopUpAfterPayment = createAsyncThunk<
  { applied: boolean; duplicate?: boolean },
  string,
  { rejectValue: string }
>("wallet/syncTopUpAfterPayment", async (paymentIntentId, { rejectWithValue }) => {
  try {
    return await walletService.syncTopUpAfterPayment(paymentIntentId);
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Failed to sync wallet";
    return rejectWithValue(msg);
  }
});

export const payRestaurantWithWallet = createAsyncThunk<
  { userBalanceAfter: string },
  PayRestaurantPayload,
  { rejectValue: string }
>("wallet/payRestaurant", async (payload, { rejectWithValue }) => {
  try {
    return await walletService.payRestaurant(payload);
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Payment failed";
    return rejectWithValue(msg);
  }
});

export const requestWalletWithdrawal = createAsyncThunk<
  { id: string },
  WithdrawalPayload,
  { rejectValue: string }
>("wallet/requestWithdrawal", async (payload, { rejectWithValue }) => {
  try {
    return await walletService.requestWithdrawal(payload);
  } catch (e: unknown) {
    const msg =
      (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Withdrawal request failed";
    return rejectWithValue(msg);
  }
});
