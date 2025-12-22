"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter] animate-in fade-in slide-in-from-top-2 duration-300 transition-colors",
        isDark
          ? "border-purple-500/20 bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E]/95 bg-[#1A1F3A]/60"
          : "border-gray-200 bg-white/95 bg-white/60"
      )}
    >
      <div className="mx-auto max-w-7xl w-full px-4 md:px-6 lg:px-8 flex h-20 items-center justify-between">
        {/* Logo - Larger */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="NUX"
            width={120}
            height={60}
            className="h-12 md:h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Login Button */}
          <Link href="/auth/login">
            <Button
              variant="ghost"
              className={cn(
                "hover:text-cyan-400 border transition-colors",
                isDark
                  ? "text-white hover:bg-purple-500/20 border-purple-500/30"
                  : "text-gray-900 hover:bg-gray-100 border-gray-300"
              )}
            >
              {t("landing.auth.login") || "Login"}
            </Button>
          </Link>

          {/* Sign Up Button */}
          <Link href="/auth/register">
            <Button className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0 shadow-lg shadow-cyan-500/30">
              {t("landing.auth.signUp") || "Sign Up"}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-2 md:hidden">
          {/* Language Switcher - Mobile */}
          <LanguageSwitcher />

          {/* Theme Toggle - Mobile */}
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className={cn(
              "transition-colors",
              isDark
                ? "text-white hover:bg-purple-500/20"
                : "text-gray-900 hover:bg-gray-100"
            )}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          className={cn(
            "md:hidden border-t transition-colors",
            isDark
              ? "border-purple-500/20 bg-[#1A1F3A]"
              : "border-gray-200 bg-white"
          )}
        >
          <nav className="container py-4 space-y-4">
            <div className="flex flex-col space-y-2 pt-2">
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full transition-colors",
                    isDark
                      ? "text-white border-purple-500/30 hover:bg-purple-500/20"
                      : "text-gray-900 border-gray-300 hover:bg-gray-100"
                  )}
                >
                  {t("landing.auth.login") || "Login"}
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0">
                  {t("landing.auth.signUp") || "Sign Up"}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
