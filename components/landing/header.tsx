"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";
  const isRTL = i18n.language === "ar";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter] animate-in fade-in slide-in-from-top-2 duration-300 transition-colors",
        isDark
          ? "border-purple-500/20 bg-gradient-to-b from-[#1A1F3A] to-[#2D1B4E]/95 bg-[#1A1F3A]/60"
          : "border-gray-200 bg-white/95 bg-white/60"
      )}
    >
      <div className="mx-auto max-w-7xl w-full px-4 md:px-6 lg:px-8 flex h-20 items-center relative">
        {/* Logo - Larger - Left in LTR, Right in RTL */}
        <Link href="/" className={cn("flex items-center gap-2 z-10", isRTL ? "ml-auto" : "")}>
          <Image
            src="/images/logo.png"
            alt="NUX"
            width={120}
            height={60}
            className="h-12 md:h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation Links - Centered */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/"
              className={cn(
                "text-sm font-medium transition-colors relative px-2 py-1 rounded-md",
                pathname === "/"
                  ? isDark
                    ? "text-cyan-400 bg-purple-500/20"
                    : "text-cyan-600 bg-cyan-50"
                  : isDark
                  ? "text-white/80 hover:text-cyan-400"
                  : "text-gray-700 hover:text-cyan-600"
              )}
            >
              {t("landing.nav.home") || "Home"}
            </Link>
            <Link
              href="/about"
              className={cn(
                "text-sm font-medium transition-colors relative px-2 py-1 rounded-md",
                pathname === "/about"
                  ? isDark
                    ? "text-cyan-400 bg-purple-500/20"
                    : "text-cyan-600 bg-cyan-50"
                  : isDark
                  ? "text-white/80 hover:text-cyan-400"
                  : "text-gray-700 hover:text-cyan-600"
              )}
            >
              {t("landing.nav.about") || "About Us"}
            </Link>
            <Link
              href="/services"
              className={cn(
                "text-sm font-medium transition-colors relative px-2 py-1 rounded-md",
                pathname === "/services"
                  ? isDark
                    ? "text-cyan-400 bg-purple-500/20"
                    : "text-cyan-600 bg-cyan-50"
                  : isDark
                  ? "text-white/80 hover:text-cyan-400"
                  : "text-gray-700 hover:text-cyan-600"
              )}
            >
              {t("landing.nav.services") || "Services"}
            </Link>
            <Link
              href="/contact"
              className={cn(
                "text-sm font-medium transition-colors relative px-2 py-1 rounded-md",
                pathname === "/contact"
                  ? isDark
                    ? "text-cyan-400 bg-purple-500/20"
                    : "text-cyan-600 bg-cyan-50"
                  : isDark
                  ? "text-white/80 hover:text-cyan-400"
                  : "text-gray-700 hover:text-cyan-600"
              )}
            >
              {t("landing.nav.contact") || "Contact Us"}
            </Link>
        </nav>

        {/* Desktop Right Side (LTR) / Left Side (RTL) - Language Switcher, Theme Toggle, Buttons */}
        <div className={cn("hidden md:flex items-center gap-4", isRTL ? "mr-auto" : "ml-auto")}>
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
            <div className="flex flex-col space-y-3 pt-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors py-2 px-2 rounded-md",
                  pathname === "/"
                    ? isDark
                      ? "text-cyan-400 bg-purple-500/20"
                      : "text-cyan-600 bg-cyan-50"
                    : isDark
                    ? "text-white/80 hover:text-cyan-400"
                    : "text-gray-700 hover:text-cyan-600"
                )}
              >
                {t("landing.nav.home") || "Home"}
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors py-2 px-2 rounded-md",
                  pathname === "/about"
                    ? isDark
                      ? "text-cyan-400 bg-purple-500/20"
                      : "text-cyan-600 bg-cyan-50"
                    : isDark
                    ? "text-white/80 hover:text-cyan-400"
                    : "text-gray-700 hover:text-cyan-600"
                )}
              >
                {t("landing.nav.about") || "About Us"}
              </Link>
              <Link
                href="/services"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors py-2 px-2 rounded-md",
                  pathname === "/services"
                    ? isDark
                      ? "text-cyan-400 bg-purple-500/20"
                      : "text-cyan-600 bg-cyan-50"
                    : isDark
                    ? "text-white/80 hover:text-cyan-400"
                    : "text-gray-700 hover:text-cyan-600"
                )}
              >
                {t("landing.nav.services") || "Services"}
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors py-2 px-2 rounded-md",
                  pathname === "/contact"
                    ? isDark
                      ? "text-cyan-400 bg-purple-500/20"
                      : "text-cyan-600 bg-cyan-50"
                    : isDark
                    ? "text-white/80 hover:text-cyan-400"
                    : "text-gray-700 hover:text-cyan-600"
                )}
              >
                {t("landing.nav.contact") || "Contact Us"}
              </Link>
            </div>
            <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200 dark:border-purple-500/20">
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
