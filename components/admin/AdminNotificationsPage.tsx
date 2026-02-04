"use client";

import { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminNotificationsService } from "@/features/admin/notifications/adminNotificationsService";
import type { AdminNotificationAudience } from "@/features/admin/notifications/adminNotificationsService";
import { Loader2 } from "lucide-react";
import NotificationsPage from "@/components/notifications/NotificationsPage";

export function AdminNotificationsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AdminNotificationAudience>("all");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError(t("notificationTitleLabel") + " " + t("create"));
      return;
    }
    setSending(true);
    try {
      const result = await adminNotificationsService.send({
        title: title.trim(),
        body: body.trim() || title.trim(),
        audience,
      });
      toast({
        title: t("success"),
        description: t("notificationSentSuccess") + ` (${result.count})`,
      });
      setTitle("");
      setBody("");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ?? t("notificationSendError");
      setError(message);
      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("notifications")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("sendNotificationDescription")}
        </p>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          {t("adminNotificationsSectionSend")}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("sendNotification")}</CardTitle>
            <CardDescription>
              {t("sendNotificationDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="notification-title">
                  {t("notificationTitleLabel")} *
                </Label>
                <Input
                  id="notification-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("notificationTitleLabel")}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notification-body">
                  {t("notificationBodyLabel")}
                </Label>
                <textarea
                  id="notification-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={t("notificationBodyLabel")}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("audience")}</Label>
                <Select
                  value={audience}
                  onValueChange={(v) =>
                    setAudience(v as AdminNotificationAudience)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("audienceAll")}</SelectItem>
                    <SelectItem value="restaurant_owners">
                      {t("audienceRestaurantOwners")}
                    </SelectItem>
                    <SelectItem value="subadmins">
                      {t("audienceSubadmins")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={sending}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("sendNotificationButton")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          {t("adminNotificationsSectionList")}
        </h2>
        <NotificationsPage embedded />
      </section>
    </div>
  );
}
