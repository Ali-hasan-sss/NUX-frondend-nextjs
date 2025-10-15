import axios from "axios";
import {
  PublicRestaurant,
  NearbyRestaurant,
  RestaurantsResponse,
  RestaurantsApiResponse,
  GetRestaurantsParams,
  GetNearbyRestaurantsParams,
} from "./publicRestaurantsTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// API endpoints
const ENDPOINTS = {
  RESTAURANTS: `${API_BASE_URL}/restaurants`,
  RESTAURANT_BY_ID: (id: string) => `${API_BASE_URL}/restaurants/${id}`,
  NEARBY_RESTAURANTS: `${API_BASE_URL}/restaurants/nearby`,
} as const;

/**
 * Get all restaurants with pagination and search
 */
export const getRestaurants = async (
  params: GetRestaurantsParams = {}
): Promise<RestaurantsResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const url = `${ENDPOINTS.RESTAURANTS}?${queryParams.toString()}`;
    const response = await axios.get<RestaurantsApiResponse>(url);

    if (response.data.success) {
      return response.data.data as RestaurantsResponse;
    }

    throw new Error(response.data.message || "Failed to fetch restaurants");
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

/**
 * Get a specific restaurant by ID
 */
export const getRestaurantById = async (
  id: string
): Promise<PublicRestaurant> => {
  try {
    const response = await axios.get<RestaurantsApiResponse>(
      ENDPOINTS.RESTAURANT_BY_ID(id)
    );

    if (response.data.success) {
      return response.data.data as PublicRestaurant;
    }

    throw new Error(response.data.message || "Restaurant not found");
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    throw error;
  }
};

/**
 * Get restaurants near a specific location
 */
export const getNearbyRestaurants = async (
  params: GetNearbyRestaurantsParams
): Promise<NearbyRestaurant[]> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append("latitude", params.latitude.toString());
    queryParams.append("longitude", params.longitude.toString());

    if (params.radius) queryParams.append("radius", params.radius.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const url = `${ENDPOINTS.NEARBY_RESTAURANTS}?${queryParams.toString()}`;
    const response = await axios.get<RestaurantsApiResponse>(url);

    if (response.data.success) {
      return response.data.data as NearbyRestaurant[];
    }

    throw new Error(
      response.data.message || "Failed to fetch nearby restaurants"
    );
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error);
    throw error;
  }
};
