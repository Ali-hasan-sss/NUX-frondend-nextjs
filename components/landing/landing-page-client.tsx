"use client";

import { useAppSelector } from "@/app/hooks";
import { Hero } from "@/components/landing/hero";
import { PlatformIntro } from "@/components/landing/platform-intro";
import { Features } from "@/components/landing/features";
import { FeatureSections } from "@/components/landing/feature-sections";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { AppPurposeSection } from "@/components/landing/app-purpose-section";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { I18nProvider } from "@/components/client/i18n-provider";

export function LandingPageClient() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isAuthenticated && user?.role === "USER") {
    if (typeof window !== "undefined") {
      window.location.href = "/client/home";
      return null;
    }
  }

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  return (
    <I18nProvider>
      <div
        className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${
          isDark
            ? "bg-gradient-to-b from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]"
            : "bg-gradient-to-b from-gray-50 via-white to-gray-100"
        }`}
      >
        <Header />
        <main>
          <Hero />
          <PlatformIntro />
          <Features />
          <FeatureSections />
          <HowItWorks />
          <Pricing />
          <CTA />
          <AppPurposeSection />
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
}
