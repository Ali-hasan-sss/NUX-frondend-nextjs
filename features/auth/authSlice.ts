import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthTokens } from "./authTypes";
import {
  loginUser,
  loginAdmin,
  registerRestaurant,
  registerUser,
  loginWithGoogle,
  initializeAuth,
} from "./authThunks";
import { clearStoredAuth } from "@/lib/encryptedTokenStorage";

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
      if (typeof window !== "undefined") {
        clearStoredAuth();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setEmailVerified: (state) => {
      if (state.user) {
        state.user.emailVerified = true;
      }
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        const { tokens, user } = action.payload;
        if (tokens) {
          state.tokens = tokens;
          state.isAuthenticated = true;
          state.user = user;
        } else {
          state.tokens = null;
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.tokens = null;
        state.isAuthenticated = false;
      });

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
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, setError, setTokens, setEmailVerified } =
  authSlice.actions;
export { initializeAuth } from "./authThunks";
export default authSlice.reducer;
