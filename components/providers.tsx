"use client";

import type React from "react";

import { Provider } from "react-redux";
import { store } from "@/app/store";
import { LanguageProvider } from "@/hooks/use-language";
import { useEffect } from "react";
import { initializeAuth } from "@/features/auth/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);
  return (
    <Provider store={store}>
      <LanguageProvider>{children}</LanguageProvider>
    </Provider>
  );
}
