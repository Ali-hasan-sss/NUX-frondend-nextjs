import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientAccountService } from "./clientAccountService";
import {
  ClientProfile,
  UpdateClientProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
} from "./clientAccountTypes";

// Get client profile
export const fetchClientProfile = createAsyncThunk<
  ClientProfile,
  void,
  { rejectValue: string }
>("clientAccount/fetchProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await clientAccountService.getProfile();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to fetch profile"
    );
  }
});

// Update client profile
export const updateClientProfile = createAsyncThunk<
  ClientProfile,
  UpdateClientProfileRequest,
  { rejectValue: string }
>("clientAccount/updateProfile", async (data, { rejectWithValue }) => {
  try {
    await clientAccountService.updateProfile(data);
    // Fetch updated profile
    const response = await clientAccountService.getProfile();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to update profile"
    );
  }
});

// Change password
export const changeClientPassword = createAsyncThunk<
  void,
  ChangePasswordRequest,
  { rejectValue: string }
>("clientAccount/changePassword", async (data, { rejectWithValue }) => {
  try {
    await clientAccountService.changePassword(data);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to change password"
    );
  }
});

// Delete account
export const deleteClientAccount = createAsyncThunk<
  void,
  DeleteAccountRequest,
  { rejectValue: string }
>("clientAccount/deleteAccount", async (data, { rejectWithValue }) => {
  try {
    await clientAccountService.deleteAccount(data);
  } catch (error: any) {
    return rejectWithValue(
      error?.response?.data?.message || "Failed to delete account"
    );
  }
});
