"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import {
  X,
  Settings,
  Globe,
  FileText,
  Shield,
  Info,
  Moon,
  Sun,
  Monitor,
  Store,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { useClientTheme } from "@/hooks/useClientTheme";
import i18n from "@/i18n/config";

interface DrawerMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DrawerMenu({ open, onOpenChange }: DrawerMenuProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const { colors, isDark, mounted } = useClientTheme();
  const { user } = useAppSelector((state) => state.auth);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") || "en";
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
    onOpenChange(false);
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem("language", language);
    i18n.changeLanguage(language);
  };

  const handleThemeChange = (themeMode: "light" | "dark" | "system") => {
    setTheme(themeMode);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className={cn(
          "w-[280px] p-0 transition-colors",
          isDark ? "bg-[rgba(26,31,58,0.95)]" : "bg-[rgba(255,255,255,0.95)]",
        )}
        style={{
          borderRightColor: colors.border,
        }}
      >
        <SheetHeader
          className={cn("border-b p-5")}
          style={{ borderBottomColor: colors.border }}
        >
          <SheetTitle
            className={cn("text-left")}
            style={{ color: colors.text }}
          >
            {t("drawer.menu")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full overflow-y-auto p-5">
          <div className="space-y-6">
            {/* Restaurants - search for a restaurant */}
            <button
              type="button"
              onClick={() => {
                router.push("/restaurants");
                onOpenChange(false);
              }}
              className={cn(
                "flex items-center gap-3 w-full hover:opacity-80 transition-opacity text-left",
              )}
              style={{ color: colors.text }}
            >
              <Store className="h-5 w-5" style={{ color: colors.primary }} />
              <span>{t("drawer.restaurants")}</span>
            </button>

            {/* Language */}
            <div className="space-y-2">
              <div
                className="flex items-center gap-3"
                style={{ color: colors.text }}
              >
                <Globe className="h-5 w-5" style={{ color: colors.primary }} />
                <span>{t("drawer.language")}</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-8">
                {[
                  { code: "en", label: "English" },
                  { code: "ar", label: "العربية" },
                  { code: "de", label: "Deutsch" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "px-3 py-1.5 rounded-2xl text-xs font-medium transition-colors",
                      currentLanguage === lang.code
                        ? "bg-[#00D9FF] text-white"
                        : isDark
                          ? "bg-white/10 text-white/75 hover:bg-white/20"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <div
                className="flex items-center gap-3"
                style={{ color: colors.text }}
              >
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" style={{ color: colors.primary }} />
                ) : theme === "light" ? (
                  <Sun className="h-5 w-5" style={{ color: colors.primary }} />
                ) : (
                  <Monitor
                    className="h-5 w-5"
                    style={{ color: colors.primary }}
                  />
                )}
                <span>{t("drawer.theme")}</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-8">
                {[
                  { code: "dark", label: t("drawer.dark"), icon: Moon },
                  { code: "light", label: t("drawer.light"), icon: Sun },
                  { code: "system", label: t("drawer.system"), icon: Monitor },
                ].map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isSelected = theme === themeOption.code;
                  return (
                    <button
                      key={themeOption.code}
                      onClick={() =>
                        handleThemeChange(
                          themeOption.code as "light" | "dark" | "system",
                        )
                      }
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-[#00D9FF] text-white"
                          : isDark
                            ? "bg-white/10 text-white/75 hover:bg-white/20"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {themeOption.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terms of Use */}
            <button
              className={cn(
                "flex items-center gap-3 hover:opacity-80 transition-opacity",
              )}
              style={{ color: colors.text }}
            >
              <FileText className="h-5 w-5" style={{ color: colors.primary }} />
              <span>{t("drawer.termsOfUse")}</span>
            </button>

            {/* Privacy Policy */}
            <button
              className={cn(
                "flex items-center gap-3 hover:opacity-80 transition-opacity",
              )}
              style={{ color: colors.text }}
            >
              <Shield className="h-5 w-5" style={{ color: colors.primary }} />
              <span>{t("drawer.privacyPolicy")}</span>
            </button>

            {/* About App */}
            <button
              className={cn(
                "flex items-center gap-3 hover:opacity-80 transition-opacity",
              )}
              style={{ color: colors.text }}
            >
              <Info className="h-5 w-5" style={{ color: colors.primary }} />
              <span>{t("drawer.aboutApp")}</span>
            </button>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              className="w-full mt-10"
              style={{ backgroundColor: colors.error }}
            >
              {t("drawer.logout")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
