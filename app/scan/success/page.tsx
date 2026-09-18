"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Coffee, Star, UtensilsCrossed } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nProvider } from "@/components/client/i18n-provider";
import { Header } from "@/components/landing/header";
import { Button } from "@/components/ui/button";
import { getAuthenticatedAppHome } from "@/lib/roleDashboard";

const BURST = [
  { x: -88, y: -36, delay: 0.12, rotate: -20 },
  { x: 92, y: -28, delay: 0.18, rotate: 18 },
  { x: -64, y: 70, delay: 0.22, rotate: -8 },
  { x: 70, y: 78, delay: 0.28, rotate: 14 },
  { x: 0, y: -96, delay: 0.16, rotate: 0 },
  { x: -110, y: 18, delay: 0.3, rotate: -28 },
  { x: 118, y: 12, delay: 0.34, rotate: 24 },
];

function ScanSuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const kind = searchParams.get("type") === "drink" ? "drink" : "meal";
  const restaurant = (searchParams.get("restaurant") ?? "").trim();
  const isDrink = kind === "drink";

  const title = isDrink ? t("scan.successDrinkTitle") : t("scan.successMealTitle");
  const message = restaurant
    ? t(isDrink ? "scan.successDrinkAt" : "scan.successMealAt", { restaurant })
    : t(isDrink ? "scan.successDrinkMessage" : "scan.successMealMessage");

  const particles = useMemo(() => BURST, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative mx-auto flex max-w-md flex-col items-center overflow-hidden px-4 pt-10 pb-16 text-center">
        <div className="relative mb-8 flex h-48 w-full items-center justify-center">
          {particles.map((p, i) => (
            <motion.span
              key={i}
              className="absolute text-amber-400"
              initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0.2, 1, 0.6], x: p.x, y: p.y, rotate: p.rotate }}
              transition={{ duration: 1.15, delay: p.delay, ease: "easeOut" }}
            >
              <Star className="h-4 w-4 fill-current" />
            </motion.span>
          ))}

          <motion.div
            className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 320, damping: 14 }}
            >
              <Check className="h-14 w-14" strokeWidth={2.6} />
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute -right-1 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
            initial={{ scale: 0, y: 18 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 280, damping: 14 }}
          >
            {isDrink ? (
              <Coffee className="h-7 w-7" />
            ) : (
              <UtensilsCrossed className="h-7 w-7" />
            )}
          </motion.div>

          <motion.div
            className="absolute -left-2 bottom-8 rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-amber-950 shadow"
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 240, damping: 12 }}
          >
            +1
          </motion.div>
        </div>

        <motion.h1
          className="text-2xl font-semibold"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="mt-2 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>

        <motion.div
          className="mt-8 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
        >
          <Button asChild className="w-full">
            <Link href={getAuthenticatedAppHome("USER")}>{t("scan.done")}</Link>
          </Button>
        </motion.div>
      </main>
    </div>
  );
}

export default function ScanSuccessPage() {
  return (
    <I18nProvider>
      <Suspense fallback={null}>
        <ScanSuccessContent />
      </Suspense>
    </I18nProvider>
  );
}
