import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchPublicPlans, fetchPublicPlanById } from "./publicPlansThunks";
import { PublicPlan } from "./publicPlansTypes";

interface PublicPlansState {
  plans: PublicPlan[];
  selectedPlan: PublicPlan | null;
  loading: {
    plans: boolean;
    selectedPlan: boolean;
  };
  error: {
    plans: string | null;
    selectedPlan: string | null;
  };
}

const initialState: PublicPlansState = {
  plans: [],
  selectedPlan: null,
  loading: {
    plans: false,
    selectedPlan: false,
  },
  error: {
    plans: null,
    selectedPlan: null,
  },
};

const publicPlansSlice = createSlice({
  name: "publicPlans",
  initialState,
  reducers: {
    // Clear all data
    clearAllData: (state) => {
      state.plans = [];
      state.selectedPlan = null;
      state.error = {
        plans: null,
        selectedPlan: null,
      };
    },

    // Clear selected plan
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
      state.error.selectedPlan = null;
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = {
        plans: null,
        selectedPlan: null,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch plans
    builder
      .addCase(fetchPublicPlans.pending, (state) => {
        state.loading.plans = true;
        state.error.plans = null;
      })
      .addCase(
        fetchPublicPlans.fulfilled,
        (state, action: PayloadAction<PublicPlan[]>) => {
          state.loading.plans = false;
          state.plans = action.payload;
          state.error.plans = null;
        }
      )
      .addCase(fetchPublicPlans.rejected, (state, action) => {
        state.loading.plans = false;
        state.error.plans = action.payload || "Failed to fetch plans";
      });

    // Fetch plan by ID
    builder
      .addCase(fetchPublicPlanById.pending, (state) => {
        state.loading.selectedPlan = true;
        state.error.selectedPlan = null;
      })
      .addCase(
        fetchPublicPlanById.fulfilled,
        (state, action: PayloadAction<PublicPlan>) => {
          state.loading.selectedPlan = false;
          state.selectedPlan = action.payload;
          state.error.selectedPlan = null;
        }
      )
      .addCase(fetchPublicPlanById.rejected, (state, action) => {
        state.loading.selectedPlan = false;
        state.error.selectedPlan = action.payload || "Plan not found";
      });
  },
});

export const { clearAllData, clearSelectedPlan, clearErrors } =
  publicPlansSlice.actions;

export default publicPlansSlice.reducer;
