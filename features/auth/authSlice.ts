import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthTokens } from "./authTypes";
import {
  loginUser,
  loginAdmin,
  registerRestaurant,
  registerUser,
  loginWithGoogle,
} from "./authThunks";

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
    initializeAuth: (state) => {
      // Initialize from localStorage
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const storedUser = localStorage.getItem("user");
        if (accessToken && refreshToken) {
          state.tokens = { accessToken, refreshToken };
          state.isAuthenticated = true;
          if (storedUser) {
            try {
              state.user = JSON.parse(storedUser);
            } catch {
              state.user = null;
            }
          }
        }
        state.isLoading = false;
      }
    },
  },
  extraReducers: (builder) => {
    // Login User
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "accessToken",
            action.payload.tokens.accessToken
          );
          localStorage.setItem(
            "refreshToken",
            action.payload.tokens.refreshToken
          );
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
        state.isAuthenticated = false;
      });

    // Login Admin
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "accessToken",
            action.payload.tokens.accessToken
          );
          localStorage.setItem(
            "refreshToken",
            action.payload.tokens.refreshToken
          );
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
        state.isAuthenticated = false;
      });

    // Register Restaurant
    builder
      .addCase(registerRestaurant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerRestaurant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "accessToken",
            action.payload.tokens.accessToken
          );
          localStorage.setItem(
            "refreshToken",
            action.payload.tokens.refreshToken
          );
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(registerRestaurant.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
        state.isAuthenticated = false;
      });

    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        // Save to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "accessToken",
            action.payload.tokens.accessToken
          );
          localStorage.setItem(
            "refreshToken",
            action.payload.tokens.refreshToken
          );
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
        state.isAuthenticated = false;
      });

    // Login with Google
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
        state.isAuthenticated = true;
        state.error = null;
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "accessToken",
            action.payload.tokens.accessToken
          );
          localStorage.setItem(
            "refreshToken",
            action.payload.tokens.refreshToken
          );
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setError, setTokens, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
