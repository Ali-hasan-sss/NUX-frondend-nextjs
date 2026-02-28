"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ClientTabs } from "@/components/client/client-tabs";
import { ClientSidebar } from "@/components/client/client-sidebar";
import { ClientHeader } from "@/components/client/client-header";
import { AnimatedBackground } from "@/components/client/animated-background";
import { I18nProvider } from "@/components/client/i18n-provider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="USER">
      <I18nProvider>
        <AnimatedBackground>
          <div className="flex flex-col md:flex-row h-screen bg-transparent overflow-hidden">
            {/* Sidebar - desktop only */}
            <ClientSidebar />

            {/* Main area: Header + Content */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              {/* Header - visible on mobile; on desktop it's in the content area */}
              <ClientHeader />

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
                <div className="w-full max-w-4xl mx-auto">
                  {children}
                </div>
              </div>

              {/* Bottom Tabs - mobile only */}
              <ClientTabs />
            </div>
          </div>
        </AnimatedBackground>
      </I18nProvider>
    </ProtectedRoute>
  );
}
