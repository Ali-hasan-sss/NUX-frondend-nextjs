"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function AnimatedBackground({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 bg-[#0A0E27] -z-10" />;
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #1A0B2E 0%, #2D1B4E 25%, #16213E 50%, #0A0E27 100%)"
            : "linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 25%, #F0F0F2 50%, #E8E8EA 100%)",
        }}
      />

      {/* Animated bubbles */}
      <div className="absolute inset-0">
        <div
          className="absolute rounded-full opacity-40 animate-float"
          style={{
            width: "80px",
            height: "80px",
            left: "20%",
            bottom: "-80px",
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(0, 217, 255, 0.3) 50%, rgba(255, 107, 157, 0.25) 100%)",
            animation: "float 25s infinite ease-in-out",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute rounded-full opacity-35 animate-float"
          style={{
            width: "70px",
            height: "70px",
            left: "50%",
            bottom: "-70px",
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(0, 217, 255, 0.3) 50%, rgba(255, 107, 157, 0.25) 100%)",
            animation: "float 30s infinite ease-in-out",
            animationDelay: "5s",
          }}
        />
        <div
          className="absolute rounded-full opacity-30 animate-float"
          style={{
            width: "90px",
            height: "90px",
            left: "75%",
            bottom: "-90px",
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(0, 217, 255, 0.3) 50%, rgba(255, 107, 157, 0.25) 100%)",
            animation: "float 28s infinite ease-in-out",
            animationDelay: "10s",
          }}
        />
        <div
          className="absolute rounded-full opacity-25 animate-float"
          style={{
            width: "60px",
            height: "60px",
            left: "40%",
            bottom: "-60px",
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.4) 0%, rgba(0, 217, 255, 0.3) 50%, rgba(255, 107, 157, 0.25) 100%)",
            animation: "float 32s infinite ease-in-out",
            animationDelay: "15s",
          }}
        />
      </div>

      {/* Content */}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}
