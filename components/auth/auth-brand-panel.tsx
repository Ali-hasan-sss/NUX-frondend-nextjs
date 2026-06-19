"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  SectionBackground,
  type SectionBgVariant,
  entranceVariants,
} from "@/components/landing/section-motion";

type AuthBrandPanelProps = {
  isDark: boolean;
  bg?: SectionBgVariant;
  title: string;
  subtitle?: string;
};

export function AuthBrandPanel({
  isDark,
  bg = "glow",
  title,
  subtitle,
}: AuthBrandPanelProps) {
  const logoSectionGradient = isDark
    ? "linear-gradient(135deg, #0A0E27 0%, #1A1F3A 35%, #2D1B4E 50%, #1A1F3A 75%, #0A0E27 100%)"
    : "linear-gradient(135deg, rgba(0,217,255,0.45) 0%, rgba(255,107,157,0.4) 30%, rgba(0,217,255,0.55) 50%, rgba(255,107,157,0.4) 70%, rgba(0,217,255,0.45) 100%)";

  return (
    <section className="hidden lg:flex relative flex-col items-center justify-center min-h-screen w-full px-6 py-24 order-1 lg:order-2 overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient-brand"
        style={{
          backgroundImage: logoSectionGradient,
          backgroundSize: "200% 200%",
          backgroundPosition: "0% 50%",
          backgroundColor: isDark ? "#0A0E27" : "rgba(0,217,255,0.2)",
        }}
        aria-hidden
      />
      <SectionBackground variant={bg} isDark={isDark} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={entranceVariants["expand"]}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center justify-center text-center max-w-md mx-auto"
      >
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 p-3 sm:p-4 md:p-5 shadow-xl mb-4 sm:mb-6 transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/images/logo.png"
            alt="NUX"
            width={140}
            height={70}
            className="h-10 sm:h-12 md:h-14 w-auto"
          />
        </Link>
        <p className="text-foreground font-semibold text-base sm:text-xl md:text-2xl">
          {title}
        </p>
        {subtitle && (
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xs">
            {subtitle}
          </p>
        )}
      </motion.div>
    </section>
  );
}

export function AuthFormPanel({
  children,
  className,
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 sm:px-6 sm:py-10 md:px-8 order-2 lg:order-1 bg-background border-t lg:border-t-0 lg:border-e border-border/80",
        className
      )}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={entranceVariants["slide-right"]}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "w-full mx-auto",
          wide ? "max-w-2xl" : "max-w-[340px] sm:max-w-sm md:max-w-md"
        )}
      >
        {children}
      </motion.div>
    </section>
  );
}
