import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./authService";
import type {
  LoginRequest,
  RegisterRestaurantRequest,
  AuthResponse,
} from "./authTypes";

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Login failed");
  }
});

export const loginAdmin = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/loginAdmin", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.adminLogin(credentials);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Admin login failed");
  }
});

export const registerRestaurant = createAsyncThunk<
  AuthResponse,
  RegisterRestaurantRequest,
  { rejectValue: string }
>("auth/registerRestaurant", async (restaurantData, { rejectWithValue }) => {
  try {
    const response = await authService.registerRestaurant(restaurantData);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Restaurant registration failed");
  }
});
