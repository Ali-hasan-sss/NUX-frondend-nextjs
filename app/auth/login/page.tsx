"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { I18nProvider } from "@/components/client/i18n-provider";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";

function getRedirectPath(role: string | undefined, emailVerified?: boolean): string {
  if (emailVerified === false || emailVerified === undefined) {
    return "/auth/verify-email";
  }
  if (role === "ADMIN" || role === "SUBADMIN") return "/admin";
  if (role === "RESTAURANT_OWNER") return "/dashboard";
  return "/client/home";
}

function LoginPageContent() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated && user) {
      const path = getRedirectPath(user.role, user.emailVerified);
      if (path === "/auth/verify-email") {
        router.replace(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
      } else {
        router.replace(path);
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || (isAuthenticated && user)) {
    return null;
  }

  const isDark = theme === "dark" || theme === "system";

  /* تدرج ظاهر لقسم اللوجو — ألوان الموقع (سماوي/وردي) أو داكن */
  const logoSectionGradient = isDark
    ? "linear-gradient(135deg, #0A0E27 0%, #1A1F3A 35%, #2D1B4E 50%, #1A1F3A 75%, #0A0E27 100%)"
    : "linear-gradient(135deg, rgba(0,217,255,0.45) 0%, rgba(255,107,157,0.4) 30%, rgba(0,217,255,0.55) 50%, rgba(255,107,157,0.4) 70%, rgba(0,217,255,0.45) 100%)";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300">
      {/* النصف الأول: الفورم — في منتصف الحاوية، متجاوب */}
      <section
        className={cn(
          "flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 sm:px-6 sm:py-10 md:px-8 order-2 lg:order-1 bg-background border-t lg:border-t-0"
        )}
      >
        <div className="w-full max-w-[340px] sm:max-w-sm md:max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8"
          >
            <Home className="h-4 w-4" />
            {t("tabs.home")}
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            {t("landing.auth.welcomeBack")}
          </h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 mb-6 sm:mb-8 text-sm sm:text-base">
            {t("landing.auth.signInDescription")}
          </p>
          <LoginForm />
        </div>
      </section>

      {/* النصف الثاني: اللوجو والعبارة — مخفي على الموبايل، يظهر من lg */}
      <section className="hidden lg:flex relative flex-col items-center justify-center min-h-screen w-full px-6 py-24 order-1 lg:order-2 overflow-hidden">
        {/* طبقة الخلفية المتدرجة — inline لضمان ظهور الألوان */}
        <div
          className="absolute inset-0 animate-gradient-brand"
          style={{
            backgroundImage: logoSectionGradient,
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 50%",
            backgroundColor: isDark ? "#0A0E27" : "rgba(0,217,255,0.2)",
          }}
          aria-hidden
        />
        {/* زخارف خفيفة */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/4 end-1/4 w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-primary/25 blur-3xl animate-orb-float" />
          <div
            className="absolute bottom-1/4 start-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-secondary/20 blur-3xl animate-orb-float"
            style={{ animationDelay: "-4s" }}
          />
          {isDark && (
            <>
              <div className="absolute top-1/2 start-1/2 w-[240px] sm:w-[300px] h-[240px] sm:h-[300px] border border-primary/25 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ring-glow" />
              <div
                className="absolute top-1/2 start-1/2 w-[160px] sm:w-[200px] h-[160px] sm:h-[200px] border border-secondary/25 rounded-full -translate-x-1/2 -translate-y-1/2 animate-ring-glow"
                style={{ animationDelay: "-2s" }}
              />
            </>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-sm border border-white/10 dark:border-white/10 p-3 sm:p-4 md:p-5 shadow-xl mb-4 sm:mb-6 transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/images/logo.png"
              alt="NUX"
              width={140}
              height={70}
              className="h-10 sm:h-12 md:h-14 w-auto"
            />
          </Link>
          <p className="text-foreground font-semibold text-base sm:text-xl md:text-2xl">
            {t("landing.auth.signInDescription")}
          </p>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xs">
            {t("landing.auth.enterCredentials")}
          </p>
        </div>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <I18nProvider>
      <LoginPageContent />
    </I18nProvider>
  );
}
