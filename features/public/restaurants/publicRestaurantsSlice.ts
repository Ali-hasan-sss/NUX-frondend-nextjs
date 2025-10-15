import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchRestaurants,
  fetchRestaurantById,
  fetchNearbyRestaurants,
} from "./publicRestaurantsThunks";
import {
  PublicRestaurant,
  NearbyRestaurant,
  RestaurantsResponse,
} from "./publicRestaurantsTypes";

interface PublicRestaurantsState {
  // All restaurants with pagination
  restaurants: PublicRestaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;

  // Single restaurant
  selectedRestaurant: PublicRestaurant | null;

  // Nearby restaurants
  nearbyRestaurants: NearbyRestaurant[];

  // Loading states
  loading: {
    restaurants: boolean;
    selectedRestaurant: boolean;
    nearbyRestaurants: boolean;
  };

  // Error states
  error: {
    restaurants: string | null;
    selectedRestaurant: string | null;
    nearbyRestaurants: string | null;
  };
}

const initialState: PublicRestaurantsState = {
  restaurants: [],
  pagination: null,
  selectedRestaurant: null,
  nearbyRestaurants: [],
  loading: {
    restaurants: false,
    selectedRestaurant: false,
    nearbyRestaurants: false,
  },
  error: {
    restaurants: null,
    selectedRestaurant: null,
    nearbyRestaurants: null,
  },
};

const publicRestaurantsSlice = createSlice({
  name: "publicRestaurants",
  initialState,
  reducers: {
    // Clear all data
    clearAllData: (state) => {
      state.restaurants = [];
      state.pagination = null;
      state.selectedRestaurant = null;
      state.nearbyRestaurants = [];
      state.error = {
        restaurants: null,
        selectedRestaurant: null,
        nearbyRestaurants: null,
      };
    },

    // Clear selected restaurant
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null;
      state.error.selectedRestaurant = null;
    },

    // Clear nearby restaurants
    clearNearbyRestaurants: (state) => {
      state.nearbyRestaurants = [];
      state.error.nearbyRestaurants = null;
    },

    // Clear errors
    clearErrors: (state) => {
      state.error = {
        restaurants: null,
        selectedRestaurant: null,
        nearbyRestaurants: null,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch restaurants
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading.restaurants = true;
        state.error.restaurants = null;
      })
      .addCase(
        fetchRestaurants.fulfilled,
        (state, action: PayloadAction<RestaurantsResponse>) => {
          state.loading.restaurants = false;
          state.restaurants = action.payload.restaurants;
          state.pagination = action.payload.pagination;
          state.error.restaurants = null;
        }
      )
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading.restaurants = false;
        state.error.restaurants =
          action.payload || "Failed to fetch restaurants";
      });

    // Fetch restaurant by ID
    builder
      .addCase(fetchRestaurantById.pending, (state) => {
        state.loading.selectedRestaurant = true;
        state.error.selectedRestaurant = null;
      })
      .addCase(
        fetchRestaurantById.fulfilled,
        (state, action: PayloadAction<PublicRestaurant>) => {
          state.loading.selectedRestaurant = false;
          state.selectedRestaurant = action.payload;
          state.error.selectedRestaurant = null;
        }
      )
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.loading.selectedRestaurant = false;
        state.error.selectedRestaurant =
          action.payload || "Restaurant not found";
      });

    // Fetch nearby restaurants
    builder
      .addCase(fetchNearbyRestaurants.pending, (state) => {
        state.loading.nearbyRestaurants = true;
        state.error.nearbyRestaurants = null;
      })
      .addCase(
        fetchNearbyRestaurants.fulfilled,
        (state, action: PayloadAction<NearbyRestaurant[]>) => {
          state.loading.nearbyRestaurants = false;
          state.nearbyRestaurants = action.payload;
          state.error.nearbyRestaurants = null;
        }
      )
      .addCase(fetchNearbyRestaurants.rejected, (state, action) => {
        state.loading.nearbyRestaurants = false;
        state.error.nearbyRestaurants =
          action.payload || "Failed to fetch nearby restaurants";
      });
  },
});

export const {
  clearAllData,
  clearSelectedRestaurant,
  clearNearbyRestaurants,
  clearErrors,
} = publicRestaurantsSlice.actions;

export default publicRestaurantsSlice.reducer;
