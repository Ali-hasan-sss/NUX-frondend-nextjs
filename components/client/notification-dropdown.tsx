"use client";

import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";

interface NotificationDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDropdown({
  open,
  onOpenChange,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // TODO: Load notifications
  useEffect(() => {
    // Load notifications logic here
  }, []);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        style={{
          backgroundColor: "rgba(26, 31, 58, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.15)",
        }}
      >
        <div className="p-4 border-b border-white/15">
          <h3 className="text-white font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-white/75">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <p className="text-white text-sm">{notification.message}</p>
                  <p className="text-white/50 text-xs mt-1">
                    {notification.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
