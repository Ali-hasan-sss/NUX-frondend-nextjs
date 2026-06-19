"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STAR_LAYOUT = [
  { top: "6%", left: "10%", size: 12, delay: 0, duration: 14 },
  { top: "14%", left: "72%", size: 16, delay: 0.8, duration: 18 },
  { top: "28%", left: "88%", size: 10, delay: 1.6, duration: 12 },
  { top: "42%", left: "5%", size: 14, delay: 2.2, duration: 16 },
  { top: "55%", left: "92%", size: 11, delay: 0.4, duration: 20 },
  { top: "68%", left: "18%", size: 9, delay: 1.2, duration: 15 },
  { top: "78%", left: "65%", size: 13, delay: 2.8, duration: 17 },
  { top: "35%", left: "45%", size: 8, delay: 3.4, duration: 22 },
  { top: "82%", left: "42%", size: 10, delay: 1.8, duration: 13 },
  { top: "20%", left: "32%", size: 7, delay: 2.6, duration: 19 },
  { top: "48%", left: "78%", size: 12, delay: 3.8, duration: 16 },
  { top: "62%", left: "52%", size: 9, delay: 0.6, duration: 21 },
] as const;

function FloatingStar({
  top,
  left,
  size,
  delay,
  duration,
  isDark,
}: {
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
  isDark: boolean;
}) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="absolute pointer-events-none"
      style={{ top, left }}
      animate={{
        y: [0, -18, 0, 12, 0],
        x: [0, 8, -6, 4, 0],
        opacity: [0.25, 0.9, 0.5, 0.85, 0.25],
        rotate: [0, 90, 180, 270, 360],
        scale: [0.85, 1.15, 1, 1.1, 0.85],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
        delay,
      }}
      aria-hidden
    >
      <path
        fill={isDark ? "rgba(255,255,255,0.75)" : "rgba(168,85,247,0.55)"}
        d="M12 2l2.4 4.86L20 8.18l-4 3.9.94 5.52L12 15.77l-4.94 2.83.94-5.52-4-3.9 5.6-.32L12 2z"
      />
    </motion.svg>
  );
}

export function MarketingHeroBackground({ isDark }: { isDark: boolean }) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-500",
          isDark
            ? "bg-gradient-to-br from-[#070B1F] via-[#121833] to-[#1E1040]"
            : "bg-gradient-to-br from-slate-50 via-violet-50/80 to-cyan-50"
        )}
      />

      <div
        className={cn(
          "absolute inset-0 opacity-40",
          isDark
            ? "bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(255,107,157,0.18),transparent),radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(0,217,255,0.12),transparent)]"
            : "bg-[radial-gradient(ellipse_80%_60%_at_20%_40%,rgba(168,85,247,0.12),transparent),radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(0,217,255,0.1),transparent)]"
        )}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-violet-500/25 to-pink-500/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -25, 0], scale: [1.05, 1, 1.05] }}
          transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-tl from-cyan-500/20 to-purple-500/15 blur-3xl"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(90vw,42rem)] h-[min(90vw,42rem)] rounded-full border border-cyan-400/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(70vw,32rem)] h-[min(70vw,32rem)] rounded-full border border-pink-400/10"
        />

        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className={cn(
              "absolute w-1.5 h-1.5 rounded-full",
              isDark ? "bg-cyan-400/40" : "bg-violet-400/50"
            )}
            style={{
              top: `${15 + i * 14}%`,
              left: `${8 + (i % 3) * 40}%`,
            }}
            animate={{
              opacity: [0.2, 0.7, 0.2],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}

        {STAR_LAYOUT.map((star, i) => (
          <FloatingStar key={i} {...star} isDark={isDark} />
        ))}
      </div>
    </>
  );
}
