"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { MarketingHeroBackground } from "@/components/landing/marketing-hero-background";
import type { ReactNode } from "react";

export type SectionBgVariant =
  | "none"
  | "aurora"
  | "grid"
  | "waves"
  | "stripes"
  | "pulse-dots"
  | "radial"
  | "glow"
  | "mesh"
  | "orbit";

export type SectionEntrance =
  | "fade-up"
  | "fade-scale"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "zoom-in"
  | "blur-in"
  | "flip-up"
  | "rotate-in"
  | "expand"
  | "skew-in";

export const entranceVariants: Record<SectionEntrance, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-scale": {
    hidden: { opacity: 0, scale: 0.92, y: 24 },
    visible: { opacity: 1, scale: 1, y: 0 },
  },
  "slide-left": {
    hidden: { opacity: 0, x: -64 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-right": {
    hidden: { opacity: 0, x: 64 },
    visible: { opacity: 1, x: 0 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 72 },
    visible: { opacity: 1, y: 0 },
  },
  "zoom-in": {
    hidden: { opacity: 0, scale: 0.75 },
    visible: { opacity: 1, scale: 1 },
  },
  "blur-in": {
    hidden: { opacity: 0, filter: "blur(12px)", y: 20 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  "flip-up": {
    hidden: { opacity: 0, rotateX: 24, y: 40, transformPerspective: 800 },
    visible: { opacity: 1, rotateX: 0, y: 0 },
  },
  "rotate-in": {
    hidden: { opacity: 0, rotate: -8, scale: 0.94, y: 30 },
    visible: { opacity: 1, rotate: 0, scale: 1, y: 0 },
  },
  expand: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  "skew-in": {
    hidden: { opacity: 0, skewY: 4, y: 36 },
    visible: { opacity: 1, skewY: 0, y: 0 },
  },
};

const defaultTransition = {
  duration: 0.75,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function SectionBackground({
  variant,
  isDark,
}: {
  variant: SectionBgVariant;
  isDark: boolean;
}) {
  if (variant === "none") return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {variant === "aurora" && (
        <>
          <motion.div
            animate={{ x: [0, 80, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className={cn(
              "absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl",
              isDark ? "bg-violet-500/20" : "bg-violet-300/30"
            )}
          />
          <motion.div
            animate={{ x: [0, -60, 0], y: [0, -30, 0] }}
            transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className={cn(
              "absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl",
              isDark ? "bg-cyan-500/15" : "bg-cyan-300/25"
            )}
          />
        </>
      )}

      {variant === "grid" && (
        <>
          <div
            className={cn(
              "absolute inset-0 opacity-[0.35]",
              isDark
                ? "[background-image:linear-gradient(rgba(0,217,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.08)_1px,transparent_1px)]"
                : "[background-image:linear-gradient(rgba(168,85,247,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.06)_1px,transparent_1px)]"
            )}
            style={{ backgroundSize: "48px 48px" }}
          />
          <motion.div
            animate={{ x: ["-10%", "10%", "-10%"] }}
            transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className={cn(
              "absolute inset-0 opacity-30",
              isDark
                ? "bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
                : "bg-gradient-to-r from-transparent via-violet-400/15 to-transparent"
            )}
          />
        </>
      )}

      {variant === "waves" && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute left-[-20%] w-[140%] h-32 rounded-[100%] border",
                isDark ? "border-cyan-500/10" : "border-violet-300/30"
              )}
              style={{ top: `${20 + i * 28}%` }}
              animate={{ x: [0, i % 2 === 0 ? 40 : -40, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 12 + i * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}
        </>
      )}

      {variant === "stripes" && (
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className={cn(
            "absolute inset-0 opacity-20",
            isDark
              ? "[background-image:repeating-linear-gradient(-45deg,rgba(168,85,247,0.15)_0,rgba(168,85,247,0.15)_2px,transparent_2px,transparent_16px)]"
              : "[background-image:repeating-linear-gradient(-45deg,rgba(0,217,255,0.12)_0,rgba(0,217,255,0.12)_2px,transparent_2px,transparent_16px)]"
          )}
          style={{ backgroundSize: "200% 200%" }}
        />
      )}

      {variant === "pulse-dots" && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className={cn(
                "absolute w-2 h-2 rounded-full",
                isDark ? "bg-cyan-400/40" : "bg-violet-400/35"
              )}
              style={{
                top: `${12 + (i % 4) * 22}%`,
                left: `${8 + Math.floor(i / 4) * 80}%`,
              }}
              animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0.7, 0.2] }}
              transition={{
                duration: 3 + i * 0.4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </>
      )}

      {variant === "radial" && (
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,36rem)] h-[min(90vw,36rem)] rounded-full blur-3xl",
            isDark
              ? "bg-[radial-gradient(circle,rgba(0,217,255,0.18),transparent_70%)]"
              : "bg-[radial-gradient(circle,rgba(168,85,247,0.15),transparent_70%)]"
          )}
        />
      )}

      {variant === "glow" && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(80vw,28rem)] h-[min(80vw,28rem)] rounded-full",
              isDark
                ? "bg-[conic-gradient(from_0deg,transparent,rgba(0,217,255,0.12),transparent,rgba(168,85,247,0.12),transparent)]"
                : "bg-[conic-gradient(from_0deg,transparent,rgba(0,217,255,0.15),transparent,rgba(168,85,247,0.1),transparent)]"
            )}
          />
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl",
              isDark ? "bg-purple-500/20" : "bg-cyan-300/25"
            )}
          />
        </>
      )}

      {variant === "mesh" && (
        <>
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className={cn(
              "absolute top-10 right-10 w-48 h-48 rounded-full blur-2xl",
              isDark ? "bg-pink-500/15" : "bg-pink-300/20"
            )}
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className={cn(
              "absolute bottom-10 left-10 w-56 h-56 rounded-full blur-2xl",
              isDark ? "bg-cyan-500/12" : "bg-cyan-300/18"
            )}
          />
        </>
      )}

      {variant === "orbit" && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,40rem)] h-[min(100vw,40rem)]"
        >
          <div
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full",
              isDark ? "bg-cyan-400/50" : "bg-violet-400/40"
            )}
          />
          <div
            className={cn(
              "absolute bottom-1/4 right-0 w-2 h-2 rounded-full",
              isDark ? "bg-pink-400/40" : "bg-pink-400/35"
            )}
          />
        </motion.div>
      )}
    </div>
  );
}

