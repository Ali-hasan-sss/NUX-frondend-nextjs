import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { Suspense } from "react";
import { Cairo, Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: "--font-cairo",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const siteDescription =
  "NUX is a hospitality platform with a guest mobile app and restaurant web dashboard. Guests scan QR codes, view digital menus, pay with a wallet, and get promotions. Restaurants manage menus, orders, and payments on nuxapp.de.";

export const metadata: Metadata = {
  title: "NUX — Guest App & Restaurant Platform",
  description: siteDescription,
  openGraph: {
    title: "NUX — Guest App & Restaurant Platform",
    description: siteDescription,
    url: "https://nuxapp.de",
    siteName: "NUX",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cairo.variable} ${poppins.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <Providers>{children}</Providers>
          </Suspense>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
