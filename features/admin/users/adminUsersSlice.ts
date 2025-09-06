import { createSlice } from "@reduxjs/toolkit";
import type { AdminUsersState, AdminUser } from "./adminUsersTypes";
import {
  fetchAdminUsers,
  fetchAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "./adminUsersThunks";

const initialState: AdminUsersState = {
  items: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
  },
};

const adminUsersSlice = createSlice({
  name: "adminUsers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.users;
        state.pagination = action.payload.pagination;
      })

      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(fetchAdminUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchAdminUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(createAdminUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createAdminUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(updateAdminUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        const index = state.items.findIndex(
          (u: AdminUser) => u.id === updated.id
        );
        if (index !== -1) state.items[index] = updated;
        if (state.selectedUser?.id === updated.id) state.selectedUser = updated;
      })
      .addCase(updateAdminUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      .addCase(deleteAdminUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = state.items.filter((u) => u.id !== action.payload);
        if (state.selectedUser?.id === action.payload)
          state.selectedUser = null;
      })
      .addCase(deleteAdminUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      });
  },
});

export default adminUsersSlice.reducer;
