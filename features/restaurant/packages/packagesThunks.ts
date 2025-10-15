import { createAsyncThunk } from "@reduxjs/toolkit";
import { packagesService } from "./packagesService";
import type {
  CreatePackagePayload,
  RestaurantPackage,
  UpdatePackagePayload,
} from "./packagesTypes";

export const fetchPackages = createAsyncThunk<
  RestaurantPackage[],
  void,
  { rejectValue: string }
>("restaurantPackages/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await packagesService.list();
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to load packages");
  }
});

export const fetchPackageById = createAsyncThunk<
  RestaurantPackage,
  number,
  { rejectValue: string }
>("restaurantPackages/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await packagesService.getById(id);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to load package");
  }
});

export const createPackageThunk = createAsyncThunk<
  RestaurantPackage,
  CreatePackagePayload,
  { rejectValue: string }
>("restaurantPackages/create", async (payload, { rejectWithValue }) => {
  try {
    return await packagesService.create(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to create package");
  }
});

export const updatePackageThunk = createAsyncThunk<
  RestaurantPackage,
  UpdatePackagePayload,
  { rejectValue: string }
>("restaurantPackages/update", async (payload, { rejectWithValue }) => {
  try {
    return await packagesService.update(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to update package");
  }
});

export const deletePackageThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("restaurantPackages/delete", async (id, { rejectWithValue }) => {
  try {
    await packagesService.remove(id);
    return id;
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to delete package");
  }
});
