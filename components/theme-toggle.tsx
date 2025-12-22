"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "h-9 w-9 transition-colors relative",
        isDark
          ? "text-white hover:bg-purple-500/20 hover:text-cyan-400"
          : "text-gray-900 hover:bg-gray-100 hover:text-cyan-600"
      )}
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all absolute",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "h-[1.2rem] w-[1.2rem] transition-all absolute",
          isDark
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
