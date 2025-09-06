import type React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RestaurantSidebar } from "@/components/restaurant/restaurant-sidebar";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="RESTAURANT_OWNER">
      <div className="flex h-screen bg-background">
        <RestaurantSidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
