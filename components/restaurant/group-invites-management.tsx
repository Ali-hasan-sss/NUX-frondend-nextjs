"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Check, X, Users } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import {
  sendGroupInvite,
  respondGroupInvite,
  fetchMyJoinRequests,
} from "@/features/restaurant/groups/groupsThunks";
import { RestaurantAutocomplete } from "@/components/common/RestaurantAutocomplete";
import { useTranslation } from "react-i18next";

interface GroupInvitesManagementProps {
  groupId?: string;
  isOwner?: boolean;
  joinRequests: any[];
  onInviteSent?: () => void;
  onInviteResponded?: () => void;
}

export function GroupInvitesManagement({
  groupId,
  isOwner,
  joinRequests,
  onInviteSent,
  onInviteResponded,
}: GroupInvitesManagementProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [inviteRestaurantId, setInviteRestaurantId] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  const handleSendInvite = async () => {
    if (!groupId || !selectedRestaurant) return;

    const result = await dispatch(
      sendGroupInvite({
        groupId,
        toRestaurantId: selectedRestaurant.id,
      })
    );

    if (result.type.endsWith("fulfilled")) {
      setInviteRestaurantId("");
      setSelectedRestaurant(null);
      onInviteSent?.();
    }
  };

  const handleAcceptInvite = async (requestId: number) => {
    const result = await dispatch(
      respondGroupInvite({ requestId, status: "ACCEPTED" })
    );

    if (result.type.endsWith("fulfilled")) {
      onInviteResponded?.();
    }
  };

  const handleDeclineInvite = async (requestId: number) => {
    const result = await dispatch(
      respondGroupInvite({ requestId, status: "REJECTED" })
    );

    if (result.type.endsWith("fulfilled")) {
      onInviteResponded?.();
    }
  };

  // Handle restaurant selection
  const handleRestaurantSelect = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setInviteRestaurantId(restaurant.id);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedRestaurant(null);
    setInviteRestaurantId("");
  };

  const pendingInvites = joinRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* Send Invite Section - Only for group owners */}
      {isOwner && groupId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>{t("dashboard.groups.sendGroupInvite")}</span>
            </CardTitle>
            <CardDescription>
              {t("dashboard.groups.inviteOtherRestaurants")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RestaurantAutocomplete
              label={t("dashboard.groups.searchSelectRestaurant")}
              placeholder={t("dashboard.groups.typeRestaurantName")}
              onSelect={handleRestaurantSelect}
              selectedRestaurant={selectedRestaurant}
              onClear={handleClearSelection}
            />

            <Button
              onClick={handleSendInvite}
              disabled={!selectedRestaurant}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {selectedRestaurant
                ? `${t("dashboard.groups.sendInviteTo")} ${selectedRestaurant.name}`
                : t("dashboard.groups.selectRestaurantFirst")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending Invites Section */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{t("dashboard.groups.pendingInvitations")}</span>
              <Badge variant="secondary">{pendingInvites.length}</Badge>
            </CardTitle>
            <CardDescription>
              {isOwner
                ? t("dashboard.groups.invitationsYouSent")
                : t("dashboard.groups.groupsInvitedYou")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {invite.group?.name?.charAt(0) || "G"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {invite.group?.name || t("dashboard.groups.myGroup")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {invite.group?.description || t("dashboard.groups.noDescription")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("dashboard.groups.requestId")}: {invite.id} • {t("dashboard.groups.status")}: {invite.status}
                      </p>
                    </div>
                  </div>

                  {!isOwner && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptInvite(invite.id)}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        {t("dashboard.groups.accept")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeclineInvite(invite.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        {t("dashboard.groups.decline")}
                      </Button>
                    </div>
                  )}

                  {isOwner && <Badge variant="outline">{t("dashboard.groups.sent")}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No invites message */}
      {pendingInvites.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("dashboard.groups.noPendingInvitations")}</h3>
            <p className="text-muted-foreground">
              {isOwner
                ? t("dashboard.groups.noInvitationsSent")
                : t("dashboard.groups.noGroupsInvitedYou")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
