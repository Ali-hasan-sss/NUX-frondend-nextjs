"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Footer() {
  const { t } = useTranslation();
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

  return (
    <footer
      id="contact"
      className={cn(
        "py-10 w-full flex items-center justify-center border-t transition-colors",
        "px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12",
        isDark
          ? "bg-gradient-to-b from-[#2D1B4E] to-[#0A0E27] border-purple-500/20"
          : "bg-gradient-to-b from-gray-50 to-white border-gray-200"
      )}
    >
      <div className="container w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logo.png"
                alt="nux"
                width={80}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className={cn(isDark ? "text-white/70" : "text-gray-600")}>
              {t("landing.footer.description")}
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className={cn(
                  "transition-colors",
                  isDark
                    ? "text-white/70 hover:text-cyan-400"
                    : "text-gray-600 hover:text-cyan-600"
                )}
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className={cn(
                  "transition-colors",
                  isDark
                    ? "text-white/70 hover:text-cyan-400"
                    : "text-gray-600 hover:text-cyan-600"
                )}
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className={cn(
                  "transition-colors",
                  isDark
                    ? "text-white/70 hover:text-cyan-400"
                    : "text-gray-600 hover:text-cyan-600"
                )}
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className={cn(
                  "transition-colors",
                  isDark
                    ? "text-white/70 hover:text-cyan-400"
                    : "text-gray-600 hover:text-cyan-600"
                )}
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3
              className={cn(
                "font-semibold mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.footer.product")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#features"
                  className={cn(
                    "transition-colors",
                    isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.footer.features")}
                </Link>
              </li>
              <li>
                <Link
                  href="/#pricing"
                  className={cn(
                    "transition-colors",
                    isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.footer.pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className={cn(
                    "transition-colors",
                    isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.footer.getStarted")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className={cn(
                "font-semibold mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.footer.company") || "Company"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className={cn(
                    "transition-colors inline-block px-2 py-1 rounded-md",
                    pathname === "/about"
                      ? isDark
                        ? "text-cyan-400 bg-purple-500/20"
                        : "text-cyan-600 bg-cyan-50"
                      : isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.nav.about") || "About Us"}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className={cn(
                    "transition-colors inline-block px-2 py-1 rounded-md",
                    pathname === "/services"
                      ? isDark
                        ? "text-cyan-400 bg-purple-500/20"
                        : "text-cyan-600 bg-cyan-50"
                      : isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.nav.services") || "Services"}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={cn(
                    "transition-colors inline-block px-2 py-1 rounded-md",
                    pathname === "/contact"
                      ? isDark
                        ? "text-cyan-400 bg-purple-500/20"
                        : "text-cyan-600 bg-cyan-50"
                      : isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.nav.contact") || "Contact Us"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className={cn(
                "font-semibold mb-4",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {t("landing.footer.account") || "Account"}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/auth/login"
                  className={cn(
                    "transition-colors inline-block px-2 py-1 rounded-md",
                    pathname === "/auth/login"
                      ? isDark
                        ? "text-cyan-400 bg-purple-500/20"
                        : "text-cyan-600 bg-cyan-50"
                      : isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.auth.login") || "Login"}
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className={cn(
                    "transition-colors inline-block px-2 py-1 rounded-md",
                    pathname === "/auth/register"
                      ? isDark
                        ? "text-cyan-400 bg-purple-500/20"
                        : "text-cyan-600 bg-cyan-50"
                      : isDark
                      ? "text-white/70 hover:text-cyan-400"
                      : "text-gray-600 hover:text-cyan-600"
                  )}
                >
                  {t("landing.auth.signUp") || "Sign Up"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "border-t mt-5 pt-8 text-center transition-colors",
            isDark
              ? "border-purple-500/20 text-white/70"
              : "border-gray-200 text-gray-600"
          )}
        >
          <p>{t("landing.footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
