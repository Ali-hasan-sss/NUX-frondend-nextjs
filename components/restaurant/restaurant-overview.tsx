"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Users, TrendingUp, Bell, Star } from "lucide-react";
import { AppDispatch, RootState } from "@/app/store";
import { fetchRestaurantOverview } from "@/features/restaurant/overview/restaurantOverviewThunks";

export function RestaurantOverview() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { restaurant, stats, recentActivities, isLoading, error } = useSelector(
    (state: RootState) => state.restaurantOverview
  );

  useEffect(() => {
    dispatch(fetchRestaurantOverview());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with {user?.restaurantName} today
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with {user?.restaurantName} today
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats || !restaurant) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with {user?.restaurantName} today
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with {restaurant.name} today
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button className="flex items-center space-x-2">
          <QrCode className="h-4 w-4" />
          <span>Generate QR Code</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center space-x-2 bg-transparent"
        >
          <Users className="h-4 w-4" />
          <span>Invite Restaurant</span>
        </Button>
        <Button
          variant="outline"
          className="flex items-center space-x-2 bg-transparent"
        >
          <Bell className="h-4 w-4" />
          <span>View Notifications</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Code Scans</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalQRScans.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{stats.scanGrowthPercentage}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loyalty Points Issued
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.loyaltyPointsIssued.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total points issued to customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groupMembers}</div>
            <p className="text-xs text-muted-foreground">
              Total group memberships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{stats.revenueGrowthPercentage}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Customers who scanned QR codes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              Based on 156 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.type === "qr_scan" && (
                      <QrCode className="h-5 w-5 text-primary" />
                    )}
                    {activity.type === "group_invite" && (
                      <Users className="h-5 w-5 text-secondary" />
                    )}
                    {activity.type === "payment" && (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    )}
                    {activity.type === "customer" && (
                      <Users className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {activity.points && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        +{activity.points} pts
                      </Badge>
                    )}
                    {activity.amount && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        €{activity.amount}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
