"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchPublicPlans } from "@/features/public/plans/publicPlansThunks";
import { clearAllData } from "@/features/public/plans/publicPlansSlice";

export function PlansDisplay() {
  const dispatch = useAppDispatch();
  const { plans, loading, error } = useAppSelector((s) => s.publicPlans);

  useEffect(() => {
    // Clear any existing data and fetch fresh plans
    dispatch(clearAllData());
    dispatch(fetchPublicPlans());
  }, [dispatch]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const formatDuration = (duration: number) => {
    if (duration === 1) return "1 month";
    if (duration < 12) return `${duration} months`;
    const years = Math.floor(duration / 12);
    const months = duration % 12;
    if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;
    return `${years} year${years > 1 ? "s" : ""} ${months} month${
      months > 1 ? "s" : ""
    }`;
  };

  if (loading.plans) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading plans...</span>
      </div>
    );
  }

  if (error.plans) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading plans: {error.plans}</p>
        <Button onClick={() => dispatch(fetchPublicPlans())} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">
          No plans available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Choose Your Plan</h2>
        <p className="text-muted-foreground mt-2">
          Select the perfect plan for your restaurant
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.title.toLowerCase().includes("premium") ||
              plan.title.toLowerCase().includes("pro")
                ? "border-primary shadow-lg"
                : ""
            }`}
          >
            {(plan.title.toLowerCase().includes("premium") ||
              plan.title.toLowerCase().includes("pro")) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{plan.title}</CardTitle>
              <CardDescription className="text-sm">
                {plan.description || "No description available"}
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatPrice(plan.price, plan.currency)}
                </span>
                <span className="text-muted-foreground ml-2">
                  / {formatDuration(plan.duration)}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Permissions */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Features & Limits
                </h4>
                <div className="space-y-1">
                  {plan.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="flex-1">
                        {permission.type.replace(/_/g, " ").toLowerCase()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {permission.isUnlimited
                          ? "Unlimited"
                          : permission.value || "N/A"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full"
                variant={
                  plan.title.toLowerCase().includes("premium") ||
                  plan.title.toLowerCase().includes("pro")
                    ? "default"
                    : "outline"
                }
              >
                Choose Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