export function SectionShell({
  id,
  className,
  bg = "aurora",
  isDark,
  children,
}: {
  id?: string;
  className?: string;
  bg?: SectionBgVariant;
  isDark: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("relative overflow-hidden", className)}>
      <SectionBackground variant={bg} isDark={isDark} />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function SectionReveal({
  entrance = "fade-up",
  delay = 0,
  className,
  children,
  once = true,
}: {
  entrance?: SectionEntrance;
  delay?: number;
  className?: string;
  children: ReactNode;
  once?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-60px" }}
      variants={entranceVariants[entrance]}
      transition={{ ...defaultTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionRevealItem({
  entrance = "fade-up",
  index = 0,
  className,
  children,
}: {
  entrance?: SectionEntrance;
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={entranceVariants[entrance]}
      transition={{ ...defaultTransition, delay: index * 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Feature sub-section presets — unique entrance + background per block */
export const FEATURE_SECTION_PRESETS: {
  entrance: SectionEntrance;
  bg: SectionBgVariant;
  visualEntrance: SectionEntrance;
}[] = [
  { entrance: "slide-left", bg: "waves", visualEntrance: "zoom-in" },
  { entrance: "slide-right", bg: "stripes", visualEntrance: "rotate-in" },
  { entrance: "fade-scale", bg: "mesh", visualEntrance: "slide-left" },
  { entrance: "blur-in", bg: "pulse-dots", visualEntrance: "slide-right" },
  { entrance: "slide-up", bg: "aurora", visualEntrance: "flip-up" },
  { entrance: "flip-up", bg: "grid", visualEntrance: "fade-scale" },
  { entrance: "skew-in", bg: "orbit", visualEntrance: "expand" },
];

/** Public pages — rotating section presets */
export const PAGE_SECTION_PRESETS: {
  bg: SectionBgVariant;
  entrance: SectionEntrance;
}[] = [
  { bg: "mesh", entrance: "fade-up" },
  { bg: "grid", entrance: "slide-left" },
  { bg: "waves", entrance: "slide-right" },
  { bg: "pulse-dots", entrance: "blur-in" },
  { bg: "stripes", entrance: "zoom-in" },
  { bg: "radial", entrance: "skew-in" },
  { bg: "orbit", entrance: "flip-up" },
];

export function PageHeroReveal({
  entrance = "fade-scale",
  className,
  children,
}: {
  entrance?: SectionEntrance;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={entranceVariants[entrance]}
      transition={{ ...defaultTransition, duration: 0.85 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PageHero({
  isDark,
  entrance = "fade-scale",
  className,
  containerClassName,
  align = "center",
  children,
}: {
  isDark: boolean;
  /** @deprecated Unified marketing background — kept for API compatibility */
  bg?: SectionBgVariant;
  entrance?: SectionEntrance;
  className?: string;
  containerClassName?: string;
  /** center: title-only pages; top: hero with extra controls (e.g. search) */
  align?: "center" | "top";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden min-h-[100dvh] max-h-none flex flex-col",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
    >
      <MarketingHeroBackground isDark={isDark} />
      <div
        className={cn(
          "relative z-10 w-full mx-auto px-4 md:px-6 lg:px-8",
          "pt-20 sm:pt-[4.5rem] lg:pt-24 pb-12 lg:pb-16",
          containerClassName ?? "max-w-4xl text-center"
        )}
      >
        <PageHeroReveal entrance={entrance}>{children}</PageHeroReveal>
      </div>
    </section>
  );
}

export function PageSection({
  isDark,
  sectionIndex = 0,
  bg,
  entrance,
  className,
  containerClassName,
  children,
}: {
  isDark: boolean;
  sectionIndex?: number;
  bg?: SectionBgVariant;
  entrance?: SectionEntrance;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  const preset = PAGE_SECTION_PRESETS[sectionIndex % PAGE_SECTION_PRESETS.length];
  const bgVariant = bg ?? preset.bg;
  const entranceVariant = entrance ?? preset.entrance;

  return (
    <SectionShell
      bg={bgVariant}
      isDark={isDark}
      className={cn("py-12 lg:py-16", className)}
    >
      <div
        className={cn(
          "container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl",
          containerClassName
        )}
      >
        <SectionReveal entrance={entranceVariant}>{children}</SectionReveal>
      </div>
    </SectionShell>
  );
}
