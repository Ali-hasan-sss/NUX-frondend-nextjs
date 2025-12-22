"use client";

import { useAppSelector } from "@/app/hooks";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { ClientDashboard } from "@/components/client/client-dashboard";

export default function LandingPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // If user is logged in and is a regular user, redirect to client dashboard
  if (isAuthenticated && user?.role === "USER") {
    if (typeof window !== "undefined") {
      window.location.href = "/client/home";
      return null;
    }
  }

  // Otherwise show landing page
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1A1F3A] to-[#2D1B4E]">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
