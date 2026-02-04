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
    const resolved = filters ?? { pageNumber: 1, pageSize: 10 };
    return await adminUsersService.getAll(resolved as AdminUsersFilters);
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load users";
    return rejectWithValue(message);
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
    const message =
      error?.response?.data?.message || error?.message || "Failed to load user";
    return rejectWithValue(message);
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
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to create user";
    return rejectWithValue(message);
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
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to update user";
    return rejectWithValue(message);
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
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete user";
    return rejectWithValue(message);
  }
});
