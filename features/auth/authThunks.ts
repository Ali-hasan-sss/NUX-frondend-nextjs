import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./authService";
import { loadStoredTokens } from "@/lib/encryptedTokenStorage";
import type {
  LoginRequest,
  RegisterRestaurantRequest,
  RegisterUserRequest,
  AuthResponse,
  User,
} from "./authTypes";

export const initializeAuth = createAsyncThunk<
  { tokens: { accessToken: string; refreshToken: string } | null; user: User | null },
  void
>("auth/initializeAuth", async () => {
  const tokens = await loadStoredTokens();
  let user: User | null = null;
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        user = JSON.parse(storedUser) as User;
      } catch {
        user = null;
      }
    }
  }
  return { tokens, user };
});

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

export const loginWithGoogle = createAsyncThunk<
  AuthResponse,
  string,
  { rejectValue: string }
>("auth/loginWithGoogle", async (idToken, { rejectWithValue }) => {
  try {
    const response = await authService.loginWithGoogle(idToken);
    return response;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error.message || "Google sign-in failed";
    return rejectWithValue(message);
  }
});
