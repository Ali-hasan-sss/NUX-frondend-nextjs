import { createAsyncThunk } from "@reduxjs/toolkit";
import { adminUsersService } from "./adminUsersService";
import type {
  AdminUser,
  AdminUsersFilters,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from "./adminUsersTypes";

export const fetchAdminUsers = createAsyncThunk<
  {
    users: AdminUser[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    };
  },
  AdminUsersFilters | undefined,
  { rejectValue: string }
>("adminUsers/fetchAll", async (filters, { rejectWithValue }) => {
  try {
    return await adminUsersService.getAll(filters || {});
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load users");
  }
});

export const fetchAdminUserById = createAsyncThunk<
  AdminUser,
  string,
  { rejectValue: string }
>("adminUsers/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await adminUsersService.getById(id);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to load user");
  }
});

export const createAdminUser = createAsyncThunk<
  AdminUser,
  CreateAdminUserRequest,
  { rejectValue: string }
>("adminUsers/create", async (data, { rejectWithValue }) => {
  try {
    return await adminUsersService.createUser(data);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to create user");
  }
});

export const updateAdminUser = createAsyncThunk<
  AdminUser,
  { id: string; data: UpdateAdminUserRequest },
  { rejectValue: string }
>("adminUsers/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await adminUsersService.updateUser(id, data);
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to update user");
  }
});

export const deleteAdminUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("adminUsers/delete", async (id, { rejectWithValue }) => {
  try {
    await adminUsersService.deleteUser(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to delete user");
  }
});
