import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPublicPlans, getPublicPlanById } from "./publicPlansService";
import type { PublicPlan } from "./publicPlansTypes";

// Thunk for getting all plans
export const fetchPublicPlans = createAsyncThunk<
  PublicPlan[],
  string | void,
  { rejectValue: string }
>("publicPlans/fetchPlans", async (lang, { rejectWithValue }) => {
  try {
    const response = await getPublicPlans(lang || undefined);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch plans");
  }
});

// Thunk for getting a specific plan by ID
export const fetchPublicPlanById = createAsyncThunk<
  PublicPlan,
  { id: number; lang?: string } | number,
  { rejectValue: string }
>("publicPlans/fetchPlanById", async (arg, { rejectWithValue }) => {
  try {
    const id = typeof arg === "number" ? arg : arg.id;
    const lang = typeof arg === "number" ? undefined : arg.lang;
    const response = await getPublicPlanById(id, lang);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Plan not found");
  }
});
