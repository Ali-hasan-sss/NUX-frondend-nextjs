"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MarketingHeroBackground } from "@/components/landing/marketing-hero-background";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const floatingBadge = (delay: number) => ({
  y: [0, -10, 0],
  rotate: [0, 6, 0, -6, 0],
  transition: {
    duration: 5 + delay,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut" as const,
    delay,
  },
});

function PhoneMockup({
  isDark,
  t,
}: {
  isDark: boolean;
  t: (key: string) => string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 rounded-[1.35rem] sm:rounded-[1.5rem] p-[5px] sm:p-1.5 shadow-2xl transition-colors",
        isDark
          ? "bg-gradient-to-br from-gray-900 to-gray-800 shadow-cyan-500/10"
          : "bg-gradient-to-br from-gray-200 to-gray-300 shadow-violet-500/20"
      )}
    >
      <div
        className={cn(
          "absolute top-2 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-3 sm:h-3.5 rounded-b-xl z-20",
          isDark ? "bg-black" : "bg-gray-400"
        )}
      />

      <div
        className={cn(
          "w-full h-full rounded-[1.1rem] sm:rounded-[1.25rem] overflow-hidden relative",
          isDark
            ? "bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "absolute top-0 left-0 right-0 z-10 border-b pt-5 pb-1.5 backdrop-blur-sm",
            isDark ? "bg-[rgba(26,31,58,0.95)] border-white/10" : "bg-white/95 border-gray-200"
          )}
        >
          <div className="flex items-center justify-between px-2.5">
            <svg className={cn("w-3.5 h-3.5", isDark ? "text-white" : "text-gray-900")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <Image src="/images/logo.png" alt="NUX" width={40} height={24} className="object-contain h-4" priority />
            <svg className={cn("w-3.5 h-3.5", isDark ? "text-white" : "text-gray-900")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Body */}
        <div className="absolute inset-0 pt-9 pb-12 px-2 overflow-hidden">
          <div className="rounded-2xl p-2 text-center bg-gradient-to-r from-[#FF6B9D] via-[#A855F7] to-[#00D9FF] mb-2">
            <div className="text-white text-[9px] font-bold leading-tight">{t("landing.hero.welcomeToNux")}</div>
          </div>

          <div className="rounded-xl p-2 flex items-center gap-1.5 text-white bg-gradient-to-r from-[#00D9FF] to-[#A855F7] mb-2 shadow-md">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="min-w-0 flex-1">
              <div className="text-[8px] font-bold truncate">{t("landing.hero.scanCode")}</div>
              <div className="text-[6px] opacity-90 truncate">{t("landing.hero.scanCodeDesc")}</div>
            </div>
          </div>

          <div className="rounded-xl p-2 flex items-center gap-1.5 text-white bg-gradient-to-r from-[#A855F7] to-[#FF6B9D] mb-2 shadow-md">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <div className="min-w-0 flex-1">
              <div className="text-[8px] font-bold truncate">{t("landing.hero.scanMenuCode")}</div>
              <div className="text-[6px] opacity-90 truncate">{t("landing.hero.scanMenuCodeDesc")}</div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl p-2 border backdrop-blur-sm mb-2",
              isDark ? "bg-white/10 border-white/20" : "bg-gray-100/80 border-gray-200"
            )}
          >
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#A855F7] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-[10px]">R</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("font-semibold text-[8px] truncate", isDark ? "text-white" : "text-gray-900")}>
                  {t("landing.hero.restaurantName")}
                </div>
                <div className={cn("text-[6px]", isDark ? "text-white/70" : "text-gray-600")}>
                  {t("landing.hero.selectRestaurant")}
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-xl p-2 border backdrop-blur-sm",
              isDark ? "bg-white/10 border-white/20" : "bg-gray-100/80 border-gray-200"
            )}
          >
            <div className="flex justify-between gap-1 mb-1.5 p-1 rounded-lg bg-emerald-500/20">
              {["0.00 $", "0 ⭐", "0 ⭐"].map((label) => (
                <span key={label} className="text-emerald-400 text-[6px] font-semibold text-center flex-1">
                  {label}
                </span>
              ))}
            </div>
            <div className={cn("text-center text-[7px] font-semibold", isDark ? "text-white" : "text-gray-900")}>
              {t("landing.hero.payWithWallet")}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 z-10 border-t pt-1.5 pb-2 backdrop-blur-sm",
            isDark ? "bg-[rgba(26,31,58,0.95)] border-white/10" : "bg-white/95 border-gray-200"
          )}
        >
          <div className="flex justify-around px-1">
            {["Home", "Offers", "Shop", "Me"].map((tab, i) => (
              <div key={tab} className="flex flex-col items-center gap-0.5">
                <div className={cn("w-3 h-3 rounded-sm", i === 0 ? "bg-cyan-400/80" : isDark ? "bg-white/30" : "bg-gray-300")} />
                <span className={cn("text-[5px] font-medium", i === 0 ? "text-[#00D9FF]" : isDark ? "text-white/50" : "text-gray-500")}>
                  {tab}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingOrbitBadge({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={floatingBadge(delay)}
      className={cn(
        "absolute z-20 flex items-center justify-center rounded-2xl border backdrop-blur-md shadow-lg px-2.5 py-1.5 text-xs font-semibold",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  const { t } = useTranslation();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <section className="relative min-h-[100dvh]" aria-hidden />;
  }

  const isDark = resolvedTheme === "dark" || (theme === "dark");

  const highlights = [
    { emoji: "📱", label: t("landing.hero.scanCode") },
    { emoji: "📋", label: t("landing.hero.scanMenuCode") },
    { emoji: "💳", label: t("landing.hero.payWithWallet") },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center overflow-hidden min-h-[100dvh] max-h-[100dvh] py-10 sm:py-12 lg:py-14"
    >
      <MarketingHeroBackground isDark={isDark} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            className={cn("order-1 lg:order-1", isDark ? "text-white" : "text-gray-900")}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-5">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium backdrop-blur-sm",
                  isDark
                    ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-200"
                    : "border-violet-300/60 bg-white/70 text-violet-700 shadow-sm"
                )}
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="inline-block w-2 h-2 rounded-full bg-emerald-400"
                />
                {t("landing.platform.badge")}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-5 leading-[1.15] tracking-tight"
            >
              <span className="bg-gradient-to-r from-[#FF6B9D] via-[#A855F7] to-[#00D9FF] bg-clip-text text-transparent">
                NUX
              </span>{" "}
              — {t("landing.hero.title")}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className={cn(
                "text-base sm:text-lg mb-6 leading-relaxed max-w-xl",
                isDark ? "text-white/75" : "text-gray-600"
              )}
            >
              {t("landing.hero.description")}
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-2 mb-7">
              {highlights.map((item, i) => (
                <motion.span
                  key={item.label}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium border backdrop-blur-sm",
                    isDark
                      ? "border-white/15 bg-white/5 text-white/90"
                      : "border-violet-200/80 bg-white/80 text-gray-700 shadow-sm"
                  )}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                >
                  <span aria-hidden>{item.emoji}</span>
                  {item.label}
                </motion.span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} custom={4} className="flex flex-col sm:flex-row gap-3">
              <Link
                href="#"
                className="group inline-flex items-center justify-center rounded-xl bg-black text-white px-5 py-3 text-sm font-medium hover:bg-gray-900 transition-all hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 me-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                {t("landing.hero.downloadAppStore")}
              </Link>
              <Link
                href="#"
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#A855F7] text-white px-5 py-3 text-sm font-semibold hover:opacity-95 transition-all hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 me-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                {t("landing.hero.downloadGooglePlay")}
              </Link>
            </motion.div>
          </motion.div>

          {/* Phone showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-2 relative flex justify-center items-end min-h-0"
          >
            {/* Glow behind phone */}
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-pink-500/30 blur-3xl pointer-events-none"
            />

            <div
              className="relative w-full flex justify-center items-end"
              style={{ height: "min(46vh, calc(100dvh - 13rem))", minHeight: "11rem", maxHeight: "22rem" }}
            >
              {/* Pendulum swing: ±45° */}
              <motion.div
                className="relative origin-[center_bottom]"
                style={{ transformOrigin: "center bottom" }}
                animate={{
                  rotate: [-45, 45, -45],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="relative h-[min(42vh,calc(100dvh-14rem))] max-h-[20rem] min-h-[10.5rem] aspect-[9/19.5] w-auto"
                >
                  <PhoneMockup isDark={isDark} t={t} />

                  {/* Phone reflection */}
                  <div
                    className={cn(
                      "absolute -bottom-1 left-1/2 -translate-x-1/2 w-[70%] h-3 rounded-[100%] blur-md opacity-40",
                      isDark ? "bg-cyan-400/30" : "bg-violet-400/25"
                    )}
                  />
                </motion.div>
              </motion.div>

              {/* Orbiting badges */}
              <FloatingOrbitBadge
                delay={0}
                className={cn(
                  "-left-1 sm:left-2 top-[18%]",
                  isDark ? "border-cyan-400/30 bg-[#0A0E27]/80 text-cyan-200" : "border-cyan-200 bg-white/90 text-cyan-700"
                )}
              >
                <span className="text-base me-1" aria-hidden>📷</span>
                QR
              </FloatingOrbitBadge>

              <FloatingOrbitBadge
                delay={1.2}
                className={cn(
                  "-right-1 sm:right-0 top-[8%]",
                  isDark ? "border-pink-400/30 bg-[#0A0E27]/80 text-pink-200" : "border-pink-200 bg-white/90 text-pink-600"
                )}
              >
                <span className="text-base me-1" aria-hidden>🍽️</span>
                Menu
              </FloatingOrbitBadge>

              <FloatingOrbitBadge
                delay={2.4}
                className={cn(
                  "right-2 sm:right-6 bottom-[22%]",
                  isDark ? "border-emerald-400/30 bg-[#0A0E27]/80 text-emerald-200" : "border-emerald-200 bg-white/90 text-emerald-700"
                )}
              >
                <span className="text-base me-1" aria-hidden>⭐</span>
                Loyalty
              </FloatingOrbitBadge>

              <FloatingOrbitBadge
                delay={3.6}
                className={cn(
                  "left-2 sm:left-6 bottom-[8%]",
                  isDark ? "border-amber-400/30 bg-[#0A0E27]/80 text-amber-200" : "border-amber-200 bg-white/90 text-amber-700"
                )}
              >
                <span className="text-base me-1" aria-hidden>🛒</span>
                {t("landing.hero.ordersBadge")}
              </FloatingOrbitBadge>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
