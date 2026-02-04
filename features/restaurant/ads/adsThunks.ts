import { createAsyncThunk } from "@reduxjs/toolkit";
import { adsService } from "./adsService";
import type {
  CreateAdPayload,
  RestaurantAd,
  UpdateAdPayload,
} from "./adsTypes";

export const fetchMyAds = createAsyncThunk<
  RestaurantAd[],
  void,
  { rejectValue: { message: string; code?: string } }
>("restaurantAds/fetchMy", async (_, { rejectWithValue }) => {
  try {
    return await adsService.listMy();
  } catch (e: any) {
    const data = e?.response?.data;
    return rejectWithValue({
      message: data?.message ?? e?.message ?? "Failed to load ads",
      code: data?.code,
    });
  }
});

export const createAdThunk = createAsyncThunk<
  RestaurantAd,
  CreateAdPayload,
  { rejectValue: string }
>("restaurantAds/create", async (payload, { rejectWithValue }) => {
  try {
    return await adsService.create(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to create ad");
  }
});

export const updateAdThunk = createAsyncThunk<
  RestaurantAd,
  UpdateAdPayload,
  { rejectValue: string }
>("restaurantAds/update", async (payload, { rejectWithValue }) => {
  try {
    return await adsService.update(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to update ad");
  }
});

export const deleteAdThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("restaurantAds/delete", async (id, { rejectWithValue }) => {
  try {
    await adsService.remove(id);
    return id;
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to delete ad");
  }
});
