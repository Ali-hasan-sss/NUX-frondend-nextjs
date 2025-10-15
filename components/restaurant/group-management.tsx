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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Edit, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  createRestaurantGroup,
  fetchGroupDetails,
  fetchGroupMembers,
  fetchMyJoinRequests,
  removeGroupMember,
  updateRestaurantGroup,
} from "@/features/restaurant/groups/groupsThunks";
import { fetchRestaurantAccount } from "@/features/restaurant/restaurantAccount/restaurantAccountThunks";
import { GroupFormModal } from "./group-form-modal";
import { GroupInvitesManagement } from "./group-invites-management";

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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyJoinRequests());
    dispatch(fetchRestaurantAccount());
  }, [dispatch]);

  const pendingInvites = joinRequests.filter((r) => r.status === "PENDING");

  const handleCreateGroup = async (data: {
    name: string;
    description: string;
  }) => {
    const result = await dispatch(
      createRestaurantGroup({
        name: data.name,
        description: data.description || undefined,
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
      setIsCreateModalOpen(false);
    }
  };

  const handleInviteSent = () => {
    dispatch(fetchMyJoinRequests());
  };

  const handleInviteResponded = () => {
    dispatch(fetchMyJoinRequests());
    if (groupDetails?.id) {
      dispatch(fetchGroupDetails(groupDetails.id));
      dispatch(fetchGroupMembers(groupDetails.id));
    }
  };

  const handleRemoveMember = async (restaurantId: string) => {
    if (!groupDetails?.id) return;
    await dispatch(
      removeGroupMember({ groupId: groupDetails.id, restaurantId })
    );
    dispatch(fetchGroupMembers(groupDetails.id));
  };

  const handleUpdateGroup = async (data: {
    name: string;
    description: string;
  }) => {
    if (!groupDetails?.id) return;
    await dispatch(
      updateRestaurantGroup({
        groupId: groupDetails.id,
        name: data.name || undefined,
        description: data.description || undefined,
      })
    );
    dispatch(fetchGroupDetails(groupDetails.id));
    setIsEditModalOpen(false);
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
            <CardContent>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Group
              </Button>
            </CardContent>
          </Card>
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
              <div className="flex items-center space-x-2">
                <Badge variant={isOwner ? "default" : "secondary"}>
                  {isOwner ? "owner" : "member"}
                </Badge>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
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

      {/* Group Invites Management */}
      <GroupInvitesManagement
        groupId={groupDetails?.id}
        isOwner={isOwner}
        joinRequests={joinRequests}
        onInviteSent={handleInviteSent}
        onInviteResponded={handleInviteResponded}
      />

      {/* Modals */}
      <GroupFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGroup}
        isEdit={false}
        isLoading={isLoading}
      />

      <GroupFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateGroup}
        initialData={{
          name: groupDetails?.name || "",
          description: groupDetails?.description || "",
        }}
        isEdit={true}
        isLoading={isLoading}
      />
    </div>
  );
}
