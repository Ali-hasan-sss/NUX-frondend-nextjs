import type React from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto">
          {" "}
          <div className="sticky left-80 md:left-0 top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-2 pr-1">
                <Image
                  src="/placeholder-logo.svg"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="rounded"
                />
                <span className="text-sm font-medium">NUX</span>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
