"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-foreground"
        aria-hidden
        tabIndex={-1}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "h-9 w-9 transition-colors relative text-foreground",
        "hover:bg-accent hover:text-accent-foreground"
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
