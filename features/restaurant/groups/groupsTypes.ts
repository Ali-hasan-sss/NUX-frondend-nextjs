export interface RestaurantMinimal {
  id: string;
  name: string;
  address: string;
}

export interface RestaurantGroup {
  id: string;
  name: string;
  description: string;
  owner?: RestaurantMinimal;
}

export interface GroupDetails {
  id: string;
  name: string;
  description: string;
  owner: RestaurantMinimal;
  members: RestaurantMinimal[];
}

export interface JoinRequest {
  id: number;
  status: string;
  createdAt: string;
  respondedAt?: string | null;
  group?: { id: string; name: string; description: string; ownerId: string };
  fromRestaurant?: { id: string; name: string };
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
}

export interface UpdateGroupPayload {
  groupId: string;
  name?: string;
  description?: string;
}

export interface InvitePayload {
  groupId: string;
  toRestaurantId: string;
}

export interface RespondPayload {
  requestId: number;
  status: "ACCEPTED" | "REJECTED";
}

export interface RemoveMemberPayload {
  groupId: string;
  restaurantId: string;
}

export interface RestaurantGroupsState {
  myGroup: RestaurantGroup | null;
  groupDetails: GroupDetails | null;
  members: RestaurantMinimal[];
  joinRequests: JoinRequest[];
  isLoading: boolean;
  error: string | null;
  errorCode: string | null;
}
