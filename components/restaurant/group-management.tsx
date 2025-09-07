"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Send, Check, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createRestaurantGroup,
  fetchGroupDetails,
  fetchGroupMembers,
  fetchMyJoinRequests,
  respondGroupInvite,
  sendGroupInvite,
  removeGroupMember,
  updateRestaurantGroup,
} from "@/features/restaurant/groups/groupsThunks";
import { fetchRestaurantAccount } from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";

export function GroupManagement() {
  const dispatch = useAppDispatch();
  const { groupDetails, members, joinRequests, isLoading } = useAppSelector(
    (s) => s.restaurantGroups
  );
  const myRestaurantId = useAppSelector((s) => s.restaurantAccount.data?.id);
  const accountGroup = useAppSelector((s) => s.restaurantAccount.data?.group);
  const accountGroupId = accountGroup?.id;
  const accountGroupRole = accountGroup?.role;

  const isOwner = useMemo(() => {
    if (accountGroupRole === "OWNER") return true;
    return Boolean(
      groupDetails &&
        myRestaurantId &&
        groupDetails.owner?.id === myRestaurantId
    );
  }, [groupDetails, myRestaurantId, accountGroupRole]);

  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [inviteRestaurantId, setInviteRestaurantId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    dispatch(fetchMyJoinRequests());
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  useEffect(() => {
    if (groupDetails) {
      setEditName(groupDetails.name);
      setEditDescription(groupDetails.description);
    }
  }, [groupDetails]);

  const pendingInvites = joinRequests.filter((r) => r.status === "PENDING");

  const handleCreateGroup = async () => {
    if (!createName.trim()) return;
    const result = await dispatch(
      createRestaurantGroup({
        name: createName.trim(),
        description: createDescription || undefined,
      })
    );
    if (result.type.endsWith("fulfilled")) {
      const created: any = (result as any).payload;
      if (created?.id) {
        try {
          localStorage.setItem("myGroupId", created.id);
        } catch {}
        dispatch(fetchGroupDetails(created.id));
        dispatch(fetchGroupMembers(created.id));
      }
    }
  };

  const handleAcceptInvite = async (requestId: number) => {
    const res: any = await dispatch(
      respondGroupInvite({ requestId, status: "ACCEPTED" })
    );
    if (res.type.endsWith("fulfilled")) {
      const updated = res.payload;
      const groupId = updated?.groupId || updated?.group?.id;
      if (groupId) {
        try {
          localStorage.setItem("myGroupId", groupId);
        } catch {}
        dispatch(fetchGroupDetails(groupId));
        dispatch(fetchGroupMembers(groupId));
      }
      dispatch(fetchMyJoinRequests());
    }
  };

  const handleDeclineInvite = async (requestId: number) => {
    const res: any = await dispatch(
      respondGroupInvite({ requestId, status: "REJECTED" })
    );
    if (res.type.endsWith("fulfilled")) {
      dispatch(fetchMyJoinRequests());
    }
  };

  const handleInvite = async () => {
    if (!groupDetails?.id || !inviteRestaurantId.trim()) return;
    await dispatch(
      sendGroupInvite({
        groupId: groupDetails.id,
        toRestaurantId: inviteRestaurantId.trim(),
      })
    );
    setInviteRestaurantId("");
  };

  const handleRemoveMember = async (restaurantId: string) => {
    if (!groupDetails?.id) return;
    await dispatch(
      removeGroupMember({ groupId: groupDetails.id, restaurantId })
    );
    dispatch(fetchGroupMembers(groupDetails.id));
  };

  const handleUpdateGroup = async () => {
    if (!groupDetails?.id) return;
    await dispatch(
      updateRestaurantGroup({
        groupId: groupDetails.id,
        name: editName || undefined,
        description: editDescription || undefined,
      })
    );
    dispatch(fetchGroupDetails(groupDetails.id));
  };

  // Sync group details based on account group id
  useEffect(() => {
    if (!accountGroupId) return;
    if (!groupDetails || groupDetails.id !== accountGroupId) {
      try {
        localStorage.setItem("myGroupId", accountGroupId);
      } catch {}
      dispatch(fetchGroupDetails(accountGroupId));
      dispatch(fetchGroupMembers(accountGroupId));
    }
  }, [dispatch, accountGroupId]);

  const hasGroup = Boolean(accountGroupId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Group Management
          </h1>
          <p className="text-muted-foreground">
            Manage your restaurant group and invitations
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">My Group</p>
                <p className="text-2xl font-bold">{groupDetails ? 1 : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Send className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-sm font-medium">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Total Members</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* If no group: show Create + Pending Invites */}
      {!hasGroup && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Create Group</CardTitle>
              <CardDescription>
                Each restaurant can be in only one group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group Name</label>
                  <Input
                    placeholder="e.g., Downtown Food District"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Optional"
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateGroup}
                disabled={isLoading || !createName.trim()}
              >
                Create Group
              </Button>
            </CardContent>
          </Card>

          {pendingInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Groups that invited you to join
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {invite.group?.name ?? invite.group?.id ?? "Group"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Request ID: {invite.id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: {invite.status}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAcceptInvite(invite.id)}
                        >
                          <Check className="mr-1 h-4 w-4" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                          onClick={() => handleDeclineInvite(invite.id)}
                        >
                          <X className="mr-1 h-4 w-4" /> Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* If in a group: show details and management */}
      {groupDetails && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{groupDetails.name}</CardTitle>
                <CardDescription>{groupDetails.description}</CardDescription>
              </div>
              <Badge variant={isOwner ? "default" : "secondary"}>
                {isOwner ? "owner" : "member"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isOwner && (
              <div className="mb-6 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Edit name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <Input
                    placeholder="Edit description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                  <Button onClick={handleUpdateGroup} disabled={isLoading}>
                    Save Changes
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <Input
                    placeholder="Invite restaurantId (UUID)"
                    value={inviteRestaurantId}
                    onChange={(e) => setInviteRestaurantId(e.target.value)}
                  />
                  <Button
                    onClick={handleInvite}
                    disabled={isLoading || !inviteRestaurantId.trim()}
                  >
                    Send Invite
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {members.length} members
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {m.name?.charAt(0) || "R"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {m.address}
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent"
                        onClick={() => handleRemoveMember(m.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
