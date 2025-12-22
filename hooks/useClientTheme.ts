"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export const useClientTheme = () => {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || (theme === "system" && resolvedTheme === "dark"));

  const colors = {
    light: {
      primary: "#00D9FF",
      secondary: "#FF6B9D",
      accent: "#A855F7",
      background: "#F5F5F7",
      backgroundGradient: ["#FFFFFF", "#F8F9FA", "#F0F0F2", "#E8E8EA"],
      surface: "rgba(255, 255, 255, 0.9)",
      surfaceSolid: "#FFFFFF",
      text: "#1A1A1A",
      textSecondary: "rgba(26, 26, 26, 0.7)",
      border: "rgba(0, 0, 0, 0.1)",
      success: "#34D399",
      error: "#F87171",
      warning: "#FBBF24",
      info: "#60A5FA",
    },
    dark: {
      primary: "#00D9FF",
      secondary: "#FF6B9D",
      accent: "#A855F7",
      background: "#0A0E27",
      backgroundGradient: ["#1A0B2E", "#2D1B4E", "#16213E", "#0A0E27"],
      surface: "rgba(26, 31, 58, 0.85)",
      surfaceSolid: "#1A1F3A",
      text: "#FFFFFF",
      textSecondary: "rgba(255, 255, 255, 0.75)",
      border: "rgba(255, 255, 255, 0.15)",
      success: "#34D399",
      error: "#F87171",
      warning: "#FBBF24",
      info: "#60A5FA",
    },
  };

  return {
    theme,
    setTheme,
    isDark: isDark ?? true,
    colors: isDark ? colors.dark : colors.light,
    mounted,
  };
};

