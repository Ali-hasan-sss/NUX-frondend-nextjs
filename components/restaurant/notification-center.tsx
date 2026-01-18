"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  Trash2,
  QrCode,
  Users,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

// Mock data - in real app, this would come from API
const notifications = [
  {
    id: "notif_1",
    type: "qr_scan",
    title: "New QR Code Scan",
    message:
      "Customer scanned your Table 1 QR code and earned 50 loyalty points",
    time: "5 minutes ago",
    read: false,
    priority: "normal",
  },
  {
    id: "notif_2",
    type: "group_invite",
    title: "Group Invitation Accepted",
    message:
      "Burger Palace has accepted your invitation to join Downtown Food District",
    time: "2 hours ago",
    read: false,
    priority: "normal",
  },
  {
    id: "notif_3",
    type: "payment",
    title: "Payment Reminder",
    message:
      "Your subscription payment is due in 3 days. Please update your payment method.",
    time: "1 day ago",
    read: false,
    priority: "high",
  },
  {
    id: "notif_4",
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Feb 5th from 2-4 AM EST",
    time: "2 days ago",
    read: true,
    priority: "normal",
  },
  {
    id: "notif_5",
    type: "group_invite",
    title: "New Group Invitation",
    message: "Green Garden Cafe has invited you to join Healthy Eats Network",
    time: "3 days ago",
    read: true,
    priority: "normal",
  },
];

export function NotificationCenter() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [notificationList, setNotificationList] = useState(notifications);

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const filteredNotifications = notificationList.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotificationList((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "qr_scan":
        return <QrCode className="h-5 w-5 text-primary" />;
      case "group_invite":
        return <Users className="h-5 w-5 text-secondary" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-red-600" />;
      case "system":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "high") {
      return (
        <Badge variant="destructive" className="text-xs">
          {t("dashboard.notifications.high")}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("dashboard.notifications.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.notifications.stayUpdated")}{" "}
            {unreadCount > 0 && `(${unreadCount} ${t("dashboard.notifications.unread")})`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="bg-transparent"
          >
            <Check className="mr-2 h-4 w-4" />
            {t("dashboard.notifications.markAllRead")}
          </Button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter !== "all" ? "bg-transparent" : ""}
        >
          {t("dashboard.notifications.all")} ({notificationList.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
          className={filter !== "unread" ? "bg-transparent" : ""}
        >
          {t("dashboard.notifications.unreadFilter")} ({unreadCount})
        </Button>
        <Button
          variant={filter === "read" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("read")}
          className={filter !== "read" ? "bg-transparent" : ""}
        >
          {t("dashboard.notifications.readFilter")} ({notificationList.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.notifications.recentNotifications")}</CardTitle>
          <CardDescription>{t("dashboard.notifications.latestUpdates")}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("dashboard.notifications.noNotificationsFound")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors ${
                    !notification.read
                      ? "bg-primary/5 border-primary/20"
                      : "bg-background"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4
                        className={`font-medium ${
                          !notification.read
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      {getPriorityBadge(notification.priority)}
                      {!notification.read && (
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
