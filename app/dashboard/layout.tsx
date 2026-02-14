"use client";

import { useState, type ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RestaurantSidebar } from "@/components/restaurant/restaurant-sidebar";
import { I18nProvider } from "@/components/client/i18n-provider";
import { DashboardHeader } from "@/components/restaurant/dashboard-header";

export default function RestaurantLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <I18nProvider>
      <ProtectedRoute requiredRole="RESTAURANT_OWNER">
        <div className="flex h-screen bg-background">
          <RestaurantSidebar
            open={sidebarOpen}
            onOpenChange={setSidebarOpen}
          />
          <main className="flex-1 overflow-y-auto">
            <DashboardHeader onOpenSidebar={() => setSidebarOpen(true)} />
            <div className="p-3 md:p-4">{children}</div>
          </main>
        </div>
      </ProtectedRoute>
    </I18nProvider>
  );
}
