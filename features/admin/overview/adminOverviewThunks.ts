import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminOverviewService } from "./adminOverviewService";
import { AdminOverviewResponse } from "./adminOverviewTypes";

// Fetch admin overview statistics
export const fetchAdminOverview = createAsyncThunk<AdminOverviewResponse, void>(
  "adminOverview/fetchOverview",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminOverviewService.getOverview();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch admin overview");
    }
  }
);
