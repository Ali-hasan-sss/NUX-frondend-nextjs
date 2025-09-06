"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { initializeAuth, logout } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "RESTAURANT_OWNER";
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const user = auth?.user ?? null;
  const isLoading = auth.isLoading;

  useEffect(() => {
    if (auth.isLoading) {
      dispatch(initializeAuth());
    }
  }, [dispatch, auth.isLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && user.role !== "ADMIN" && user.role !== "RESTAURANT_OWNER") {
    const handleBackHome = () => {
      dispatch(logout());
      router.push("/");
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <p className="text-red-600 dark:text-red-400 font-semibold text-lg mb-6">
          You cannot log in from the web interface. <br />
          Please use the mobile application.
        </p>
        <Button onClick={handleBackHome} variant="default" className="px-6">
          Back to Home
        </Button>
      </div>
    );
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
