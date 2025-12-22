import { createAsyncThunk } from "@reduxjs/toolkit";
import { adsService } from "./adsService";
import { AdsFilters } from "./adsTypes";

export const fetchAds = createAsyncThunk(
  "clientAds/fetchAds",
  async (
    { filters, append = false }: { filters: AdsFilters; append?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await adsService.getAds(filters);
      if (response.success) {
        return { data: response.data, append };
      } else {
        return rejectWithValue(response.message || "Failed to fetch ads");
      }
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || "Error fetching ads"
        );
      } else if (error.request) {
        return rejectWithValue("Network error. Please try again");
      } else {
        return rejectWithValue("Unexpected error");
      }
    }
  }
);

export const refreshAds = createAsyncThunk(
  "clientAds/refreshAds",
  async (filters: AdsFilters, { rejectWithValue }) => {
    try {
      const response = await adsService.getAds({ ...filters, page: 1 });
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message || "Failed to refresh ads");
      }
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || "Error refreshing ads"
        );
      } else {
        return rejectWithValue("Network error");
      }
    }
  }
);

