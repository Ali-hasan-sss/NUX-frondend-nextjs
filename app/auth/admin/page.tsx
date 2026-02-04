import Image from "next/image";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:bg-gradient-to-b dark:from-[#0A0E27] dark:via-[#1A1F3A] dark:to-[#2D1B4E]">
      {/* Subtle gradient orbs for visual identity */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-72 h-72 rounded-full bg-secondary/10 dark:bg-secondary/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-2xl border border-border bg-card/80 dark:bg-card/60 shadow-lg p-3 mb-4">
            <Image
              src="/images/logo.png"
              alt="NUX"
              width={80}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
          <p className="text-muted-foreground mt-1">
            Sign in to the admin panel
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
