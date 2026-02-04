export type SubAdminPermissionType =
  | "MANAGE_USERS"
  | "MANAGE_PLANS"
  | "MANAGE_RESTAURANTS"
  | "MANAGE_SUBSCRIPTIONS";

export interface SubAdminUser {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SubAdminItem {
  id: string;
  userId: string;
  addedByUserId: string;
  createdAt: string;
  user: SubAdminUser;
  permissions: SubAdminPermissionType[];
}

export interface CreateSubAdminRequest {
  email: string;
  password: string;
  fullName?: string;
  permissions: SubAdminPermissionType[];
}

export interface UpdateSubAdminRequest {
  permissions: SubAdminPermissionType[];
}

export interface AdminPermissionsState {
  permissions: SubAdminPermissionType[];
  role: "ADMIN" | "SUBADMIN" | null;
  isLoading: boolean;
  error: string | null;
}
