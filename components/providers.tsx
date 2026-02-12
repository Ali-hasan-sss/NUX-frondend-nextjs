"use client";

import type React from "react";

import { Provider } from "react-redux";
import { store } from "@/app/store";
import { LanguageProvider } from "@/hooks/use-language";
import { SocketProvider } from "@/contexts/SocketContext";
import { useEffect } from "react";
import { initializeAuth } from "@/features/auth/authSlice";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <LanguageProvider>
          <SocketProvider>{children}</SocketProvider>
        </LanguageProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}
