import type React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { RestaurantSidebar } from "@/components/restaurant/restaurant-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="RESTAURANT_OWNER">
      <div className="flex h-screen bg-background">
        <RestaurantSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="sticky left-80 md:left-0 top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
            <div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border-b">
              <div className="flex items-center gap-1 sm:gap-2 pr-1 min-w-0 lg:pl-0 pl-14">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="rounded"
                />
                <span className="text-sm font-medium hidden sm:inline">
                  NUX
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
          <div className="p-3 md:p-4">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
