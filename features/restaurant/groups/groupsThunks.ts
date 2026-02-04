import { createAsyncThunk } from "@reduxjs/toolkit";
import { groupsService } from "./groupsService";
import type {
  CreateGroupPayload,
  GroupDetails,
  InvitePayload,
  JoinRequest,
  RemoveMemberPayload,
  RestaurantGroup,
  RestaurantMinimal,
  RespondPayload,
  UpdateGroupPayload,
} from "./groupsTypes";

const rejectPayload = (e: any, fallback: string) => ({
  message: e?.response?.data?.message ?? e?.message ?? fallback,
  code: e?.response?.data?.code ?? undefined,
});

export const fetchMyJoinRequests = createAsyncThunk<
  JoinRequest[],
  void,
  { rejectValue: { message: string; code?: string } }
>("restaurantGroups/fetchMyJoinRequests", async (_, { rejectWithValue }) => {
  try {
    return await groupsService.getMyJoinRequests();
  } catch (e: any) {
    return rejectWithValue(rejectPayload(e, "Failed to load join requests"));
  }
});

export const createRestaurantGroup = createAsyncThunk<
  RestaurantGroup,
  CreateGroupPayload,
  { rejectValue: string }
>("restaurantGroups/createGroup", async (payload, { rejectWithValue }) => {
  try {
    return await groupsService.createGroup(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to create group");
  }
});

export const updateRestaurantGroup = createAsyncThunk<
  RestaurantGroup,
  UpdateGroupPayload,
  { rejectValue: string }
>("restaurantGroups/updateGroup", async (payload, { rejectWithValue }) => {
  try {
    return await groupsService.updateGroup(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to update group");
  }
});

export const fetchGroupDetails = createAsyncThunk<
  GroupDetails,
  string,
  { rejectValue: { message: string; code?: string } }
>("restaurantGroups/fetchDetails", async (groupId, { rejectWithValue }) => {
  try {
    return await groupsService.getGroupDetails(groupId);
  } catch (e: any) {
    return rejectWithValue(rejectPayload(e, "Failed to load group details"));
  }
});

export const fetchGroupMembers = createAsyncThunk<
  RestaurantMinimal[],
  string,
  { rejectValue: string }
>("restaurantGroups/fetchMembers", async (groupId, { rejectWithValue }) => {
  try {
    return await groupsService.getGroupMembers(groupId);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to load group members");
  }
});

export const removeGroupMember = createAsyncThunk<
  void,
  RemoveMemberPayload,
  { rejectValue: string }
>("restaurantGroups/removeMember", async (payload, { rejectWithValue }) => {
  try {
    await groupsService.removeMember(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to remove member");
  }
});

export const sendGroupInvite = createAsyncThunk<
  any,
  InvitePayload,
  { rejectValue: string }
>("restaurantGroups/sendInvite", async (payload, { rejectWithValue }) => {
  try {
    return await groupsService.sendInvite(payload);
  } catch (e: any) {
    return rejectWithValue(e?.message ?? "Failed to send invite");
  }
});

export const respondGroupInvite = createAsyncThunk<
  any,
  RespondPayload,
  { rejectValue: string }
>(
  "restaurantGroups/respondInvite",
  async ({ requestId, status }, { rejectWithValue }) => {
    try {
      return await groupsService.respondInvite(requestId, status);
    } catch (e: any) {
      return rejectWithValue(e?.message ?? "Failed to respond to invite");
    }
  }
);
