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
import { registerRestaurant } from "@/features/auth/authThunks";
import { clearError } from "@/features/auth/authSlice";
import { Eye, EyeOff, Loader2, MapPin } from "lucide-react";
import GoogleMapPicker from "@/components/common/GoogleMapPicker";
import FileUploader from "@/components/upload/file-uploader";
import { useTranslation } from "react-i18next";

export function RegisterForm() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    restaurantName: "",
    address: "",
    latitude: 0,
    longitude: 0,
    logo: "",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      const result = await dispatch(registerRestaurant(formData));
      if (registerRestaurant.fulfilled.match(result)) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationSelect = () => {
    setShowMapPicker(true);
  };

  const handleLocationConfirm = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    setFormData({
      ...formData,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
    setShowMapPicker(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Restaurant Account</CardTitle>
        <CardDescription>
          Join NUX and start building customer loyalty
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {t("landing.auth.registerFailedCheckInfo")}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantName">Restaurant Name</Label>
            <Input
              id="restaurantName"
              name="restaurantName"
              type="text"
              placeholder="Your restaurant name"
              value={formData.restaurantName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <FileUploader
              label="Restaurant Logo (Optional)"
              value={formData.logo}
              onChange={(url) =>
                setFormData((prev) => ({ ...prev, logo: url || "" }))
              }
              accept="image/*"
              maxSizeMb={5}
              meta={{
                folder: "restaurant-logos",
                entityType: "restaurant",
              }}
              rounded="md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Restaurant Address</Label>
            <div className="flex space-x-2">
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={handleChange}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleLocationSelect}
                className="bg-transparent"
                title="Select location on map"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            {formData.latitude !== 0 && formData.longitude !== 0 && (
              <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    Location selected:
                  </span>
                </div>
                <div className="mt-1">
                  Lat: {formData.latitude.toFixed(6)}, Lng:{" "}
                  {formData.longitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>

        {/* Google Map Picker Modal */}
        <GoogleMapPicker
          open={showMapPicker}
          onOpenChange={setShowMapPicker}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          onSelect={handleLocationConfirm}
        />
      </CardContent>
    </Card>
  );
}
