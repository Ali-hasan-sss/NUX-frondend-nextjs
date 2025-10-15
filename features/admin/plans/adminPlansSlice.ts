import { createSlice } from "@reduxjs/toolkit";
import type { AdminPlansState, AdminPlan } from "./adminPlansTypes";
import {
  fetchAdminPlans,
  fetchAdminPlanById,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
} from "./adminPlansThunks";

const initialState: AdminPlansState = {
  items: [],
  selected: null,
  isLoading: false,
  error: null,
};

const adminPlansSlice = createSlice({
  name: "adminPlans",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(fetchAdminPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchAdminPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(createAdminPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdminPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createAdminPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(updateAdminPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        const index = state.items.findIndex(
          (p: AdminPlan) => p.id === updated.id
        );
        if (index !== -1) state.items[index] = updated;
        if (state.selected?.id === updated.id) state.selected = updated;
      })
      .addCase(updateAdminPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(deleteAdminPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdminPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter(
          (p) => p.id !== Number(action.payload)
        );
        if (state.selected?.id === Number(action.payload))
          state.selected = null;
      })
      .addCase(deleteAdminPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      });
  },
});

export default adminPlansSlice.reducer;
