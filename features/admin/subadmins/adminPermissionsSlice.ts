import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { subadminService } from "./subadminService";
import type { SubAdminPermissionType } from "./subadminTypes";

export const fetchAdminPermissions = createAsyncThunk(
  "adminPermissions/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await subadminService.getMyPermissions();
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.message ?? "Failed to load permissions");
    }
  }
);

interface AdminPermissionsState {
  permissions: SubAdminPermissionType[];
  role: "ADMIN" | "SUBADMIN" | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminPermissionsState = {
  permissions: [],
  role: null,
  isLoading: false,
  error: null,
};

const adminPermissionsSlice = createSlice({
  name: "adminPermissions",
  initialState,
  reducers: {
    clearAdminPermissions: (state) => {
      state.permissions = [];
      state.role = null;
      state.error = null;
    },
    setAdminPermissions: (
      state,
      action: PayloadAction<{ permissions: SubAdminPermissionType[]; role: "ADMIN" | "SUBADMIN" }>
    ) => {
      state.permissions = action.payload.permissions;
      state.role = action.payload.role;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload.permissions;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(fetchAdminPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? null;
        state.permissions = [];
        state.role = null;
      });
  },
});

export const { clearAdminPermissions, setAdminPermissions } = adminPermissionsSlice.actions;
export default adminPermissionsSlice.reducer;
