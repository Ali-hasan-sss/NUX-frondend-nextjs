import { axiosInstance } from "@/utils/axiosInstance";
import type {
  CreateGroupPayload,
  GroupDetails,
  InvitePayload,
  JoinRequest,
  RemoveMemberPayload,
  RestaurantGroup,
  RestaurantMinimal,
  UpdateGroupPayload,
} from "./groupsTypes";

export const groupsService = {
  async getMyJoinRequests(): Promise<JoinRequest[]> {
    const res = await axiosInstance.get("/groups/JoinRequests");
    return res.data.data as JoinRequest[];
  },

  async createGroup(payload: CreateGroupPayload): Promise<RestaurantGroup> {
    const res = await axiosInstance.post("/groups", payload);
    return res.data.data as RestaurantGroup;
  },

  async updateGroup(payload: UpdateGroupPayload): Promise<RestaurantGroup> {
    const res = await axiosInstance.put(`/groups/${payload.groupId}`, {
      name: payload.name,
      description: payload.description,
    });
    return res.data.data as RestaurantGroup;
  },

  async getGroupDetails(groupId: string): Promise<GroupDetails> {
    const res = await axiosInstance.get(`/groups/${groupId}`);
    const api = res.data?.data;
    const owner = api.owner as RestaurantMinimal;
    const members = Array.isArray(api.members)
      ? api.members.map((m: any) => ({
          id: m.id,
          name: m.name,
          address: m.address,
        }))
      : [];
    return {
      id: api.id,
      name: api.name,
      description: api.description,
      owner,
      members,
    } as GroupDetails;
  },

  async getGroupMembers(groupId: string): Promise<RestaurantMinimal[]> {
    const res = await axiosInstance.get(`/groups/members/${groupId}`);
    const api = res.data?.data;
    return api?.members ?? [];
  },

  async removeMember(payload: RemoveMemberPayload): Promise<void> {
    await axiosInstance.delete("/groups/remove", { data: payload });
  },

  async sendInvite(payload: InvitePayload): Promise<any> {
    const res = await axiosInstance.post("/groups/invite", payload);
    return res.data?.data;
  },

  async respondInvite(
    requestId: number,
    status: "ACCEPTED" | "REJECTED"
  ): Promise<any> {
    const res = await axiosInstance.put(`/groups/respond/${requestId}`, {
      status,
    });
    return res.data?.data;
  },
};
