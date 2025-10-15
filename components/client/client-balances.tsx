"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchUserBalances } from "@/features/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, Star, MapPin } from "lucide-react";

export function ClientBalances() {
  const dispatch = useAppDispatch();
  const { userBalances, loading, error } = useAppSelector(
    (state) => state.clientBalances
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchUserBalances());
    }
  }, [dispatch, user]);

  if (loading.balances) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading balances...</span>
      </div>
    );
  }

  if (error.balances) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error.balances}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userBalances.length === 0) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              You don't have any balances with restaurants yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">My Restaurant Balances</h2>
        <p className="text-muted-foreground">
          Your balances and stars across different restaurants
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userBalances
          .filter((balance) => balance.restaurant && balance.restaurant.name)
          .map((balance) => (
            <Card
              key={balance.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {balance.restaurant?.name || "Unknown Restaurant"}
                  </CardTitle>
                  <Badge
                    variant={
                      balance.restaurant?.isActive ? "default" : "secondary"
                    }
                  >
                    {balance.restaurant?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {balance.restaurant?.address || "Address not available"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Balance */}
                {balance.balance > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Balance</span>
                    </div>
                    <span className="font-bold text-green-600">
                      ${balance.balance}
                    </span>
                  </div>
                )}

                {/* Meal Stars */}
                {balance.stars_meal > 0 && (
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">Meal Stars</span>
                    </div>
                    <span className="font-bold text-yellow-600">
                      {balance.stars_meal}
                    </span>
                  </div>
                )}

                {/* Drink Stars */}
                {balance.stars_drink > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Drink Stars</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {balance.stars_drink}
                    </span>
                  </div>
                )}

                {/* No balance message */}
                {balance.balance === 0 &&
                  balance.stars_meal === 0 &&
                  balance.stars_drink === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No active balance or stars
                    </p>
                  )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
