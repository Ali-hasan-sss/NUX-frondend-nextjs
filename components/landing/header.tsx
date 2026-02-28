"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";

function getDashboardHref(role: string | undefined): string {
  if (role === "ADMIN" || role === "SUBADMIN") return "/admin";
  if (role === "RESTAURANT_OWNER") return "/dashboard";
  return "/client/home";
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
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
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-5 md:px-6 lg:px-8 flex h-16 sm:h-[4.5rem] lg:h-20 items-center relative gap-2">
        {/* Logo - Larger - Left in LTR, Right in RTL */}
        <Link
          href="/"
          className={cn("flex items-center gap-2 z-10 shrink-0", isRTL ? "ml-auto" : "")}
        >
          <Image
            src="/images/logo.png"
            alt="NUX"
            width={120}
            height={60}
            className="h-10 sm:h-11 md:h-12 lg:h-14 w-auto max-w-[100px] sm:max-w-[110px] lg:max-w-none"
            priority
          />
        </Link>

        {/* Desktop Navigation Links - Centered (from lg only for tablet comfort) */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 absolute left-1/2 transform -translate-x-1/2">
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
            href="/restaurants"
            className={cn(
              "text-sm font-medium transition-colors relative px-2 py-1 rounded-md",
              pathname === "/restaurants"
                ? isDark
                  ? "text-cyan-400 bg-purple-500/20"
                  : "text-cyan-600 bg-cyan-50"
                : isDark
                ? "text-white/80 hover:text-cyan-400"
                : "text-gray-700 hover:text-cyan-600"
            )}
          >
            {t("landing.nav.restaurants") || "Restaurants"}
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
        <div
          className={cn(
            "hidden lg:flex items-center gap-3 xl:gap-4 shrink-0",
            isRTL ? "mr-auto" : "ml-auto"
          )}
        >
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-transparent",
                    isDark
                      ? "focus:ring-offset-[#1A1F3A]"
                      : "focus:ring-offset-white"
                  )}
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9 border-2 border-cyan-400/50">
                    <AvatarFallback
                      className={cn(
                        "text-sm font-medium",
                        isDark
                          ? "bg-purple-500/30 text-cyan-300"
                          : "bg-cyan-100 text-cyan-700"
                      )}
                    >
                      {user.fullName?.charAt(0)?.toUpperCase() ||
                        user.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    href={getDashboardHref(user.role)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t("dashboard.sidebar.dashboard") ||
                      t("landing.auth.dashboard") ||
                      "Dashboard"}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 dark:text-red-400"
                  onClick={() => {
                    dispatch(logout());
                    router.push("/");
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {t("dashboard.sidebar.signOut") ||
                    t("landing.auth.signOut") ||
                    "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0 shadow-lg shadow-cyan-500/30">
                  {t("landing.auth.signUp") || "Sign Up"}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile & Tablet Menu Button (visible until lg) */}
        <div className={cn("flex items-center gap-1 sm:gap-2 lg:hidden", isRTL ? "mr-auto" : "ml-auto")}>
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

      {/* Mobile & Tablet Navigation (dropdown until lg) */}
      {isMenuOpen && (
        <div
          className={cn(
            "lg:hidden border-t transition-colors",
            isDark
              ? "border-purple-500/20 bg-[#1A1F3A]"
              : "border-gray-200 bg-white"
          )}
        >
          <nav className="container py-4 px-4 sm:px-5 md:px-6 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
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
                href="/restaurants"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "text-sm font-medium transition-colors py-2 px-2 rounded-md",
                  pathname === "/restaurants"
                    ? isDark
                      ? "text-cyan-400 bg-purple-500/20"
                      : "text-cyan-600 bg-cyan-50"
                    : isDark
                    ? "text-white/80 hover:text-cyan-400"
                    : "text-gray-700 hover:text-cyan-600"
                )}
              >
                {t("landing.nav.restaurants") || "Restaurants"}
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
              {isAuthenticated && user ? (
                <>
                  <Link
                    href={getDashboardHref(user.role)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start gap-2 transition-colors",
                        isDark
                          ? "bg-transparent text-white border-purple-500/50 hover:bg-purple-500/25 hover:text-white"
                          : "bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t("dashboard.sidebar.dashboard") || "Dashboard"}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/50"
                    onClick={() => {
                      dispatch(logout());
                      setIsMenuOpen(false);
                      router.push("/");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("dashboard.sidebar.signOut") || "Sign Out"}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full transition-colors",
                        isDark
                          ? "bg-transparent text-white border-purple-500/50 hover:bg-purple-500/25 hover:text-white focus-visible:ring-cyan-400/50"
                          : "bg-transparent text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      {t("landing.auth.login") || "Login"}
                    </Button>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white border-0">
                      {t("landing.auth.signUp") || "Sign Up"}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
