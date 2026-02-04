import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminRestaurantsService } from "./adminRestaurantsService";
import type {
  AdminRestaurant,
  AdminRestaurantsFilters,
  CreateAdminRestaurantRequest,
  CreateRestaurantWithOwnerRequest,
  pagination,
  UpdateAdminRestaurantRequest,
} from "./adminRestaurantsTypes";

export const fetchAdminRestaurants = createAsyncThunk<
  { items: AdminRestaurant[]; pagination: pagination },
  AdminRestaurantsFilters | undefined,
  { rejectValue: string }
>("adminRestaurants/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    return await adminRestaurantsService.getAll(filters || {});
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load restaurants");
  }
});

export const fetchAdminRestaurantById = createAsyncThunk<
  AdminRestaurant,
  string,
  { rejectValue: string }
>("adminRestaurants/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await adminRestaurantsService.getById(id);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load restaurant");
  }
});

export const createAdminRestaurant = createAsyncThunk<
  AdminRestaurant,
  CreateAdminRestaurantRequest,
  { rejectValue: string }
>("adminRestaurants/create", async (data, { rejectWithValue }) => {
  try {
    return await adminRestaurantsService.createRestaurant(data);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create restaurant");
  }
});

export const updateAdminRestaurant = createAsyncThunk<
  AdminRestaurant,
  { id: string; data: UpdateAdminRestaurantRequest },
  { rejectValue: string }
>("adminRestaurants/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await adminRestaurantsService.updateRestaurant(id, data);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update restaurant");
  }
});

export const deleteAdminRestaurant = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("adminRestaurants/delete", async (id, { rejectWithValue }) => {
  try {
    await adminRestaurantsService.deleteRestaurant(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete restaurant");
  }
});

export const createRestaurantWithOwner = createAsyncThunk<
  AdminRestaurant,
  CreateRestaurantWithOwnerRequest,
  { rejectValue: string }
>("adminRestaurants/createWithOwner", async (data, { rejectWithValue }) => {
  try {
    return await adminRestaurantsService.createRestaurantWithOwner(data);
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to create restaurant with owner";
    return rejectWithValue(message);
  }
});
