import { createSlice } from "@reduxjs/toolkit";
import type { RestaurantGroupsState, RestaurantMinimal } from "./groupsTypes";
import {
  createRestaurantGroup,
  fetchGroupDetails,
  fetchGroupMembers,
  fetchMyJoinRequests,
  removeGroupMember,
  respondGroupInvite,
  sendGroupInvite,
  updateRestaurantGroup,
} from "./groupsThunks";

const initialState: RestaurantGroupsState = {
  myGroup: null,
  groupDetails: null,
  members: [],
  joinRequests: [],
  isLoading: false,
  error: null,
  errorCode: null,
};

export const groupsSlice = createSlice({
  name: "restaurantGroups",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Load join requests
      .addCase(fetchMyJoinRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.errorCode = null;
      })
      .addCase(fetchMyJoinRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.joinRequests = action.payload;
      })
      .addCase(fetchMyJoinRequests.rejected, (state, action) => {
        state.isLoading = false;
        const p = action.payload as { message?: string; code?: string } | undefined;
        state.error = p?.message ?? action.error.message ?? null;
        state.errorCode = p?.code ?? null;
      })

      // Create group
      .addCase(createRestaurantGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRestaurantGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myGroup = action.payload;
      })
      .addCase(createRestaurantGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      // Update group
      .addCase(updateRestaurantGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRestaurantGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.myGroup && state.myGroup.id === action.payload.id) {
          state.myGroup = action.payload;
        }
        if (state.groupDetails && state.groupDetails.id === action.payload.id) {
          state.groupDetails = {
            ...state.groupDetails,
            name: action.payload.name,
            description: action.payload.description,
          };
        }
      })
      .addCase(updateRestaurantGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })

      // Group details
      .addCase(fetchGroupDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groupDetails = action.payload;
        state.members = action.payload.members;
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.isLoading = false;
        const p = action.payload as { message?: string; code?: string } | undefined;
        state.error = p?.message ?? action.error.message ?? null;
        state.errorCode = p?.code ?? state.errorCode;
      })

      // Members
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.members = action.payload;
      })
      .addCase(removeGroupMember.fulfilled, (state, action) => {
        // optimistic update: remove by id from members
        // Caller should re-fetch details for full accuracy
        // No payload, so keep as-is
      })

      // Invites
      .addCase(sendGroupInvite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendGroupInvite.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendGroupInvite.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      })
      .addCase(respondGroupInvite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(respondGroupInvite.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(respondGroupInvite.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ?? action.error.message ?? null;
      });
  },
});

export default groupsSlice.reducer;
