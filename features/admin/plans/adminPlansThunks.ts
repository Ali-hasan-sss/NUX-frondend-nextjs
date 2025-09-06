import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminPlansService } from "./adminPlansService";
import type {
  AdminPlan,
  CreateAdminPlanRequest,
  UpdateAdminPlanRequest,
} from "./adminPlansTypes";

export const fetchAdminPlans = createAsyncThunk<
  AdminPlan[],
  void,
  { rejectValue: string }
>("adminPlans/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await adminPlansService.getAll();
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load plans");
  }
});

export const fetchAdminPlanById = createAsyncThunk<
  AdminPlan,
  string,
  { rejectValue: string }
>("adminPlans/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await adminPlansService.getById(id);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load plan");
  }
});

export const createAdminPlan = createAsyncThunk<
  AdminPlan,
  CreateAdminPlanRequest,
  { rejectValue: string }
>("adminPlans/create", async (data, { rejectWithValue }) => {
  try {
    return await adminPlansService.create(data);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create plan");
  }
});

export const updateAdminPlan = createAsyncThunk<
  AdminPlan,
  { id: string; data: UpdateAdminPlanRequest },
  { rejectValue: string }
>("adminPlans/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await adminPlansService.update(id, data);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update plan");
  }
});

export const deleteAdminPlan = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("adminPlans/delete", async (id, { rejectWithValue }) => {
  try {
    await adminPlansService.remove(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete plan");
  }
});
