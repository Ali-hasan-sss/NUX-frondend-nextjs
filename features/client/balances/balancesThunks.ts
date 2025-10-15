import { createAsyncThunk } from "@reduxjs/toolkit";
import { balancesService } from "./balancesService";
import {
  UserRestaurantBalance,
  Package,
  QrScanData,
  PaymentData,
  GiftData,
} from "./balancesTypes";

// Fetch user balances
export const fetchUserBalances = createAsyncThunk<
  UserRestaurantBalance[],
  void,
  { rejectValue: string }
>("balances/fetchUserBalances", async (_, { rejectWithValue }) => {
  try {
    const response = await balancesService.getUserBalances();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch balances"
    );
  }
});

// Scan QR code
export const scanQrCode = createAsyncThunk<
  any,
  QrScanData,
  { rejectValue: string }
>("balances/scanQrCode", async (data, { rejectWithValue }) => {
  try {
    const response = await balancesService.scanQrCode(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to scan QR code"
    );
  }
});

// Pay at restaurant
export const payAtRestaurant = createAsyncThunk<
  any,
  PaymentData,
  { rejectValue: string }
>("balances/payAtRestaurant", async (data, { rejectWithValue }) => {
  try {
    const response = await balancesService.payAtRestaurant(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to process payment"
    );
  }
});

// Gift balance to friend
export const giftBalance = createAsyncThunk<
  any,
  GiftData,
  { rejectValue: string }
>("balances/giftBalance", async (data, { rejectWithValue }) => {
  try {
    const response = await balancesService.giftBalance(data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to gift balance"
    );
  }
});

// Fetch public packages
export const fetchPublicPackages = createAsyncThunk<
  Package[],
  string,
  { rejectValue: string }
>("balances/fetchPublicPackages", async (restaurantId, { rejectWithValue }) => {
  try {
    const response = await balancesService.getPublicPackages(restaurantId);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch packages"
    );
  }
});
