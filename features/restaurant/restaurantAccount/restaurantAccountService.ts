import { axiosInstance } from "@/utils/axiosInstance";
import type {
  RestaurantAccountInfo,
  UpdateRestaurantAccountRequest,
} from "./restaurantAccountTypes";

export const restaurantAccountService = {
  async getMe(): Promise<RestaurantAccountInfo> {
    const response = await axiosInstance.get("/restaurants/account/me");
    return response.data.data as RestaurantAccountInfo;
  },

  async updateMe(
    payload: UpdateRestaurantAccountRequest
  ): Promise<RestaurantAccountInfo> {
    const response = await axiosInstance.put(
      "/restaurants/account/update",
      payload
    );
    return response.data.data as RestaurantAccountInfo;
  },

  async regenerateQr(): Promise<RestaurantAccountInfo> {
    const response = await axiosInstance.put(
      "/restaurants/account/qr/regenerate"
    );
    return response.data.data as RestaurantAccountInfo;
  },

  async getFloorPlan(): Promise<{ walls: FloorPlanWall[]; elements: FloorPlanElement[] }> {
    const response = await axiosInstance.get("/restaurants/account/floor-plan");
    const raw = response.data?.data?.floorPlan ?? { walls: [], elements: [] };
    return {
      walls: Array.isArray(raw.walls) ? raw.walls : [],
      elements: Array.isArray(raw.elements) ? raw.elements : [],
    };
  },

  async updateFloorPlan(floorPlan: {
    walls: FloorPlanWall[];
    elements: FloorPlanElement[];
  }): Promise<{ walls: FloorPlanWall[]; elements: FloorPlanElement[] }> {
    const response = await axiosInstance.put(
      "/restaurants/account/floor-plan",
      { floorPlan }
    );
    return response.data?.data?.floorPlan ?? floorPlan;
  },
};

export interface FloorPlanWall {
  id: string;
  points: { x: number; y: number }[];
}

export type FloorPlanElementType =
  | "table"
  | "chair"
  | "bar"
  | "barStool"
  | "coffeeMachine"
  | "juiceMachine"
  | "iceCreamMachine"
  | "label";

export interface FloorPlanElement {
  id: string;
  type: FloorPlanElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  label?: string;
  rotation?: number;
}
