"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, Users, TrendingUp, Bell, Star, Mail } from "lucide-react";
import { AppDispatch, RootState } from "@/app/store";
import { fetchRestaurantOverview } from "@/features/restaurant/overview/restaurantOverviewThunks";
import { useTranslation } from "react-i18next";

export function RestaurantOverview() {
  const { t } = useTranslation();
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
            {t("dashboard.overview.welcomeBack")}, {user?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.overview.whatsHappeningToday")} {user?.restaurantName} {t("dashboard.overview.today")}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>{t("dashboard.overview.loadingDashboardData")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("dashboard.overview.welcomeBack")}, {user?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.overview.whatsHappeningToday")} {user?.restaurantName} {t("dashboard.overview.today")}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{t("dashboard.overview.errorLoadingDashboard")}: {error}</p>
        </div>
      </div>
    );
  }

  if (!stats || !restaurant) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("dashboard.overview.welcomeBack")}, {user?.fullName}!
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.overview.whatsHappeningToday")} {user?.restaurantName} {t("dashboard.overview.today")}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>{t("dashboard.overview.noDataAvailable")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("dashboard.overview.welcomeBack")}, {user?.fullName}!
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.overview.whatsHappeningToday")} {restaurant.name} {t("dashboard.overview.today")}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild className="flex items-center space-x-2">
          <Link href="/dashboard/qr-codes">
            <QrCode className="h-4 w-4" />
            <span>{t("dashboard.overview.generateQRCode")}</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex items-center space-x-2 bg-transparent"
        >
          <Link href="/dashboard/groups">
            <Users className="h-4 w-4" />
            <span>{t("dashboard.overview.inviteRestaurant")}</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex items-center space-x-2 bg-transparent"
        >
          <Link href="/dashboard/notifications">
            <Bell className="h-4 w-4" />
            <span>{t("dashboard.overview.viewNotifications")}</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="flex items-center space-x-2 bg-transparent"
        >
          <Link href="/dashboard/groups">
            <Mail className="h-4 w-4" />
            <span>{t("dashboard.groups.pendingInvites")}</span>
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.overview.qrCodeScans")}</CardTitle>
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
              {t("dashboard.overview.fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.overview.loyaltyPointsIssued")}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.loyaltyPointsIssued.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.overview.totalPointsIssued")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.overview.groupMembers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groupMembers}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.overview.totalGroupMemberships")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.overview.monthlyRevenue")}
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
              {t("dashboard.overview.fromLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.overview.activeCustomers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.overview.customersWhoScanned")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.overview.averageRating")}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.overview.basedOnReviews")} 156 {t("dashboard.overview.reviews")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.overview.recentActivity")}</CardTitle>
          <CardDescription>{t("dashboard.overview.latestUpdates")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.overview.noRecentActivity")}
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
                        +{activity.points} {t("dashboard.overview.pts")}
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
