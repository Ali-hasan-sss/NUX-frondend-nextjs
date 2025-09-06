"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loginAdmin } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error } = useAppSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      setSubmitting(true);
      const result = await dispatch(loginAdmin(formData));
      if (loginAdmin.fulfilled.match(result)) {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Admin login failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Admin Login</CardTitle>
        </div>
        <CardDescription>Access the administrative panel</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@restauranthub.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In as Admin
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to regular login
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
