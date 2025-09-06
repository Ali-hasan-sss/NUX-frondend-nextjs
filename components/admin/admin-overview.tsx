"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Mock data - in real app, this would come from API
const stats = {
  totalUsers: 1247,
  totalRestaurants: 523,
  activeSubscriptions: 456,
  revenue: 45670,
  expiredSubscriptions: 12,
  newSignups: 34,
};

const recentActivity = [
  {
    id: 1,
    type: "subscription",
    message: "New subscription: Pizza Palace upgraded to Professional",
    time: "2 hours ago",
    status: "success",
  },
  {
    id: 2,
    type: "user",
    message: "New restaurant registered: Burger House",
    time: "4 hours ago",
    status: "info",
  },
  {
    id: 3,
    type: "alert",
    message: "Subscription expired: Taco Bell (Professional Plan)",
    time: "6 hours ago",
    status: "warning",
  },
  {
    id: 4,
    type: "subscription",
    message: "Payment successful: Sushi Master renewed Enterprise plan",
    time: "8 hours ago",
    status: "success",
  },
];

export function AdminOverview() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your restaurant subscription platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.newSignups}</span> new
              this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Restaurants
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRestaurants.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeSubscriptions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stats.expiredSubscriptions}</span>{" "}
              expired
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
              ${stats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Subscription Health
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.4%</div>
            <p className="text-xs text-muted-foreground">
              Active subscription rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.expiredSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {activity.status === "success" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {activity.status === "warning" && (
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  )}
                  {activity.status === "info" && (
                    <Users className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
                <Badge
                  variant={
                    activity.status === "success"
                      ? "default"
                      : activity.status === "warning"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
