import type { Middleware } from "@reduxjs/toolkit";
import {
  clearStoredTokens,
  saveStoredTokens,
} from "@/lib/encryptedTokenStorage";
import { logout, setTokens } from "./authSlice";
import {
  loginAdmin,
  loginUser,
  loginWithGoogle,
  registerRestaurant,
  registerUser,
} from "./authThunks";
import type { AuthTokens } from "./authTypes";

function persistTokens(tokens: AuthTokens | undefined) {
  if (!tokens?.accessToken || !tokens?.refreshToken) return;
  void saveStoredTokens(tokens.accessToken, tokens.refreshToken);
}

export const authTokenPersistenceMiddleware: Middleware =
  () => (next) => (action) => {
    const result = next(action);

    if (typeof window === "undefined") {
      return result;
    }

    if (logout.match(action)) {
      clearStoredTokens();
      return result;
    }

    if (setTokens.match(action)) {
      persistTokens(action.payload);
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
    }

    return result;
  };
