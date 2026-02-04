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
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { AppDispatch, RootState } from "@/app/store";
import { fetchAdminOverview } from "@/features/admin/overview/adminOverviewThunks";
import { useLanguage } from "@/hooks/use-language";

export function AdminOverview() {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const { stats, recentActivities, isLoading, error } = useSelector(
    (state: RootState) => state.adminOverview
  );

  useEffect(() => {
    dispatch(fetchAdminOverview());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminDashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("adminDashboardDescription")}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>{t("loadingDashboardData")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminDashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("adminDashboardDescription")}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">
            {t("errorLoadingDashboard")}: {error}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("adminDashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("adminDashboardDescription")}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>{t("noDataAvailable")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("adminDashboard")}
        </h1>
        <p className="text-muted-foreground">
          {t("adminDashboardDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("totalUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{stats.newSignupsThisWeek}
              </span>{" "}
              {t("newThisWeek")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("activeRestaurants")}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRestaurants.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{stats.newRestaurantsThisWeek}
              </span>{" "}
              {t("newThisWeek")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("activeSubscriptions")}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeSubscriptions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stats.expiredSubscriptions}</span>{" "}
              {t("expired")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("monthlyRevenue")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("totalRevenueFromInvoices")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("subscriptionHealth")}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.subscriptionHealth}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t("activeSubscriptionRate")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("alerts")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.expiredSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("requireAttention")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
          <CardDescription>{t("latestUpdatesFromPlatform")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("noRecentActivity")}
              </p>
            ) : (
              recentActivities.map((activity) => (
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
                    {activity.status === "error" && (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
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
                  <Badge
                    variant={
                      activity.status === "success"
                        ? "default"
                        : activity.status === "warning"
                        ? "destructive"
                        : activity.status === "error"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {activity.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
