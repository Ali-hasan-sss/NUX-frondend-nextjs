"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Hero() {
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
    <section className="relative min-h-screen flex items-center justify-center py-8 lg:py-0 overflow-hidden">
      {/* Dynamic gradient background */}
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-300",
          isDark
            ? "bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
            : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
        )}
      />

      {/* Animated glowing particles and lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-cyan-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, -40, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
        {/* Glowing lines effect */}
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-cyan-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border border-pink-500/20 rounded-full -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-full flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full items-center">
          {/* Left side - Content (appears first on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className={cn(
              "order-1 lg:order-1 transition-colors duration-300",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              {t("landing.hero.title")}
            </h1>
            <p
              className={cn(
                "text-lg sm:text-xl mb-8 leading-relaxed",
                isDark ? "text-white/80" : "text-gray-700"
              )}
            >
              {t("landing.hero.description")}
            </p>

            {/* App Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="#"
                className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                {t("landing.hero.downloadAppStore")}
              </Link>
              <Link
                href="#"
                className="inline-flex items-center justify-center bg-[#00D9FF] text-white px-6 py-3 rounded-lg hover:bg-[#00B8E6] transition-colors font-semibold"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                {t("landing.hero.downloadGooglePlay")}
              </Link>
            </div>
          </motion.div>

          {/* Right side - Phone Image (appears second on mobile, on right side on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end order-2 lg:order-2"
          >
            <div className="relative w-[300px] h-[550px] ">
              {/* Phone frame with notch */}
              <div
                className={cn(
                  "absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-1.5 sm:p-2 md:p-2.5 lg:p-3 shadow-2xl transition-colors",
                  isDark
                    ? "bg-gradient-to-br from-gray-900 to-gray-800"
                    : "bg-gradient-to-br from-gray-200 to-gray-300"
                )}
              >
                {/* Notch / Dynamic Island */}
                <div
                  className={cn(
                    "absolute top-3 left-1/2 -translate-x-1/2 w-[60px] sm:w-[70px] md:w-[80px] lg:w-[90px] h-[15px] sm:h-[18px] md:h-[28px] lg:h-[32px] rounded-b-[12px] sm:rounded-b-[14px] md:rounded-b-[16px] lg:rounded-b-[18px] z-20 transition-colors",
                    isDark ? "bg-black" : "bg-gray-400"
                  )}
                ></div>

                <div
                  className={cn(
                    "w-full h-full rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative transition-colors",
                    isDark
                      ? "bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
                      : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
                  )}
                >
                  {/* App Header */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 z-10 border-b pt-[24px] sm:pt-[28px] md:pt-[32px] lg:pt-[36px] pb-2 sm:pb-2.5 md:pb-3 transition-colors backdrop-blur-sm",
                      isDark
                        ? "bg-[rgba(26,31,58,0.95)] border-white/10"
                        : "bg-white/95 border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between px-3 sm:px-4 md:px-5">
                      {/* Menu Icon */}
                      <svg
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>

                      {/* Logo */}
                      <Image
                        src="/images/logo.png"
                        alt="NUX Logo"
                        width={50}
                        height={30}
                        className="object-contain h-[20px] sm:h-[24px] md:h-[28px] lg:h-[32px]"
                        priority
                      />

                      {/* Bell Icon */}
                      <div className="relative">
                        <svg
                          className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* App interface mockup - mimicking mobile app home screen */}
                  <div className="absolute inset-0 pt-[60px] sm:pt-[70px] md:pt-[80px] lg:pt-[90px] pb-[70px] sm:pb-[80px] md:pb-[90px] lg:pb-[100px] px-2.5 sm:px-3 md:px-4 lg:px-5 ">
                    {/* Welcome Banner */}
                    <div className="mb-2.5 sm:mb-3 md:mb-4">
                      <div className="rounded-tl-[20px] sm:rounded-tl-[25px] md:rounded-tl-[30px] rounded-br-[20px] sm:rounded-br-[25px] md:rounded-br-[30px] rounded-tr-[8px] sm:rounded-tr-[10px] md:rounded-tr-[12px] rounded-bl-[8px] sm:rounded-bl-[10px] md:rounded-bl-[12px] p-2.5 sm:p-3 md:p-4 text-center bg-gradient-to-r from-[#FF6B9D] via-[#A855F7] to-[#00D9FF]">
                        <div className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-bold">
                          {t("landing.hero.welcomeToNux")}
                        </div>
                      </div>
                    </div>

                    {/* Scan QR Code Button */}
                    <div className="mb-2.5 sm:mb-3 md:mb-4">
                      <div className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 text-white bg-gradient-to-r from-[#00D9FF] to-[#A855F7] shadow-lg">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold">
                            {t("landing.hero.scanCode")}
                          </div>
                          <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm opacity-90">
                            {t("landing.hero.scanCodeDesc")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scan Menu Code Button */}
                    <div className="mb-2.5 sm:mb-3 md:mb-4">
                      <div className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 text-white bg-gradient-to-r from-[#A855F7] to-[#FF6B9D] shadow-lg">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] sm:text-xs md:text-sm lg:text-base font-bold">
                            {t("landing.hero.scanMenuCode")}
                          </div>
                          <div className="text-[8px] sm:text-[10px] md:text-xs lg:text-sm opacity-90">
                            {t("landing.hero.scanMenuCodeDesc")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Restaurant Card */}
                    <div className="mb-2.5 sm:mb-3 md:mb-4">
                      <div
                        className={cn(
                          "rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 backdrop-blur-sm border transition-colors",
                          isDark
                            ? "bg-white/10 border-white/20"
                            : "bg-gray-100/80 border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#00D9FF] to-[#A855F7] flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xs sm:text-sm md:text-base lg:text-lg">
                              R
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base truncate",
                                isDark ? "text-white" : "text-gray-900"
                              )}
                            >
                              {t("landing.hero.restaurantName")}
                            </div>
                            <div
                              className={cn(
                                "text-[8px] sm:text-[10px] md:text-xs",
                                isDark ? "text-white/70" : "text-gray-600"
                              )}
                            >
                              {t("landing.hero.selectRestaurant")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Balance Card */}
                    <div
                      className={cn(
                        "rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 backdrop-blur-sm border transition-colors",
                        isDark
                          ? "bg-white/10 border-white/20"
                          : "bg-gray-100/80 border-gray-200"
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 mb-2 sm:mb-2.5 md:mb-3 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/20">
                        <div className="flex-1 flex flex-col items-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 mb-0.5 sm:mb-1 text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="text-emerald-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-semibold">
                            0.00 $
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 mb-0.5 sm:mb-1 text-cyan-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                          </svg>
                          <span className="text-emerald-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-semibold">
                            0 ⭐
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 mb-0.5 sm:mb-1 text-pink-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                          <span className="text-emerald-400 text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-semibold">
                            0 ⭐
                          </span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "text-center text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-semibold",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {t("landing.hero.payWithWallet")}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Tab Bar */}
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 z-10 border-t pt-2 sm:pt-2.5 md:pt-3 pb-2 sm:pb-3 md:pb-4 transition-colors backdrop-blur-sm",
                      isDark
                        ? "bg-[rgba(26,31,58,0.95)] border-white/10"
                        : "bg-white/95 border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-around px-2 sm:px-3 md:px-4">
                      {/* Home Tab */}
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#00D9FF]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        <span className="text-[8px] sm:text-[10px] md:text-xs text-[#00D9FF] font-medium">
                          Home
                        </span>
                      </div>

                      {/* Promotions Tab */}
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <svg
                          className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors",
                            isDark ? "text-white/60" : "text-gray-500"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        <span
                          className={cn(
                            "text-[8px] sm:text-[10px] md:text-xs font-medium transition-colors",
                            isDark ? "text-white/60" : "text-gray-500"
                          )}
                        >
                          Promotions
                        </span>
                      </div>

                      {/* Purchase Tab */}
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <svg
                          className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors",
                            isDark ? "text-white/60" : "text-gray-500"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                          />
                        </svg>
                        <span
                          className={cn(
                            "text-[8px] sm:text-[10px] md:text-xs font-medium transition-colors",
                            isDark ? "text-white/60" : "text-gray-500"
                          )}
                        >
                          Purchase
                        </span>
                      </div>

                      {/* Account Tab */}
                      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                        <svg
                          className={cn(
                            "w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors",
                            isDark ? "text-white/60" : "text-gray-500"
                          )}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span
                          className={cn(
                            "text-[8px] sm:text-[10px] md:text-xs font-medium",
                            isDark ? "text-white/60" : "text-gray-500"
                          )}
                        >
                          Account
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
