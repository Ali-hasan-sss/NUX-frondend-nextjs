import { createAsyncThunk } from "@reduxjs/toolkit";
import { restaurantOverviewService } from "./restaurantOverviewService";
import { RestaurantOverviewResponse } from "./restaurantOverviewTypes";

// Fetch restaurant overview
export const fetchRestaurantOverview = createAsyncThunk<
  RestaurantOverviewResponse,
  void,
  { rejectValue: string }
>(
  "restaurantOverview/fetchRestaurantOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await restaurantOverviewService.getOverview();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch restaurant overview"
      );
    }
  }
);
