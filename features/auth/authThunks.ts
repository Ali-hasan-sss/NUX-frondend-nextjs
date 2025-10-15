import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./authService";
import type {
  LoginRequest,
  RegisterRestaurantRequest,
  RegisterUserRequest,
  AuthResponse,
} from "./authTypes";

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    console.log("🔐 Frontend login attempt:", { email: credentials.email });
    const response = await authService.login(credentials);
    console.log("✅ Frontend login successful");
    return response;
  } catch (error: any) {
    console.error("❌ Frontend login failed:", error);
    const errorMessage =
      error?.response?.data?.message || error.message || "Login failed";
    return rejectWithValue(errorMessage);
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

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterUserRequest,
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.registerUser(userData);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.message || "User registration failed");
  }
});
