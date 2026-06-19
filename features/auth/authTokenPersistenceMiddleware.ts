import type { Middleware } from "@reduxjs/toolkit";
import {
  clearStoredAuth,
  saveStoredTokens,
  saveStoredUser,
} from "@/lib/encryptedTokenStorage";
import { logout, setEmailVerified, setTokens } from "./authSlice";
import {
  loginAdmin,
  loginUser,
  loginWithGoogle,
  registerRestaurant,
  registerUser,
} from "./authThunks";
import type { AuthTokens, User } from "./authTypes";

function persistTokens(tokens: AuthTokens | undefined) {
  if (!tokens?.accessToken || !tokens?.refreshToken) return;
  void saveStoredTokens(tokens.accessToken, tokens.refreshToken);
}

function persistUser(user: User | null | undefined) {
  if (!user) return;
  void saveStoredUser(user);
}

export const authTokenPersistenceMiddleware: Middleware =
  (api) => (next) => (action) => {
    const result = next(action);

    if (typeof window === "undefined") {
      return result;
    }

    if (logout.match(action)) {
      clearStoredAuth();
      return result;
    }

    if (setTokens.match(action)) {
      persistTokens(action.payload);
      return result;
    }

    if (setEmailVerified.match(action)) {
      persistUser(api.getState().auth.user);
      return result;
    }

    if (
      loginUser.fulfilled.match(action) ||
      loginAdmin.fulfilled.match(action) ||
      registerRestaurant.fulfilled.match(action) ||
      registerUser.fulfilled.match(action) ||
      loginWithGoogle.fulfilled.match(action)
    ) {
      persistTokens(action.payload.tokens);
      persistUser(action.payload.user);
    }

    return result;
  };
