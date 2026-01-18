"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState(0);

  const updateHtmlAttributes = (language: string) => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      html.setAttribute("lang", language);
      if (language === "ar") {
        html.setAttribute("dir", "rtl");
      } else {
        html.setAttribute("dir", "ltr");
      }
    }
  };

  useEffect(() => {
    // Initialize i18n on client side
    const savedLanguage = localStorage.getItem("language") || "en";
    i18n.changeLanguage(savedLanguage);
    updateHtmlAttributes(savedLanguage);
    
    // Listen for language changes via custom event
    const handleLanguageChange = (e: CustomEvent<string>) => {
      const newLanguage = e.detail || localStorage.getItem("language") || "en";
      if (newLanguage !== i18n.language) {
        i18n.changeLanguage(newLanguage);
        updateHtmlAttributes(newLanguage);
        setKey((prev) => prev + 1); // Force re-render
      }
    };
    
    // Listen to custom language change events
    window.addEventListener("languagechange" as any, handleLanguageChange as EventListener);
    
    // Listen to storage events (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "language" && e.newValue) {
        i18n.changeLanguage(e.newValue);
        updateHtmlAttributes(e.newValue);
        setKey((prev) => prev + 1);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("languagechange" as any, handleLanguageChange as EventListener);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return <I18nextProvider i18n={i18n} key={key}>{children}</I18nextProvider>;
}
