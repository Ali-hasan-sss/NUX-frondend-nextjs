"use client";

import NotificationsPage from "@/components/notifications/NotificationsPage";

export default function ClientNotificationsPage() {
  return (
    <div className="p-4">
      <NotificationsPage embedded={false} />
    </div>
  );
}
