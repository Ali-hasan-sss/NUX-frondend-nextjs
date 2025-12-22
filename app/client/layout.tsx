"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { ClientTabs } from "@/components/client/client-tabs";
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
          <div className="flex flex-col h-screen bg-transparent overflow-hidden">
            {/* Header */}
            <ClientHeader />

            {/* Main Content with Tabs */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto">{children}</div>

              {/* Bottom Tabs Navigation */}
              <ClientTabs />
            </div>
          </div>
        </AnimatedBackground>
      </I18nProvider>
    </ProtectedRoute>
  );
}
