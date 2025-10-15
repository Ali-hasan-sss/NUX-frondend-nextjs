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

  // If user is logged in and is a regular user, show client dashboard
  if (isAuthenticated && user?.role === "USER") {
    return <ClientDashboard />;
  }

  // Otherwise show landing page
  return (
    <div className="min-h-screen bg-background">
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
