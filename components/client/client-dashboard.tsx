"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { fetchUserBalances } from "@/features/client";
import { logout } from "@/features/auth/authSlice";
import { QRScanner } from "./qr-scanner";
import { PaymentForm } from "./payment-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  QrCode,
  Coffee,
  Utensils,
  Wallet,
  Bell,
  Settings,
  Menu,
  Star,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function ClientDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { userBalances, loading } = useAppSelector(
    (state) => state.clientBalances
  );
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (user?.role === "USER") {
      dispatch(fetchUserBalances());
    }
  }, [dispatch, user]);

  if (!user || user.role !== "USER") {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  const handleScanSuccess = (result: any) => {
    // Refresh balances after successful scan
    dispatch(fetchUserBalances());
    setShowQRScanner(false);
  };

  // Calculate total balances
  const totalBalance = userBalances.reduce(
    (sum, balance) => sum + balance.balance,
    0
  );
  const totalMealStars = userBalances.reduce(
    (sum, balance) => sum + balance.stars_meal,
    0
  );
  const totalDrinkStars = userBalances.reduce(
    (sum, balance) => sum + balance.stars_drink,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 md:bg-background">
      {/* Mobile Header */}
      <div className="md:hidden bg-transparent text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Menu className="h-6 w-6" />
            <span className="text-lg font-semibold">LoyaltyApp</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user.fullName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Loyalty Rewards Dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleLogout}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Welcome Section */}
      <div className="md:hidden text-white p-6 pb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="text-purple-100">Loyalty Rewards</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Scan QR Code Button */}
          <Button
            onClick={() => setShowQRScanner(true)}
            className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-lg font-medium"
            disabled={loading.qrScan}
          >
            <QrCode className="h-6 w-6 mr-3" />
            Scan Code
            <div className="ml-auto text-sm opacity-80">
              Scan restaurant QR code
            </div>
          </Button>

          {/* Balance Cards */}
          <div className="space-y-3">
            {/* Drink Points */}
            <Card 
              className="bg-gray-800 border-gray-700 text-white cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => setShowPaymentForm(true)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Coffee className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pay with Drink Points</h3>
                    <p className="text-sm text-gray-400">
                      {totalDrinkStars} points available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meal Points */}
            <Card 
              className="bg-gray-800 border-gray-700 text-white cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => setShowPaymentForm(true)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Utensils className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pay with Meal Points</h3>
                    <p className="text-sm text-gray-400">
                      {totalMealStars} points available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance */}
            <Card 
              className="bg-gray-800 border-gray-700 text-white cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => setShowPaymentForm(true)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pay with Balance</h3>
                    <p className="text-sm text-gray-400">
                      ${totalBalance.toFixed(2)} available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setShowQRScanner(true)}
                      className="h-20 flex flex-col gap-2 bg-purple-600 hover:bg-purple-700"
                      disabled={loading.qrScan}
                    >
                      <QrCode className="h-8 w-8" />
                      <span className="font-medium">Scan QR Code</span>
                      <span className="text-xs opacity-80">
                        Earn loyalty points
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                      onClick={() => {
                        /* TODO: Open payment form */
                      }}
                    >
                      <Wallet className="h-8 w-8" />
                      <span className="font-medium">Make Payment</span>
                      <span className="text-xs text-muted-foreground">
                        Use points or balance
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Restaurant Balances */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    My Restaurant Balances
                  </h2>
                  {userBalances.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No restaurant balances yet. Scan QR codes to start
                      earning!
                    </p>
                  ) : (
                    <div className="grid gap-4">
                      {userBalances.slice(0, 3).map((balance) => (
                        <div
                          key={balance.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {balance.restaurant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {balance.restaurant.name}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {balance.restaurant.address}
                              </p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            {balance.balance > 0 && (
                              <div className="text-sm font-medium text-green-600">
                                ${balance.balance}
                              </div>
                            )}
                            <div className="flex gap-2">
                              {balance.stars_meal > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  {balance.stars_meal}M
                                </Badge>
                              )}
                              {balance.stars_drink > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Coffee className="h-3 w-3 mr-1" />
                                  {balance.stars_drink}D
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {userBalances.length > 3 && (
                        <Button variant="ghost" className="w-full">
                          View All ({userBalances.length - 3} more)
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>

              {/* Total Points Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Total Points</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Balance</span>
                      </div>
                      <span className="font-bold text-green-600">
                        ${totalBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Meal Stars</span>
                      </div>
                      <span className="font-bold text-yellow-600">
                        {totalMealStars}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Drink Stars</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {totalDrinkStars}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={showQRScanner}
        onOpenChange={setShowQRScanner}
        onScanSuccess={handleScanSuccess}
      />

      {/* Payment Form Modal */}
      <PaymentForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        onPaymentSuccess={(result) => {
          dispatch(fetchUserBalances());
          setShowPaymentForm(false);
        }}
      />
    </div>
  );
}
