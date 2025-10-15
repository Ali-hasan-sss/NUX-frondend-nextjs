import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getRestaurants,
  getRestaurantById,
  getNearbyRestaurants,
} from "./publicRestaurantsService";
import type {
  GetRestaurantsParams,
  GetNearbyRestaurantsParams,
  PublicRestaurant,
  NearbyRestaurant,
  RestaurantsResponse,
} from "./publicRestaurantsTypes";

// Thunk for getting all restaurants
export const fetchRestaurants = createAsyncThunk<
  RestaurantsResponse,
  GetRestaurantsParams,
  { rejectValue: string }
>("publicRestaurants/fetchRestaurants", async (params, { rejectWithValue }) => {
  try {
    const response = await getRestaurants(params);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch restaurants");
  }
});

// Thunk for getting a specific restaurant by ID
export const fetchRestaurantById = createAsyncThunk<
  PublicRestaurant,
  string,
  { rejectValue: string }
>("publicRestaurants/fetchRestaurantById", async (id, { rejectWithValue }) => {
  try {
    const response = await getRestaurantById(id);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Restaurant not found");
  }
});

// Thunk for getting nearby restaurants
export const fetchNearbyRestaurants = createAsyncThunk<
  NearbyRestaurant[],
  GetNearbyRestaurantsParams,
  { rejectValue: string }
>(
  "publicRestaurants/fetchNearbyRestaurants",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getNearbyRestaurants(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch nearby restaurants"
      );
    }
  }
);
