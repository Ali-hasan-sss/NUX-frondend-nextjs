import { createAsyncThunk } from "@reduxjs/toolkit";
import { restaurantAccountService } from "./restaurantAccountService";
import type {
  RestaurantAccountInfo,
  UpdateRestaurantAccountRequest,
} from "./restaurantAccountTypes";

export const fetchRestaurantAccount = createAsyncThunk<
  RestaurantAccountInfo,
  void,
  { rejectValue: string }
>("restaurantAccount/fetchMe", async (_, { rejectWithValue }) => {
  try {
    return await restaurantAccountService.getMe();
  } catch (error: any) {
    return rejectWithValue(error?.message ?? "Failed to load restaurant info");
  }
});

export const updateRestaurantAccount = createAsyncThunk<
  RestaurantAccountInfo,
  UpdateRestaurantAccountRequest,
  { rejectValue: string }
>("restaurantAccount/updateMe", async (data, { rejectWithValue }) => {
  try {
    return await restaurantAccountService.updateMe(data);
  } catch (error: any) {
    return rejectWithValue(
      error?.message ?? "Failed to update restaurant info"
    );
  }
});

export const regenerateRestaurantQr = createAsyncThunk<
  RestaurantAccountInfo,
  void,
  { rejectValue: string }
>("restaurantAccount/regenerateQr", async (_, { rejectWithValue }) => {
  try {
    return await restaurantAccountService.regenerateQr();
  } catch (error: any) {
    return rejectWithValue(error?.message ?? "Failed to regenerate QR codes");
  }
});

export const updateRestaurantStatus = createAsyncThunk<
  RestaurantAccountInfo,
  { isActive: boolean },
  { rejectValue: string }
>("restaurantAccount/updateStatus", async (data, { rejectWithValue }) => {
  try {
    return await restaurantAccountService.updateMe({ isActive: data.isActive });
  } catch (error: any) {
    return rejectWithValue(
      error?.message ?? "Failed to update restaurant status"
    );
  }
});
