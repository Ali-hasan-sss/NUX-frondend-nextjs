import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPublicPlans, getPublicPlanById } from "./publicPlansService";
import type { PublicPlan } from "./publicPlansTypes";

// Thunk for getting all plans
export const fetchPublicPlans = createAsyncThunk<
  PublicPlan[],
  void,
  { rejectValue: string }
>("publicPlans/fetchPlans", async (_, { rejectWithValue }) => {
  try {
    const response = await getPublicPlans();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch plans");
  }
});

// Thunk for getting a specific plan by ID
export const fetchPublicPlanById = createAsyncThunk<
  PublicPlan,
  number,
  { rejectValue: string }
>("publicPlans/fetchPlanById", async (id, { rejectWithValue }) => {
  try {
    const response = await getPublicPlanById(id);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Plan not found");
  }
});
